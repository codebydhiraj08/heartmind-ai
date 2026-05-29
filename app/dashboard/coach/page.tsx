"use client";

import React, { useState, useRef, useEffect } from "react";
import { PremiumGate } from "@/components/premium-gate";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, User, Bot, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  sender: "user" | "coach";
  text: string;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "coach",
      text: "Hello! I am your AI Relationship Coach, designed to help you build deeper empathy, navigate attachment styles, and communicate constructively. What's on your mind today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Client-side emergency backup responder (Third layer of defense)
  const generateClientBackupReply = (msg: string): string => {
    const isDevanagari = /[\u0900-\u097F]/.test(msg);
    const marathiWords = /आहे|आहेस|आहेत|माझा|माझी|माझे|तुझा|तुझी|तुझे|काय|कुठे|खूप|मला|तुला/i;
    const hasMarathi = (isDevanagari && marathiWords.test(msg)) || /mi|tu|mala|tula|kaay/i.test(msg);
    const hasHinglish = /tum|na|hai|hu|ko|se|kya|nhi|nahi|acha|toh|vhi|vo/i.test(msg);
    
    if (hasMarathi) {
      return "मला समजते की तुम्ही सध्या कठीण परिस्थितीतून जात आहात. नात्यामध्ये ताण येणे सामान्य आहे. आपण एकत्र बसून शांतपणे एकमेकांचे म्हणणे ऐकून घेतले, तर यावर नक्कीच मार्ग निघू शकेल. तुम्हाला याबद्दल काय वाटते? ❤️";
    }
    if (isDevanagari) {
      return "मैं आपकी भावना को समझ सकता हूँ। रिश्ते में मतभेद होना स्वाभाविक है। जब मन अशांत हो, तो बातचीत को कुछ देर के लिए रोक देना चाहिए। क्या आप शांत होकर अपने साथी से अपनी भावनाएं साझा कर सकते हैं? ❤️";
    }
    if (hasHinglish) {
      return "Jhagde ya tension ke time par pareshan hona normal hai. Main samajh sakta hoon ki aap stress me hain. Relationship me baatein suljhane ke liye thoda shanti se baithna zaroori hota hai. Kya aap bina kisi blame ke unhe apna darr bata sakte hain? ❤️";
    }
    return "I completely understand that this situation is bringing up difficult emotions. Tension in a relationship can feel incredibly exhausting. Shifting from blame to sharing your vulnerable feelings is often the key to safety. How do you think they would respond to that approach?";
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // Send message along with history to the dynamic API route
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          history: messages.slice(-10).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();

      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "coach",
            text: data.reply
          }
        ]);
      } else {
        throw new Error("Invalid reply format");
      }
    } catch (err) {
      console.warn("⚠️ AI Coach API failed or network offline. Triggering emergency client-side backup generator.", err);
      const backupText = generateClientBackupReply(currentInput);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "coach",
          text: backupText
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <PremiumGate allowedTiers={["premium"]} featureName="AI Relationship Coach" fallbackMode="lock">
      <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary fill-primary" />
            AI Relationship Coach
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Get immediate, empathetic communication strategies and advice</p>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-zinc-950/40 border border-white/[0.04] rounded-2xl p-4 overflow-y-auto space-y-4 my-4 flex flex-col justify-between min-h-[350px]">
          <div className="space-y-4 overflow-y-auto max-h-[400px] pr-1 flex-1">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-3 my-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    msg.sender === "user" 
                      ? "bg-zinc-900 border-zinc-800 text-zinc-300" 
                      : "bg-primary/10 border-primary/20 text-primary"
                  }`}>
                    {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-zinc-900/60 border border-white/[0.03] text-zinc-300"
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex items-start gap-3 my-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-primary/10 border-primary/20 text-primary">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-zinc-900/60 border border-white/[0.03] rounded-2xl p-4 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Guidance prompts */}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {[
                "How do I talk about feeling neglected?",
                "What is a calm way to pause an argument?",
                "How to navigate an avoidant attachment partner?",
                "Tips to align our love languages"
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  type="button"
                  className="p-3 text-left rounded-xl bg-zinc-900/40 border border-white/[0.03] hover:bg-white/[0.02] text-xs text-zinc-400 hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500 group-hover:text-primary transition-colors flex-shrink-0" />
                  <span className="truncate">{q}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI Relationship Coach anything..."
            className="flex-1 bg-zinc-900 border border-white/[0.04] focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-xs md:text-sm outline-none text-zinc-200 h-11"
          />
          <Button type="submit" className="bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl h-11 px-5 border border-white/5 shadow-md shadow-primary/10 transition-all duration-300">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </PremiumGate>
  );
}
