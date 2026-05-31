"use client";

import React, { useState, useEffect } from "react";
import { PremiumGate } from "@/components/premium-gate";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Heart, MapPin, Sparkles, Trash2, Loader2, X, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TimelinePage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timelineInsights, setTimelineInsights] = useState<string[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Memory");
  const [mood, setMood] = useState("Happy");
  const [sentiment, setSentiment] = useState("positive");
  const [score, setScore] = useState(80);

  const fetchMemories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/timeline");
      const data = await res.json();
      if (data.success) {
        // Sort memories by date descending
        const sorted = (data.memories || []).sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setMemories(sorted);
      }
    } catch (err) {
      console.error("Error fetching memories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestAnalysis = async () => {
    try {
      const res = await fetch("/api/latest-analysis?_t=" + Date.now(), { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.analysis) {
        setLatestAnalysis(data.analysis);
        setTimelineInsights(data.analysis.timelineInsights || []);
      }
    } catch (err) {
      console.error("Error fetching latest analysis for timeline:", err);
    }
  };

  useEffect(() => {
    fetchMemories();
    fetchLatestAnalysis();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          date,
          category,
          mood,
          location,
          sentiment,
          score
        })
      });
      const data = await res.json();
      if (data.success) {
        // Add new memory and sort
        const updated = [data.memory, ...memories].sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setMemories(updated);
        setIsModalOpen(false);

        // Reset form
        setTitle("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        setLocation("");
        setCategory("Memory");
        setMood("Happy");
        setSentiment("positive");
        setScore(80);
      }
    } catch (err) {
      console.error("Error adding memory:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this memory?")) return;
    try {
      const res = await fetch(`/api/timeline?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setMemories(memories.filter((m) => m._id !== id));
      }
    } catch (err) {
      console.error("Error deleting memory:", err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <PremiumGate allowedTiers={["premium"]} featureName="Timeline Memory System" fallbackMode="lock">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Timeline Memory System</h1>
            <p className="text-sm text-zinc-400 mt-1">Track, record, and reflect on key relationship milestones</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-4 h-9 rounded-lg border border-white/5 shadow-md shadow-primary/10 transition-all duration-300"
          >
            <Plus className="mr-2 w-4.5 h-4.5" />
            Add Memory
          </Button>
        </div>

        {/* AI Relationship Timeline Insights */}
        {timelineInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card spotlight-glow rounded-2xl border border-white/[0.04] p-6 shadow-xl relative overflow-hidden bg-zinc-950/40 backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">AI Relationship Timeline Insights</h3>
                <p className="text-[11px] text-zinc-400">Behavioral milestones and coordination sync patterns detected in your logs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timelineInsights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.04] transition-all duration-300"
                >
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">{insight}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-zinc-500 mt-3 font-medium">Loading relationship timeline...</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 py-16 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20">
            <Sparkles className="w-12 h-12 text-primary/30 mb-4 animate-pulse" />
            <h3 className="text-base font-semibold text-zinc-300">No memories recorded yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              Start preserving your relationship milestones, anniversaries, resolved discussions, and dates here.
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="mt-5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-4 h-9 rounded-lg border border-white/5 shadow-md shadow-primary/10 transition-all duration-300"
            >
              <Plus className="mr-2 w-4 h-4" />
              Record First Memory
            </Button>
          </div>
        ) : (
          /* Timeline Path UI */
          <div className="relative border-l border-zinc-800 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8 py-4">
            <div className="absolute top-0 bottom-0 left-[-1px] w-[1px] bg-gradient-to-b from-primary via-accent to-zinc-800" />
            
            {memories.map((event, idx) => (
              <motion.div
                key={event._id || event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative"
              >
                {/* Dot marker */}
                <div className="absolute -left-[35px] md:-left-[43px] top-1 w-5 h-5 rounded-full bg-zinc-950 border-2 border-primary flex items-center justify-center shadow-md">
                  <Heart className="w-2.5 h-2.5 text-primary fill-primary" />
                </div>

                <div className="premium-card spotlight-glow rounded-2xl border border-white/[0.04] p-5 shadow-xl relative overflow-hidden group hover:border-white/[0.06] transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold py-0.5 px-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 uppercase tracking-wider">
                          {event.category || "Memory"}
                        </span>
                        <span className="text-[9px] font-bold py-0.5 px-1.5 rounded bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
                          {event.mood || "Happy"}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-200 tracking-wide mt-1.5">{event.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-500 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(event.date)}</span>
                        {event.location && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                     <div className="flex items-center gap-3 self-start sm:self-center">
                       <div className="flex items-center gap-2">
                         {event.score && (
                           <span className="text-xs font-extrabold text-zinc-300">
                             Score: {event.score}
                           </span>
                         )}
                       </div>
                      <button
                        onClick={() => handleDeleteMemory(event._id)}
                        className="text-zinc-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors duration-200"
                        title="Delete memory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modern custom sliding backdrop modal with glassmorphism */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark glass overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950 p-6 shadow-2xl z-10 spotlight-glow"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-white tracking-wide">Record a New Memory</h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMemory} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Anniversary Dinner, Road Trip"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.06] bg-zinc-900/50 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                  />
                </div>

                {/* Grid of Date and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.06] bg-zinc-900/50 px-3.5 py-2 text-sm text-zinc-100 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Location (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Third Wave Coffee"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.06] bg-zinc-900/50 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Grid of Category and Mood */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.06] bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200 [&>option]:bg-zinc-950"
                    >
                      <option value="Memory">General Memory</option>
                      <option value="Milestone">Milestone</option>
                      <option value="Date Night">Date Night</option>
                      <option value="Conflict Resolved">Conflict Resolved</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Anniversary">Anniversary</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Mood</label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.06] bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200 [&>option]:bg-zinc-950"
                    >
                      <option value="Happy">Happy</option>
                      <option value="Excited">Excited</option>
                      <option value="Reflective">Reflective</option>
                      <option value="Loving">Loving</option>
                      <option value="Peaceful">Peaceful</option>
                    </select>
                  </div>
                </div>

                 {/* Score */}
                 <div className="space-y-1.5">
                   <div className="flex justify-between items-center">
                     <label className="text-xs font-semibold text-zinc-300">Score (0-100)</label>
                     <span className="text-[10px] text-zinc-400 font-bold bg-zinc-800 px-1.5 py-0.5 rounded">{score}</span>
                   </div>
                   <input
                     type="range"
                     min="0"
                     max="100"
                     value={score}
                     onChange={(e) => setScore(Number(e.target.value))}
                     className="w-full accent-primary bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer mt-3"
                   />
                 </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe this memory... What made it special? What did you talk about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.06] bg-zinc-900/50 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200 resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800/80 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs rounded-lg px-5 shadow-md shadow-primary/10 transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Memory"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PremiumGate>
  );
}
