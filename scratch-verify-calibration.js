const { analyzeChatLocally } = require("./lib/ai-engine");

// 1. Playful Sarcastic Dialogue
const playfulTeasingChat = `
Rahul: You are so late Priya! 🙄 I was about to order the whole menu without you.
Priya: Haha, you wish! 😂 You can't even finish one single burger.
Rahul: Oh really? Let's bet on it. You're crazy but I love it.
Priya: You're crazier! 😜 Let's see who wins.
`;

// 2. Love Language, memories & future plans chat log
const deepConnectionChat = `
Rahul: I really appreciate you Priya, thank you for cooking dinner for me yesterday when I was tired. You are the best partner.
Priya: Of course! I love you and wanted to make you happy. Remember when we got lost in Goa last year? We need to plan a trip together again!
Rahul: Haha yes! That was the best memory. I am planning to save up for our future house next year.
Priya: Me too! I'm so excited for what we will build together. Let's hug and watch a movie tonight.
`;

console.log("==================================================================");
console.log("🧪 TESTING CHAT ANALYZER WITH RELATIONSHIP CALIBRATION:");
console.log("==================================================================");

// Case A: High Banter Calibration (calibrated relationship normal)
console.log("\n[Case A] Calibrating for: High Banter & Expressive baseline...");
const highBanterResult = analyzeChatLocally(playfulTeasingChat, {
  banterLevel: "high",
  conflictBaseline: "expressive",
  pastSummary: "Date: 6/2/2026, Score: 78, Sentiment: positive, Flagged Patterns: none"
});
console.log("Positivity Score:", highBanterResult.positivityScore);
console.log("Stress Score:", highBanterResult.stressScore);
console.log("Timeline Insights:", highBanterResult.timelineInsights);

// Case B: Low Banter Calibration (literal baseline)
console.log("\n[Case B] Calibrating for: Low Banter & Calm baseline...");
const lowBanterResult = analyzeChatLocally(playfulTeasingChat, {
  banterLevel: "low",
  conflictBaseline: "calm"
});
console.log("Positivity Score (Should be lower due to literal interpretation):", lowBanterResult.positivityScore);
console.log("Stress Score (Should be higher):", lowBanterResult.stressScore);

console.log("\n==================================================================");
console.log("🧪 TESTING LOVE LANGUAGES & NOSTALGIC/FUTURE PATTERNS:");
console.log("==================================================================");

const connectionResult = analyzeChatLocally(deepConnectionChat, {
  banterLevel: "medium",
  conflictBaseline: "calm"
});
console.log("Positivity Score (Should be high due to positive rewards):", connectionResult.positivityScore);
console.log("Stress Score (Should be low):", connectionResult.stressScore);
console.log("\nGenerated Timeline Insights:");
connectionResult.timelineInsights.forEach(ins => console.log(` - ${ins}`));

console.log("\n==================================================================");
console.log("🧪 TESTING PROACTIVE SUGGESTION ENGINE:");
console.log("==================================================================");
console.log("Generated Proactive suggestions for connection chat:");
connectionResult.suggestions.forEach((sug, i) => console.log(` ${i+1}. ${sug}`));

console.log("\n==================================================================");
console.log("🧪 TESTING VOICE TONE NUANCE CALIBRATION (Server-side simulation):");
console.log("==================================================================");

// Mock Voice POST Calibration Logic
function simulateVoiceAnalysis(emotions, preferences) {
  const banterLevel = preferences?.banterLevel || "medium";
  const conflictBaseline = preferences?.conflictBaseline || "calm";

  const stressObj = emotions.find((e) => e.name === "Stress Level") || { value: 30 };
  const excitementObj = emotions.find((e) => e.name === "Excitement") || { value: 50 };
  const hesitationObj = emotions.find((e) => e.name === "Hesitation") || { value: 20 };
  const sadnessObj = emotions.find((e) => e.name === "Sadness") || { value: 10 };
  const angerObj = emotions.find((e) => e.name === "Anger") || { value: 5 };

  let stressVal = stressObj.value;
  let excitementVal = excitementObj.value;
  let hesitationVal = hesitationObj.value;
  let sadnessVal = sadnessObj.value;
  let angerVal = angerObj.value;

  const insights = [];

  // Tonal Calibration based on conflictBaseline
  if (conflictBaseline === "expressive") {
    stressVal = Math.max(10, Math.round(stressVal * 0.85));
    angerVal = Math.max(0, Math.round(angerVal * 0.85));
  } else if (conflictBaseline === "heated") {
    stressVal = Math.max(10, Math.round(stressVal * 0.7));
    angerVal = Math.max(0, Math.round(angerVal * 0.7));
  }

  let isSarcasmDetected = false;

  // Playful Sarcasm Detection
  if ((banterLevel === "high" || banterLevel === "medium") && excitementVal > 50 && stressVal > 40) {
    isSarcasmDetected = true;
    stressVal = Math.max(10, Math.round(stressVal * 0.8));
    angerVal = Math.max(0, Math.round(angerVal * 0.7));
    insights.push({
      type: "positive",
      title: "Playful Sarcasm Detected 🎭",
      description: "Vocal dynamics indicate lighthearted sarcasm and high excitement resonance."
    });
  }

  // Genuine Concern Detection
  if (!isSarcasmDetected && stressVal > 45 && sadnessVal > 15 && angerVal < 10 && excitementVal < 40) {
    stressVal = Math.max(10, Math.round(stressVal * 0.85));
    insights.push({
      type: "positive",
      title: "Genuine Concern Detected 🍃",
      description: "Vocal frequency contour lines show soft pitch adjustments, indicating deep vulnerability and concern."
    });
  }

  const overallScore = Math.min(100, Math.max(0, Math.round((excitementVal + (100 - stressVal)) / 2)));

  return {
    score: overallScore,
    stressScore: stressVal,
    insights
  };
}

// Case 1: High Excitement + Moderate Stress with High Banter
const mockPlayfulEmotions = [
  { name: "Stress Level", value: 55 },
  { name: "Excitement", value: 75 },
  { name: "Hesitation", value: 15 },
  { name: "Sadness", value: 10 },
  { name: "Anger", value: 12 }
];

console.log("\n[Voice Case A] Playful Sarcasm Test (High Banter)...");
const voiceResA = simulateVoiceAnalysis(mockPlayfulEmotions, { banterLevel: "high", conflictBaseline: "expressive" });
console.log("Overall Score:", voiceResA.score);
console.log("Stress Score (Calibrated down):", voiceResA.stressScore);
console.log("Insights:", voiceResA.insights);

// Case 2: High Stress + Sadness, Low Anger/Excitement (Concern)
const mockConcernEmotions = [
  { name: "Stress Level", value: 65 },
  { name: "Excitement", value: 20 },
  { name: "Hesitation", value: 30 },
  { name: "Sadness", value: 40 },
  { name: "Anger", value: 5 }
];

console.log("\n[Voice Case B] Genuine Concern Test...");
const voiceResB = simulateVoiceAnalysis(mockConcernEmotions, { banterLevel: "medium", conflictBaseline: "calm" });
console.log("Overall Score:", voiceResB.score);
console.log("Stress Score (Calibrated down):", voiceResB.stressScore);
console.log("Insights:", voiceResB.insights);
console.log("==================================================================");
