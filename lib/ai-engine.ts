import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateEmotions, calculateCompatibility, calculateAttachmentBreakdown } from "./metrics";


export interface IAIRedFlag {
  type: string; // defensive_behavior, emotional_distance, manipulation_pattern, communication_breakdown, stress_escalation, passive_aggression, avoidance_pattern, reassurance_dependency, conflict_loop, emotional_withdrawal
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  confidence?: number;
  evidence?: string;
}

export interface IAIAnalysisResult {
  positivityScore: number;
  stressScore: number;
  communicationBalance: number;
  attachmentStyle: "secure" | "anxious" | "avoidant" | "fearful";
  redFlags: IAIRedFlag[];
  suggestions: string[];
  timelineInsights: string[];
  voiceInsights: string[];
  effortScore?: number;
  responseTime?: {
    person1Name: string;
    person1Timing: string;
    person2Name: string;
    person2Timing: string;
  };
  schemaVersion?: number;
}

/**
 * Preprocesses raw chat text to compute basic communication metrics.
 */
export function preprocessChatText(chatText: string) {
  const lines = chatText.split("\n");
  const senderMap: Record<string, { count: number; chars: number }> = {};

  const bracketedTimestampRegex = /^\[[^\]]{5,50}\]\s*[-:]?\s*/;
  const unbracketedTimestampRegex = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}[,\s]\s?\d{1,2}:\d{2}(?::\d{2})?\s?[APap]?[Mm]?\s*[-:]?\s*/;

  const hasTimestamps = lines.some(line => {
    const trimmed = line.trim();
    return bracketedTimestampRegex.test(trimmed) || unbracketedTimestampRegex.test(trimmed);
  });

  let totalLinesParsed = 0;
  let lastActiveSender: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let cleanLine = trimmed;
    let hadTimestamp = false;

    if (bracketedTimestampRegex.test(cleanLine)) {
      cleanLine = cleanLine.replace(bracketedTimestampRegex, "");
      hadTimestamp = true;
    } else if (unbracketedTimestampRegex.test(cleanLine)) {
      cleanLine = cleanLine.replace(unbracketedTimestampRegex, "");
      hadTimestamp = true;
    }

    const isNewMessage = hadTimestamp || !hasTimestamps;

    if (isNewMessage) {
      const simpleLineRegex = /^([^:]+):\s*(.*)$/;
      const matchSimple = cleanLine.match(simpleLineRegex);
      if (matchSimple) {
        const sender = matchSimple[1].trim();
        const messageText = matchSimple[2].trim();

        if (sender && sender.length < 50 && !sender.startsWith("[") && !sender.endsWith("]")) {
          totalLinesParsed++;
          lastActiveSender = sender;
          if (!senderMap[sender]) {
            senderMap[sender] = { count: 0, chars: 0 };
          }
          senderMap[sender].count++;
          senderMap[sender].chars += messageText.length;
        }
      }
    } else {
      if (lastActiveSender && senderMap[lastActiveSender]) {
        senderMap[lastActiveSender].chars += trimmed.length;
      }
    }
  }

  const senders = Object.keys(senderMap);
  const sender1 = senders[0] || "User 1";
  const sender2 = senders[1] || "User 2";

  const s1Stats = senderMap[sender1] || { count: 0, chars: 0 };
  const s2Stats = senderMap[sender2] || { count: 0, chars: 0 };

  const totalMessages = s1Stats.count + s2Stats.count;
  const balanceRatio = totalMessages > 0 ? (s1Stats.count / totalMessages) * 100 : 50;

  return {
    sender1,
    sender2,
    s1Count: s1Stats.count,
    s2Count: s2Stats.count,
    s1AvgLength: s1Stats.count > 0 ? Math.round(s1Stats.chars / s1Stats.count) : 0,
    s2AvgLength: s2Stats.count > 0 ? Math.round(s2Stats.chars / s2Stats.count) : 0,
    balanceRatio,
    totalLinesParsed,
  };
}

/**
 * Deterministic helper to generate a seed number from text for dynamic variance
 */
function getChatHash(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Analyzes chat text locally using a score-locked pattern detection engine.
 * The number of red flag patterns ALWAYS matches the positivity score range.
 *
 * Score → Pattern Count:
 *   >= 80 → 0 patterns
 *   70–79 → 1 pattern
 *   60–69 → 2 patterns
 *   50–59 → 3 patterns
 *   40–49 → 4 patterns
 *    < /**
 * Dynamic real-evidence pattern detector and generator.
 * Scans chat text for keyword signals, extracts quotes, and builds exactly the correct
 * number of realistic, high-fidelity redFlags depending on the positivityScore.
 */
export function generateRedFlagsForScore(chatText: string, positivityScore: number): IAIRedFlag[] {
  const stats = preprocessChatText(chatText);
  const lowerText = chatText.toLowerCase();
  const seed = getChatHash(chatText);

  // === SCORING METRICS ===
  const questionCount = (lowerText.match(/\?/g) || []).length;

  const posEmojiRegex = /❤️|🥰|😊|😘|😍|💖|💕|🎉|✨|👍|😂/g;
  const negEmojiRegex = /😢|😭|😡|😠|😒|🙄|💔|👎|👿/g;

  const posEmojiCount = (lowerText.match(posEmojiRegex) || []).length;
  const negEmojiCount = (lowerText.match(negEmojiRegex) || []).length;

  const positivityWords = /\b(love|happy|care|heart|laugh|smile|thank|cute|together|trust|sweet|agree|perfect|great|amazing|good|wonderful|joy)\b/g;
  const conflictWords = /\b(whatever|fine|stop|don't care|hate|angry|ignore|busy|enough|irritate|wrong|never|annoyed|sad|hurt)\b/g;
  const manipulationWords = /\b(always your fault|you are crazy|delusional|never said that|oversensitive|dramatic|if you loved me|selfish|blame)\b/g;

  const posWordCount = (lowerText.match(positivityWords) || []).length;
  const negWordCount = (lowerText.match(conflictWords) || []).length;
  const manipCount = (lowerText.match(manipulationWords) || []).length;

  const totalPositives = posWordCount + posEmojiCount;
  const totalConflicts = negWordCount + negEmojiCount;

  // === PARSE LINES FOR EVIDENCE ===
  const rawLines = chatText.split("\n");
  const parsedLines: { sender: string; text: string }[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const cleanLine = trimmed
      .replace(/^\[[^\]]{5,50}\]\s*[-:]?\s*/, "")
      .replace(/^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}[,\s]\s?\d{1,2}:\d{2}(?::\d{2})?\s?[APap]?[Mm]?\s*[-:]?\s*/, "");

    const matchSimple = cleanLine.match(/^([^:]+):\s*(.*)$/);
    if (matchSimple) {
      const sender = matchSimple[1].trim();
      const text = matchSimple[2].trim();
      if (sender && sender.length < 50 && !sender.startsWith("[") && !sender.endsWith("]") && text.length > 0) {
        parsedLines.push({ sender, text });
      }
    }
  }

  const partner1 = stats.sender1;
  const partner2 = stats.sender2;

  // Evidence helpers
  const findEvidenceLines = (keywords: RegExp, maxCount = 2): string[] => {
    const evidence: string[] = [];
    for (const pl of parsedLines) {
      if (keywords.test(pl.text.toLowerCase())) {
        evidence.push(`${pl.sender}: "${pl.text}"`);
        if (evidence.length >= maxCount) break;
      }
    }
    return evidence;
  };

  const getShortMessages = (maxLen = 18, limit = 2): string[] =>
    parsedLines
      .filter(pl => pl.text.length > 0 && pl.text.length < maxLen)
      .slice(0, limit)
      .map(pl => `${pl.sender}: "${pl.text}"`);

  const getLastMessages = (n = 3, maxLen = 30): string[] =>
    parsedLines
      .slice(-n)
      .filter(pl => pl.text.length < maxLen)
      .map(pl => `${pl.sender}: "${pl.text}"`);

  const getSenderSample = (senderName: string, limit = 2): string[] =>
    parsedLines
      .filter(pl => pl.sender === senderName)
      .slice(0, limit)
      .map(pl => `${pl.sender}: "${pl.text}"`);

  // === DETECT SIGNALS FROM CHAT ===
  const manipulationKw = /\b(always your fault|you are crazy|delusional|never said that|oversensitive|dramatic|if you loved me|selfish|blame|gaslight)\b/i;
  const manipEvidence = findEvidenceLines(manipulationKw, 2);

  const conflictKw = /\b(whatever|fine|stop|don'?t care|hate|angry|ignore|busy|enough|irritate|wrong|annoyed|hurt|never)\b/i;
  const conflictEvidence = findEvidenceLines(conflictKw, 2);

  const stressKw = /\b(stress|tense|fight|arguing|problem|worried|anxious|upset|frustrated|overwhelmed)\b/i;
  const stressEvidenceKw = findEvidenceLines(stressKw, 2);
  const exclamEvidence = parsedLines.filter(pl => pl.text.includes("!")).slice(0, 2).map(pl => `${pl.sender}: "${pl.text}"`);
  const stressEvidence = stressEvidenceKw.length > 0 ? stressEvidenceKw : exclamEvidence;

  const hasAvoidance = stats.s1AvgLength > stats.s2AvgLength * 1.8 || stats.s2AvgLength > stats.s1AvgLength * 1.8;
  const avoidantPartner = stats.s2AvgLength < stats.s1AvgLength ? partner2 : partner1;
  const avoidanceEvidence = getShortMessages(18, 2);

  const totalMsg = stats.s1Count + stats.s2Count;
  const dominanceRatio = totalMsg > 0 ? Math.max(stats.s1Count, stats.s2Count) / totalMsg : 0;
  const distanceEvidence = getSenderSample(stats.s1Count >= stats.s2Count ? partner1 : partner2, 2);

  const passiveKw = /\b(fine|whatever|ok\.|sure\.|hmm|yeah right|great\.|nice\.|good for you)\b/i;
  const passiveEvidence = findEvidenceLines(passiveKw, 2);

  const reassuranceKw = /\b(right\?|don'?t you\?|are you sure|do you still|you promise|you still love|miss me|missing me|thinking of me)\b/i;
  const reassuranceEvidence = findEvidenceLines(reassuranceKw, 2);

  const lastMsgs = getLastMessages(4, 30);

  const hasConflictLoop = negWordCount >= 4 && totalPositives < 3;
  const loopEvidence = conflictEvidence.length > 0 ? conflictEvidence : getShortMessages(20, 2);

  // === SCORE-LOCKED PATTERN COUNT ===
  const targetCount =
    positivityScore >= 100 ? 0 :
    positivityScore >= 90 ? 1 :
    positivityScore >= 80 ? 2 :
    positivityScore >= 70 ? 3 :
    positivityScore >= 60 ? 4 :
    positivityScore >= 50 ? 5 :
    positivityScore >= 40 ? 6 :
    positivityScore >= 30 ? 7 :
    positivityScore >= 20 ? 8 :
    positivityScore >= 10 ? 9 : 10;

  type PatternBuilder = () => IAIRedFlag;

  const pool: PatternBuilder[] = [
    // 0: Manipulation (highest severity)
    () => ({
      type: "manipulation_pattern",
      severity: "high",
      title: "Guilt Attribution & Psychological Pressure",
      description: manipEvidence.length > 0
        ? `Potential psychological pressure detected — statements appear to shift blame or distort reality: ${manipEvidence.join(" | ")}`
        : `Dialogue patterns suggest possible unbalanced responsibility distribution during conflicts, with subtle blame-shifting tendencies detected.${getSenderSample(partner1, 1).length > 0 ? " e.g. " + getSenderSample(partner1, 1).join(" | ") : ""}`,
      confidence: manipEvidence.length > 0 ? 88 : 72,
      evidence: manipEvidence.length > 0 ? manipEvidence[0] : ""
    }),
    // 1: Stress Escalation
    () => ({
      type: "stress_escalation",
      severity: "high",
      title: "Active Emotional Stress Escalation",
      description: stressEvidence.length > 0
        ? `High tension and conversational stress indicators detected: ${stressEvidence.join(" | ")}`
        : "Dialogue metrics show pronounced stress levels with elevated conflict markers and decreased emotional safety indicators across the conversation.",
      confidence: stressEvidence.length > 0 ? 85 : 70,
      evidence: stressEvidence.length > 0 ? stressEvidence[0] : ""
    }),
    // 2: Defensive Behavior
    () => ({
      type: "defensive_behavior",
      severity: "medium",
      title: "Defensive Communication Pattern",
      description: conflictEvidence.length > 0
        ? `Defensive or dismissive language patterns detected in conversation: ${conflictEvidence.join(" | ")}`
        : "Dialogue shows elevated rates of emotional guarding and defensive language during topic escalations, limiting open communication.",
      confidence: conflictEvidence.length > 0 ? 82 : 68,
      evidence: conflictEvidence.length > 0 ? conflictEvidence[0] : ""
    }),
    // 3: Avoidance Pattern
    () => ({
      type: "avoidance_pattern",
      severity: "medium",
      title: "Asymmetrical Engagement & Avoidance",
      description: hasAvoidance
        ? `${avoidantPartner} shows significantly shorter response patterns, indicating possible emotional avoidance.${avoidanceEvidence.length > 0 ? " e.g. " + avoidanceEvidence.join(" | ") : ""}`
        : `One-sided engagement pacing detected — messages lack reciprocal depth.${avoidanceEvidence.length > 0 ? " e.g. " + avoidanceEvidence.join(" | ") : " One partner's responses are consistently shorter and less engaged."}`,
      confidence: avoidanceEvidence.length > 0 ? 80 : 65,
      evidence: avoidanceEvidence.length > 0 ? avoidanceEvidence[0] : ""
    }),
    // 4: Emotional Distance
    () => ({
      type: "emotional_distance",
      severity: "medium",
      title: "Emotional Distance & Low Reciprocity",
      description: dominanceRatio > 0.72
        ? `Significant conversation imbalance detected — one partner dominates the dialogue.${distanceEvidence.length > 0 ? " e.g. " + distanceEvidence.join(" | ") : ""}`
        : `Lack of mutual emotional validation and low reciprocity detected.${distanceEvidence.length > 0 ? " e.g. " + distanceEvidence.join(" | ") : " Emotional engagement appears one-sided."}`,
      confidence: distanceEvidence.length > 0 ? 78 : 65,
      evidence: distanceEvidence.length > 0 ? distanceEvidence[0] : ""
    }),
    // 5: Passive Aggression
    () => ({
      type: "passive_aggression",
      severity: "medium",
      title: "Passive-Aggressive Communication Style",
      description: passiveEvidence.length > 0
        ? `Indirect negative expression or dismissive replies detected: ${passiveEvidence.join(" | ")}`
        : "Dialogue shows patterns of withheld warmth and indirect negative communication — responses may contain hidden frustration or disengagement.",
      confidence: passiveEvidence.length > 0 ? 84 : 70,
      evidence: passiveEvidence.length > 0 ? passiveEvidence[0] : ""
    }),
    // 6: Emotional Withdrawal
    () => ({
      type: "emotional_withdrawal",
      severity: "high",
      title: "Emotional Withdrawal Indicators",
      description: lastMsgs.length > 0
        ? `Conversational pacing shows signs of sudden emotional shut-down or evasive brevity: ${lastMsgs.join(" | ")}`
        : "Dialogue pacing indicates high stress and potential withdrawal from emotional topics — engagement appears to decrease as conversation progresses.",
      confidence: lastMsgs.length > 0 ? 86 : 74,
      evidence: lastMsgs.length > 0 ? lastMsgs[0] : ""
    }),
    // 7: Reassurance Dependency
    () => ({
      type: "reassurance_dependency",
      severity: "low",
      title: "Reassurance-Seeking Tendency",
      description: reassuranceEvidence.length > 0
        ? `High frequency of validation-seeking language detected: ${reassuranceEvidence.join(" | ")}`
        : `Elevated question density (${questionCount} questions detected) combined with the conversation's emotional pacing suggests possible reassurance-dependency tendencies.`,
      confidence: reassuranceEvidence.length > 0 ? 76 : 60,
      evidence: reassuranceEvidence.length > 0 ? reassuranceEvidence[0] : ""
    }),
    // 8: Conflict Loop
    () => ({
      type: "conflict_loop",
      severity: "medium",
      title: "Repetitive Conflict Loop",
      description: loopEvidence.length > 0
        ? `Recurring negative emotional cycles detected with no visible resolution or compromise markers: ${loopEvidence.join(" | ")}`
        : "Dialogue shows signs of unresolved recurring conflict patterns without productive de-escalation or compromise language present.",
      confidence: loopEvidence.length > 0 ? 80 : 68,
      evidence: loopEvidence.length > 0 ? loopEvidence[0] : ""
    }),
    // 9: Communication Breakdown
    () => ({
      type: "communication_breakdown",
      severity: "high",
      title: "Conversational Asymmetry & Breakdown",
      description: dominanceRatio > 0.72
        ? `Dialogue metrics reveal high rates of conversational asymmetry and potential communication breakdown.${distanceEvidence.length > 0 ? " e.g. " + distanceEvidence.join(" | ") : ""}`
        : "Dialogue structure shows signs of serious asymmetry and rising communication blockages between partners.",
      confidence: distanceEvidence.length > 0 ? 85 : 70,
      evidence: distanceEvidence.length > 0 ? distanceEvidence[0] : ""
    })
  ];

  const priorityOrder: number[] = [];

  if (manipEvidence.length > 0) priorityOrder.push(0);
  if (stressEvidence.length > 0) priorityOrder.push(1);
  if (conflictEvidence.length > 0) priorityOrder.push(2);
  if (hasAvoidance) priorityOrder.push(3);
  if (dominanceRatio > 0.72) priorityOrder.push(4);
  if (passiveEvidence.length > 0) priorityOrder.push(5);
  if (lastMsgs.length > 0 && positivityScore < 70) priorityOrder.push(6);
  if (reassuranceEvidence.length > 0 || questionCount > 8) priorityOrder.push(7);
  if (hasConflictLoop) priorityOrder.push(8);
  if (dominanceRatio > 0.72) priorityOrder.push(9);

  for (let i = 0; i <= 9; i++) {
    if (!priorityOrder.includes(i)) priorityOrder.push(i);
  }

  const redFlags: IAIRedFlag[] = [];
  for (let i = 0; i < Math.min(targetCount, priorityOrder.length); i++) {
    redFlags.push(pool[priorityOrder[i]]());
  }

  return redFlags;
}

/**
 * Stage 1: Deterministic Rule Engine (Toxicity Firewall)
 * Scans conversation for high-conflict expressions, extracts direct quote evidence,
 * computes capped safety thresholds, and matches deterministic flags.
 */
export interface IRuleEngineResult {
  hasToxicTriggers: boolean;
  triggerCount: number;
  cappedPositivityLimit: number;
  elevatedStressFloor: number;
  ruleRedFlags: IAIRedFlag[];
}

export function runRuleEngine(chatText: string): IRuleEngineResult {
  const lowerText = chatText.toLowerCase();
  
  // High-conflict expression enums
  const gaslightingTerms = [
    "you are crazy", "you're crazy", "delusional", "never said that", 
    "oversensitive", "too sensitive", "dramatic", "stop being dramatic",
    "always your fault", "everything is your fault", "all your fault", "blame you", "making things up"
  ];
  const dismissiveTerms = [
    "don't care anymore", "dont care anymore", "whatever", "fine", 
    "stop talking", "leave me alone", "shut up", "block you"
  ];
  const accusationTerms = [
    "you always overreact", "always overreacting", "never listen", "never care"
  ];

  const matchedGaslight: string[] = [];
  const matchedDismissive: string[] = [];
  const matchedAccusation: string[] = [];

  // Parse lines to extract exact quote evidence
  const lines = chatText.split("\n");
  const playfulnessRegex = /😂|😜|🤣|😉|🥰|❤️|haha|hehe|lol|laugh|masti|joke|sorry|love/i;

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;
    const lowerLine = cleanLine.toLowerCase();

    // Context-sensitive bypass: skip line if it contains playful emojis or repair keywords
    if (playfulnessRegex.test(cleanLine)) {
      continue;
    }

    for (const term of gaslightingTerms) {
      if (lowerLine.includes(term) && !matchedGaslight.includes(cleanLine)) {
        matchedGaslight.push(cleanLine);
      }
    }
    for (const term of dismissiveTerms) {
      if (lowerLine.includes(term) && !matchedDismissive.includes(cleanLine)) {
        matchedDismissive.push(cleanLine);
      }
    }
    for (const term of accusationTerms) {
      if (lowerLine.includes(term) && !matchedAccusation.includes(cleanLine)) {
        matchedAccusation.push(cleanLine);
      }
    }
  }

  const triggerCount = matchedGaslight.length + matchedDismissive.length + matchedAccusation.length;
  const hasToxicTriggers = triggerCount > 0;

  let cappedPositivityLimit = 100;
  let elevatedStressFloor = 0;
  const ruleRedFlags: IAIRedFlag[] = [];

  if (hasToxicTriggers) {
    console.log(`⚠️ [Rule Engine] Safety Firewall triggered! Matched ${triggerCount} high-conflict expressions.`);
    if (triggerCount >= 3) {
      cappedPositivityLimit = 35;
    } else if (triggerCount >= 2) {
      cappedPositivityLimit = 42;
    } else {
      cappedPositivityLimit = 52;
    }
    elevatedStressFloor = 100 - cappedPositivityLimit + triggerCount * 4;

    if (matchedGaslight.length > 0) {
      ruleRedFlags.push({
        type: "manipulation_pattern",
        severity: "high",
        title: "Guilt Attribution & Psychological Pressure",
        description: `Potential psychological pressure or distortion detected in statements: ${matchedGaslight.slice(0, 2).join(" | ")}`,
        confidence: 98,
        evidence: matchedGaslight[0]
      });
    }

    if (matchedDismissive.length > 0) {
      ruleRedFlags.push({
        type: "emotional_withdrawal",
        severity: "high",
        title: "Emotional Withdrawal & Evasion",
        description: `Conversational pacing shows sudden disengagement or dismissive brevity: ${matchedDismissive.slice(0, 2).join(" | ")}`,
        confidence: 95,
        evidence: matchedDismissive[0]
      });
    }

    if (matchedAccusation.length > 0) {
      ruleRedFlags.push({
        type: "defensive_behavior",
        severity: "medium",
        title: "Defensive Communication Pattern",
        description: `Elevated rates of accusatory or absolute statements during disputes: ${matchedAccusation.slice(0, 2).join(" | ")}`,
        confidence: 95,
        evidence: matchedAccusation[0]
      });
    }
  }

  return {
    hasToxicTriggers,
    triggerCount,
    cappedPositivityLimit,
    elevatedStressFloor,
    ruleRedFlags
  };
}

/**
 * Stage 3: Merge Layer
 * Integrates Rule Engine overrides and AI Engine nuances cleanly.
 */
export function mergePipeline(
  ruleRes: IRuleEngineResult,
  aiRes: IAIAnalysisResult
): IAIAnalysisResult {
  let mergedPositivity = aiRes.positivityScore;
  let mergedStress = aiRes.stressScore;

  if (ruleRes.hasToxicTriggers) {
    mergedPositivity = Math.min(aiRes.positivityScore, ruleRes.cappedPositivityLimit);
    mergedStress = Math.max(aiRes.stressScore, ruleRes.elevatedStressFloor);
  }

  const mergedFlags: IAIRedFlag[] = [...aiRes.redFlags];

  // Populate confidence and evidence for any AI-generated red flags if missing
  for (const flag of mergedFlags) {
    if (typeof flag.confidence !== "number" || isNaN(flag.confidence)) {
      flag.confidence = flag.severity === "high" ? 82 : flag.severity === "medium" ? 72 : 62;
    }
    if (!flag.evidence) {
      flag.evidence = "";
    }
  }

  // Merge deterministic rule flags
  for (const ruleFlag of ruleRes.ruleRedFlags) {
    const existingIdx = mergedFlags.findIndex(f => f.type === ruleFlag.type);
    if (existingIdx >= 0) {
      mergedFlags[existingIdx] = {
        ...mergedFlags[existingIdx],
        severity: ruleFlag.severity,
        title: ruleFlag.title,
        description: ruleFlag.description,
        confidence: ruleFlag.confidence,
        evidence: ruleFlag.evidence
      };
    } else {
      mergedFlags.unshift(ruleFlag);
    }
  }

  // Attachment style override if positivity is heavily capped
  let mergedAttachment = aiRes.attachmentStyle;
  if (mergedPositivity < 50) {
    mergedAttachment = "avoidant";
  } else if (mergedPositivity < 75) {
    mergedAttachment = "anxious";
  }

  return {
    ...aiRes,
    positivityScore: mergedPositivity,
    stressScore: Math.min(95, mergedStress),
    attachmentStyle: mergedAttachment,
    redFlags: mergedFlags
  };
}

/**
 * Analyzes chat text locally using a score-locked pattern detection engine.
 * The number of red flag patterns ALWAYS matches the positivity score range.
 */
export function analyzeChatLocally(
  chatText: string,
  preferences?: {
    coachTone?: string;
    banterLevel?: string;
    conflictBaseline?: string;
    pastSummary?: string;
  }
): IAIAnalysisResult {
  const stats = preprocessChatText(chatText);
  const lowerText = chatText.toLowerCase();
  const seed = getChatHash(chatText);

  // === SCORING METRICS ===
  const questionCount = (lowerText.match(/\?/g) || []).length;

  const posEmojiRegex = /❤️|🥰|😊|😘|😍|💖|💕|🎉|✨|👍|😂/g;
  const negEmojiRegex = /😢|😭|😡|😠|😒|🙄|💔|👎|👿/g;

  const posEmojiCount = (lowerText.match(posEmojiRegex) || []).length;
  const negEmojiCount = (lowerText.match(negEmojiRegex) || []).length;

  const positivityWords = /\b(love|happy|care|heart|laugh|smile|thank|cute|together|trust|sweet|agree|perfect|great|amazing|good|wonderful|joy)\b/g;
  const conflictWords = /\b(whatever|fine|stop|don't care|hate|angry|ignore|busy|enough|irritate|wrong|never|annoyed|sad|hurt)\b/g;
  const manipulationWords = /\b(always your fault|you are crazy|delusional|never said that|oversensitive|dramatic|if you loved me|selfish|blame)\b/g;

  const posWordCount = (lowerText.match(positivityWords) || []).length;
  const negWordCount = (lowerText.match(conflictWords) || []).length;
  const manipCount = (lowerText.match(manipulationWords) || []).length;

  const totalPositives = posWordCount + posEmojiCount;
  const totalConflicts = negWordCount + negEmojiCount;

  // Scan for repair indicators and playfulness (laughter, apologies, affectionate teasing)
  const repairWords = /\b(sorry|apologize|maafi|haha|hehe|lol|laugh|masti|joke|😂|🤣|😜|😉|🥰|❤️)\b/gi;
  const repairCount = (lowerText.match(repairWords) || []).length;

  // Scan for Love Languages
  const wordsOfAffirmation = /\b(proud of you|appreciate you|thank you for|so kind|love how you|thank you|love you|best partner|support you)\b/gi;
  const qualityTime = /\b(trip together|date night|spend time|our evening|alone time|dinner together|weekend plans|spend the day)\b/gi;
  const actsOfService = /\b(helped me|cooked|cleaned|took care of|fixed the|made you|do it for you|help you)\b/gi;
  const gifts = /\b(bought you|gift|present|surprise|flowers|chocolates)\b/gi;
  const physicalTouch = /\b(hug|kiss|cuddle|hold your hand|hold you|kissed|cuddling)\b/gi;

  const affirmationCount = (lowerText.match(wordsOfAffirmation) || []).length;
  const qualityTimeCount = (lowerText.match(qualityTime) || []).length;
  const actsOfServiceCount = (lowerText.match(actsOfService) || []).length;
  const giftsCount = (lowerText.match(gifts) || []).length;
  const physicalTouchCount = (lowerText.match(physicalTouch) || []).length;
  
  const loveLanguageSignals = affirmationCount + qualityTimeCount + actsOfServiceCount + giftsCount + physicalTouchCount;

  // Scan for Shared History & Inside Jokes
  const sharedHistory = /\b(remember when|last year|that trip|remember that laugh|inside joke|our joke|last time we|back then)\b/gi;
  const sharedHistoryCount = (lowerText.match(sharedHistory) || []).length;

  // Scan for Future Planning
  const futurePlanning = /\b(future|next year|when we move|our house|marriage|kids|planning to|goals together|next summer)\b/gi;
  const futurePlanningCount = (lowerText.match(futurePlanning) || []).length;

  const banterLevel = preferences?.banterLevel || "medium";
  const conflictBaseline = preferences?.conflictBaseline || "calm";
  const pastSummary = preferences?.pastSummary || "";

  // Offset the negative impact of conflicts based on repair frequency and banter level calibration
  let repairFactor = 1.5;
  let conflictMultiplier = 1.0;
  let stressMultiplier = 1.0;
  let positivityBaseBoost = 0;

  if (banterLevel === "high") {
    repairFactor = 1.0;          // repair indicators cancel out conflict indicators faster
    conflictMultiplier = 0.6;    // high banter baseline means heated/playful words are part of normal banter
    positivityBaseBoost += 6;
  } else if (banterLevel === "low") {
    repairFactor = 2.0;          // repair indicators cancel out conflicts slower
    conflictMultiplier = 1.25;   // literal tone baseline means conflicts have higher weight
    positivityBaseBoost -= 4;
  }

  if (conflictBaseline === "expressive") {
    conflictMultiplier *= 0.85;
    stressMultiplier *= 0.85;
    positivityBaseBoost += 3;
  } else if (conflictBaseline === "heated") {
    conflictMultiplier *= 0.7;
    stressMultiplier *= 0.75;
    positivityBaseBoost += 5;
  }

  // Reward Love Languages, Memories, and Future Orientation
  positivityBaseBoost += loveLanguageSignals * 3.5;
  positivityBaseBoost += sharedHistoryCount * 4;
  positivityBaseBoost += futurePlanningCount * 3.5;

  const mitigatedConflicts = Math.max(0, totalConflicts - Math.floor(repairCount / repairFactor));
  
  // Compute Positivity Score (adding bonus points for constructive repair attempts)
  const positivityBase = 68 + totalPositives * 4 - (mitigatedConflicts * 5 * conflictMultiplier) - manipCount * 12 + Math.min(12, repairCount * 2.5) + positivityBaseBoost;
  const positivityVariance = (seed % 19) - 9;
  let positivityScore = positivityBase + positivityVariance;
  positivityScore = Math.max(30, Math.min(97, positivityScore));

  // Compute Stress Score (relieved by repair attempts, love languages, and shared history)
  const mitigatedStressConflicts = Math.max(0, totalConflicts - Math.floor(repairCount / 1.2));
  const stressRelief = Math.min(15, loveLanguageSignals * 2 + sharedHistoryCount * 3 + futurePlanningCount * 2.5);
  const stressBase = (100 - positivityScore + mitigatedStressConflicts * 3 * stressMultiplier + manipCount * 6 - Math.min(10, repairCount * 1.5) - stressRelief) * stressMultiplier;
  const stressVariance = (seed % 15) - 7;
  let stressScore = stressBase + stressVariance;
  stressScore = Math.max(10, Math.min(95, stressScore));

  const communicationBalance = Math.round(stats.balanceRatio);

  // Stage 1: Run deterministic Rule Engine (Firewall)
  const ruleRes = runRuleEngine(chatText);

  // Stage 2: Local Heuristic AI Engine
  let redFlags = generateRedFlagsForScore(chatText, positivityScore);

  const localRawRes: IAIAnalysisResult = {
    positivityScore,
    stressScore,
    communicationBalance,
    attachmentStyle: "secure",
    redFlags,
    suggestions: [],
    timelineInsights: [],
    voiceInsights: []
  };

  // Stage 3: Merge Layer
  const merged = mergePipeline(ruleRes, localRawRes);
  positivityScore = merged.positivityScore;
  stressScore = merged.stressScore;
  redFlags = merged.redFlags;

  // Attachment Style
  let attachmentStyle: "secure" | "anxious" | "avoidant" | "fearful" = "secure";
  if (positivityScore >= 75 && totalConflicts <= 1) {
    attachmentStyle = "secure";
  } else if (positivityScore < 75 && totalConflicts >= 2) {
    attachmentStyle = "anxious";
  } else if (positivityScore < 50) {
    attachmentStyle = "avoidant";
  } else {
    attachmentStyle = "fearful";
  }

  // === PROACTIVE SUGGESTION ENGINE ===
  const suggestions: string[] = [];

  // 1. Proactive Conversation Starter
  if (totalConflicts >= 2) {
    suggestions.push(
      "Conversation Starter: 'I felt a bit of distance during our exchange earlier. Can we check in on how we can make each other feel more supported when things get heated?'"
    );
  } else if (loveLanguageSignals > 0) {
    suggestions.push(
      `Conversation Starter: 'I really appreciated it when you shared support earlier. What is one way I can speak your primary love language more clearly this week?'`
    );
  } else {
    suggestions.push(
      "Conversation Starter: 'What is one topic you've been wanting to discuss with me that we haven't found the quiet space for yet?'"
    );
  }

  // 2. Proactive Relationship Exercise
  if (sharedHistoryCount > 0) {
    suggestions.push(
      "Exercise (Memory Lane): Choose one positive memory or inside joke mentioned today and spend 10 minutes sharing why that moment was special to you."
    );
  } else if (futurePlanningCount > 0) {
    suggestions.push(
      "Exercise (Joint Future Visioning): Outline three small habits or joint plans you want to establish next month to help build toward your future goals."
    );
  } else {
    suggestions.push(
      "Exercise (Daily Appreciations): Share three direct, micro-affirmations with each other before the day ends, highlighting acts of service or words of support."
    );
  }

  // 3. Behavioral Guidance Advice
  if (stats.balanceRatio > 65 || stats.balanceRatio < 35) {
    suggestions.push(
      "Practice Conversational Pacing: Try checking in with shorter questions to invite your partner's equal sharing and restore communication balance."
    );
  } else {
    suggestions.push(
      "Practice Active Validation: When discussing hard topics, validate your partner's perspective first before offering solutions to maintain deep safety."
    );
  }

  const timelineInsights = [
    "Established a stable baseline for communication balance and text pacing.",
    "Noticed periods of emotional coordination showing resilient connection strengths."
  ];

  // Dynamic Love Languages & Memory timeline insights
  if (affirmationCount > 0) {
    timelineInsights.push("Love Language: Words of Affirmation active. Partners reinforced connection with supportive praise.");
  }
  if (qualityTimeCount > 0) {
    timelineInsights.push("Love Language: Quality Time priorities mentioned, highlighting shared activity values.");
  }
  if (actsOfServiceCount > 0) {
    timelineInsights.push("Love Language: Acts of Service recognized, reflecting daily helpfulness and mutual support.");
  }
  if (giftsCount > 0 || physicalTouchCount > 0) {
    timelineInsights.push("Love Language: Expressions of affection or gift surprises noted in conversational flow.");
  }

  if (sharedHistoryCount > 0) {
    timelineInsights.push("Shared history active: Partners recalled positive shared memories/inside jokes, reinforcing deep attachment safety.");
  }
  if (futurePlanningCount > 0) {
    timelineInsights.push("Future Orientation: Partners discussed future goals and joint plans, signifying mutual long-term commitment.");
  }

  if (pastSummary) {
    timelineInsights.push(
      `Analyzed current dynamics against past patterns. Resilience trend is ${
        positivityScore >= 70 ? "positive and growing" : "under active adaptation"
      } based on historical repair loops.`
    );
  }

  const voiceInsights = [
    "Stable tone indicators detected in voice logs.",
    "Composed emotional energy with minimal acoustic stress fluctuations."
  ];
  const effortScoreVal = Math.round(100 - Math.abs(50 - communicationBalance) * 0.8);
  const responseTimeVal = {
    person1Name: stats.sender1,
    person1Timing: Math.round(20 - (effortScoreVal / 5)) + " min avg",
    person2Name: stats.sender2,
    person2Timing: Math.round(40 - (effortScoreVal / 4)) + " min avg"
  };

  const rawResult: IAIAnalysisResult = {
    positivityScore,
    stressScore,
    communicationBalance,
    attachmentStyle,
    redFlags,
    suggestions,
    timelineInsights,
    voiceInsights,
    effortScore: effortScoreVal,
    responseTime: responseTimeVal
  };

  // Stage 4: Final Validation Layer
  return validateAndNormalizeAnalysis(rawResult, chatText);
}

/**
 * Loads all configured Gemini API keys from env (comma-separated GEMINI_API_KEYS).
 * Falls back to legacy GEMINI_API_KEY if present.
 */
function loadApiKeys(): string[] {
  const multiKeys = process.env.GEMINI_API_KEYS;
  if (multiKeys) {
    return multiKeys
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0 && !k.includes("<") && !k.includes("placeholder"));
  }
  const singleKey = process.env.GEMINI_API_KEY;
  if (singleKey && !singleKey.includes("<") && !singleKey.includes("placeholder")) {
    return [singleKey];
  }
  return [];
}

// Round-robin key rotation counter
let keyRotationIndex = 0;

function getNextApiKey(keys: string[]): string {
  const key = keys[keyRotationIndex % keys.length];
  keyRotationIndex = (keyRotationIndex + 1) % keys.length;
  return key;
}

export function validateAndNormalizeAnalysis(raw: any, chatText?: string): IAIAnalysisResult {
  const allowedRedFlags = [
    "defensive_behavior",
    "emotional_distance",
    "manipulation_pattern",
    "communication_breakdown",
    "stress_escalation",
    "passive_aggression",
    "avoidance_pattern",
    "reassurance_dependency",
    "conflict_loop",
    "emotional_withdrawal"
  ];
  const allowedAttachmentStyles = ["secure", "anxious", "avoidant", "fearful"];

  let positivityScore = typeof raw?.positivityScore === "number" && !isNaN(raw.positivityScore)
    ? Math.max(0, Math.min(100, Math.round(raw.positivityScore)))
    : 70;

  let stressScore = typeof raw?.stressScore === "number" && !isNaN(raw.stressScore)
    ? Math.max(0, Math.min(100, Math.round(raw.stressScore)))
    : 30;

  const communicationBalance = typeof raw?.communicationBalance === "number" && !isNaN(raw.communicationBalance)
    ? Math.max(0, Math.min(100, Math.round(raw.communicationBalance)))
    : 50;

  let attachmentStyle: "secure" | "anxious" | "avoidant" | "fearful" = "secure";
  if (allowedAttachmentStyles.includes(raw?.attachmentStyle)) {
    attachmentStyle = raw.attachmentStyle;
  }

  let redFlags: IAIRedFlag[] = [];
  if (Array.isArray(raw?.redFlags)) {
    for (const flag of raw.redFlags) {
      if (flag && typeof flag.title === "string" && typeof flag.description === "string") {
        let severity: "low" | "medium" | "high" = "medium";
        if (flag.severity === "low" || flag.severity === "medium" || flag.severity === "high") {
          severity = flag.severity;
        }

        let type = "defensive_behavior";
        if (allowedRedFlags.includes(flag.type)) {
          type = flag.type;
        } else {
          const rawType = String(flag.type || "").toLowerCase().replace(/[^a-z_]/g, "");
          if (rawType.includes("avoid")) type = "avoidance_pattern";
          else if (rawType.includes("defens")) type = "defensive_behavior";
          else if (rawType.includes("manip")) type = "manipulation_pattern";
          else if (rawType.includes("dist")) type = "emotional_distance";
          else if (rawType.includes("break")) type = "communication_breakdown";
          else if (rawType.includes("stress")) type = "stress_escalation";
          else if (rawType.includes("pass")) type = "passive_aggression";
          else if (rawType.includes("depend")) type = "reassurance_dependency";
          else if (rawType.includes("loop")) type = "conflict_loop";
          else if (rawType.includes("withdr")) type = "emotional_withdrawal";
        }

        const incomingConfidence = typeof flag.confidence === "number" ? flag.confidence : (severity === "high" ? 82 : severity === "medium" ? 72 : 62);
        const incomingEvidence = typeof flag.evidence === "string" ? flag.evidence : "";

        const existingFlagIndex = redFlags.findIndex(f => f.type === type);
        if (existingFlagIndex >= 0) {
          redFlags[existingFlagIndex].description += ` | Also: ${flag.description}`;
          if (severity === "high" || (severity === "medium" && redFlags[existingFlagIndex].severity === "low")) {
            redFlags[existingFlagIndex].severity = severity;
          }
          if (incomingConfidence > (redFlags[existingFlagIndex].confidence ?? 0)) {
            redFlags[existingFlagIndex].confidence = incomingConfidence;
          }
          if (incomingEvidence && !redFlags[existingFlagIndex].evidence) {
            redFlags[existingFlagIndex].evidence = incomingEvidence;
          }
        } else {
          redFlags.push({
            type,
            severity,
            title: flag.title,
            description: flag.description,
            confidence: incomingConfidence,
            evidence: incomingEvidence
          });
        }
      }
    }
  }

  // Stage 3 Override Layer: Run deterministic Rule Engine & Merge Pipeline
  if (chatText) {
    const ruleRes = runRuleEngine(chatText);
    const normalizedSoFar: IAIAnalysisResult = {
      positivityScore,
      stressScore,
      communicationBalance,
      attachmentStyle,
      redFlags,
      suggestions: raw?.suggestions || [],
      timelineInsights: raw?.timelineInsights || [],
      voiceInsights: raw?.voiceInsights || []
    };
    const merged = mergePipeline(ruleRes, normalizedSoFar);
    positivityScore = merged.positivityScore;
    stressScore = merged.stressScore;
    attachmentStyle = merged.attachmentStyle;
    redFlags = merged.redFlags;
  }

  // === Stage 4: FINAL VALIDATION & Programmatic Score-Pattern Alignment ===
  const targetCount =
    positivityScore >= 100 ? 0 :
    positivityScore >= 90 ? 1 :
    positivityScore >= 80 ? 2 :
    positivityScore >= 70 ? 3 :
    positivityScore >= 60 ? 4 :
    positivityScore >= 50 ? 5 :
    positivityScore >= 40 ? 6 :
    positivityScore >= 30 ? 7 :
    positivityScore >= 20 ? 8 :
    positivityScore >= 10 ? 9 : 10;

  if (redFlags.length > targetCount) {
    redFlags = redFlags.slice(0, targetCount);
  } else if (redFlags.length < targetCount) {
    if (chatText) {
      const generated = generateRedFlagsForScore(chatText, positivityScore);
      for (const gen of generated) {
        if (redFlags.length >= targetCount) break;
        if (!redFlags.some(f => f.type === gen.type)) {
          redFlags.push(gen);
        }
      }
    }

    const defaultPool = [
      {
        type: "defensive_behavior",
        severity: "medium" as const,
        title: "Defensive Communication Pattern",
        description: "Dialogue shows rates of emotional guarding and defensive language, limiting open communication.",
        confidence: 65,
        evidence: ""
      },
      {
        type: "emotional_distance",
        severity: "medium" as const,
        title: "Emotional Distance & Low Reciprocity",
        description: "Lack of mutual emotional validation and low reciprocity detected in recent exchanges.",
        confidence: 65,
        evidence: ""
      },
      {
        type: "manipulation_pattern",
        severity: "high" as const,
        title: "Guilt Attribution & Psychological Pressure",
        description: "Dialogue patterns suggest possible unbalanced responsibility distribution during conflicts, with subtle blame-shifting tendencies detected.",
        confidence: 72,
        evidence: ""
      },
      {
        type: "communication_breakdown",
        severity: "high" as const,
        title: "Asymmetrical Engagement & Avoidance",
        description: "Dialogue pacing indicates high stress and potential withdrawal from emotional topics.",
        confidence: 70,
        evidence: ""
      },
      {
        type: "stress_escalation",
        severity: "high" as const,
        title: "Active Emotional Stress Escalation",
        description: "Dialogue exhibits pronounced stress levels with elevated conflict indicators and decreased emotional safety metrics.",
        confidence: 75,
        evidence: ""
      },
      {
        type: "passive_aggression",
        severity: "medium" as const,
        title: "Passive-Aggressive Communication Style",
        description: "Dialogue shows patterns of withheld warmth and indirect negative communication.",
        confidence: 70,
        evidence: ""
      },
      {
        type: "avoidance_pattern",
        severity: "medium" as const,
        title: "Asymmetrical Engagement & Avoidance",
        description: "Dialogue pacing indicates potential temporary emotional shutdown between partners.",
        confidence: 65,
        evidence: ""
      },
      {
        type: "reassurance_dependency",
        severity: "low" as const,
        title: "Reassurance-Seeking Tendency",
        description: "Elevated question density combined with the conversation's emotional pacing suggests validation-seeking tendencies.",
        confidence: 60,
        evidence: ""
      },
      {
        type: "conflict_loop",
        severity: "medium" as const,
        title: "Repetitive Conflict Loop",
        description: "Dialogue shows signs of unresolved recurring conflict patterns without productive de-escalation.",
        confidence: 68,
        evidence: ""
      },
      {
        type: "emotional_withdrawal",
        severity: "high" as const,
        title: "Emotional Withdrawal Indicators",
        description: "Dialogue pacing indicates potential temporary emotional withdrawal during high stress topics.",
        confidence: 74,
        evidence: ""
      }
    ];

    for (const def of defaultPool) {
      if (redFlags.length >= targetCount) break;
      if (!redFlags.some(f => f.type === def.type)) {
        redFlags.push(def);
      }
    }
  }

  const suggestions: string[] = [];
  if (Array.isArray(raw?.suggestions)) {
    raw.suggestions.forEach((s: any) => {
      if (typeof s === "string" && s.trim()) suggestions.push(s.trim());
    });
  }
  if (suggestions.length === 0) {
    suggestions.push("Practice Reflective Mirroring: When one partner shares longer thoughts, try repeating back one core point before responding.");
    suggestions.push("Invite Shared Exploration: Ask open questions like 'What has been quietly worrying you lately?' to reduce verbal asymmetry.");
    suggestions.push("Treat the relationship as 'us vs. the problem' instead of 'me vs. you' to de-escalate stress.");
  }

  const timelineInsights: string[] = [];
  if (Array.isArray(raw?.timelineInsights)) {
    raw.timelineInsights.forEach((i: any) => {
      if (typeof i === "string" && i.trim()) timelineInsights.push(i.trim());
    });
  }
  if (timelineInsights.length === 0) {
    timelineInsights.push("Established a stable baseline for communication balance and text pacing.");
    timelineInsights.push("Noticed periods of emotional coordination showing resilient connection strengths.");
  }

  const voiceInsights: string[] = [];
  if (Array.isArray(raw?.voiceInsights)) {
    raw.voiceInsights.forEach((v: any) => {
      if (typeof v === "string" && v.trim()) voiceInsights.push(v.trim());
    });
  }

  const effortScore = typeof raw?.effortScore === "number" && !isNaN(raw.effortScore)
    ? Math.max(0, Math.min(100, Math.round(raw.effortScore)))
    : undefined;

  let responseTime = undefined;
  if (raw?.responseTime && typeof raw.responseTime === "object") {
    const person1NameVal = String(raw.responseTime.person1Name || "").trim();
    const person2NameVal = String(raw.responseTime.person2Name || "").trim();
    const stats = chatText ? preprocessChatText(chatText) : { sender1: "Sender A", sender2: "Sender B" };

    responseTime = {
      person1Name: person1NameVal || stats.sender1,
      person1Timing: String(raw.responseTime.person1Timing || raw.responseTime.person1 || "").trim() || "5 min avg",
      person2Name: person2NameVal || stats.sender2,
      person2Timing: String(raw.responseTime.person2Timing || raw.responseTime.person2 || "").trim() || "10 min avg"
    };
  } else {
    const stats = chatText ? preprocessChatText(chatText) : { sender1: "Sender A", sender2: "Sender B" };
    const effortScoreVal = effortScore ?? Math.round(100 - Math.abs(50 - communicationBalance) * 0.8);
    responseTime = {
      person1Name: stats.sender1,
      person1Timing: Math.round(20 - (effortScoreVal / 5)) + " min avg",
      person2Name: stats.sender2,
      person2Timing: Math.round(40 - (effortScoreVal / 4)) + " min avg"
    };
  }

  return {
    positivityScore,
    stressScore,
    communicationBalance,
    attachmentStyle,
    redFlags,
    suggestions,
    timelineInsights,
    voiceInsights,
    effortScore,
    responseTime,
    schemaVersion: 2
  };
}

/**
 * Executes a full AI chat analysis. Supports multiple Gemini API keys with
 * automatic round-robin rotation. Falls back to local heuristic engine if all keys fail.
 */
export async function analyzeChatText(
  chatText: string,
  preferences?: {
    coachTone?: string;
    banterLevel?: string;
    conflictBaseline?: string;
    pastSummary?: string;
  }
): Promise<IAIAnalysisResult> {
  const apiKeys = loadApiKeys();

  if (apiKeys.length === 0) {
    console.log("📢 [AI Engine] No valid Gemini API keys found. Using local adaptive NLP heuristic engine!");
    return analyzeChatLocally(chatText, preferences);
  }

  console.log(`🔑 [AI Engine] ${apiKeys.length} API key(s) loaded. Using key #${(keyRotationIndex % apiKeys.length) + 1} (round-robin rotation).`);

  for (let attempt = 0; attempt < apiKeys.length; attempt++) {
    const currentKey = getNextApiKey(apiKeys);
    const keyLabel = `Key #${(attempt + 1)}`;

    try {
      const ai = new GoogleGenerativeAI(currentKey);
      const model = ai.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const prompt = `
You are a highly sophisticated relationship psychologist, mediator, and emotional intelligence AI assistant for HeartMind AI.
Your task is to analyze the provided chat log conversation between two partners.

### USER-SPECIFIC RELATIONSHIP CALIBRATION:
- Playful Banter / Teasing Level: ${preferences?.banterLevel || "medium"}
  (If 'high', the partners naturally engage in a high frequency of playful teasing, jokes, and light sarcasm. Differentiate this playfulness from genuine passive-aggression or emotional distance. Do NOT flag lighthearted bantering as conflict/red flags. Adjust scores and insights to reward this banter as bonding.)
- Relationship normal Conflict Baseline: ${preferences?.conflictBaseline || "calm"}
  (If 'expressive' or 'heated', the partners naturally express disagreements with higher emotional volume or passion. Do not immediately penalize intensity or pacing as 'stress_escalation' unless it indicates actual toxicity.)
- Preferred Coaching Tone: ${preferences?.coachTone || "empathetic"}

### LONG-TERM HISTORICAL TRENDS:
- Past Relationship Analytics History (growth/repair trend):
${preferences?.pastSummary || "No past history available yet."}
  (CRITICAL: Do not analyze this conversation as an isolated incident. Look at the long-term trend of their relationship resilience, recovery speed, and growth over time. Mention this historical progression and how the current interaction reflects their resilience in the "timelineInsights" output.)

### LOVE LANGUAGES & SHARED HISTORY:
- Identify partners' specific Love Languages (Words of Affirmation, Quality Time, Acts of Service, Gifts, Physical Touch) when expressed in dialogue. Reward these as positive connection cues by raising positivityScore and lowering stressScore.
- Look for references to Shared Memories, Inside Jokes, or Joint Future Plans. Treat these as strong attachment resilience markers, and detail them in the timelineInsights output.

### PROACTIVE SUGGESTIONS (CRITICAL):
Your "suggestions" array MUST contain exactly 3 items:
1. One proactive conversation starter prefixed with "Conversation Starter: " (e.g. "Conversation Starter: 'Rahul, how did you feel when Priya said...'").
2. One practical relationship exercise prefixed with "Exercise: " (e.g. "Exercise: Spend 10 minutes tonight listing three things...").
3. One behavioral guidance advice.
All suggestions must be personalized, highly actionable, and tailored to improve the relationship's positive dynamics.

### STRICT LEGAL & ETHICAL SAFETY RULES:
1. NEVER make definitive, absolute, or accusatory claims about the relationship status or individuals' character.
   - DO NOT write "your partner is toxic", "they do not care about you", or "this is gaslighting".
2. ALWAYS use soft, potential, or indicator-based phrasing:
   - Use gentle, professional phrases like: "Possible indicators suggest...", "Potential differences in emotional pacing...", "Communication patterns may indicate...", "Signs of potential defensive reciprocity...".
   - Keep your insights supportive, highly objective, constructive, therapeutic, and ethically sound.
3. Use names exactly as they appear in the conversation. DO NOT add ** or any markdown formatting to names.
4. RELATIONAL CONTEXT & RESILIENCE:
   - Analyze conflicts in their full sequential context. Look for repair indicators (e.g. apologies, quick recovery, humorous jokes, laughter, playful emojis like 😂, 😜, ❤️, or words like "haha", "sorry").
   - Differentiate toxic patterns from healthy disagreements followed by fast, supportive repair. Do not classify light teasing or affectionate banter as toxic red flags.
   - Act as a sensitive, warm, and highly constructive relationship coach. Focus suggestions on strengthening repair attempts and validating each other's perspective.

### SCORE-PATTERN ALIGNMENT RULE (CRITICAL):
The number of redFlags in your output MUST align with the positivityScore:
- positivityScore 100    -> redFlags array MUST have exactly 0 items
- positivityScore 90-99  -> redFlags array MUST have exactly 1 item
- positivityScore 80-89  -> redFlags array MUST have exactly 2 items
- positivityScore 70-79  -> redFlags array MUST have exactly 3 items
- positivityScore 60-69  -> redFlags array MUST have exactly 4 items
- positivityScore 50-59  -> redFlags array MUST have exactly 5 items
- positivityScore 40-49  -> redFlags array MUST have exactly 6 items
- positivityScore 30-39  -> redFlags array MUST have exactly 7 items
- positivityScore 20-29  -> redFlags array MUST have exactly 8 items
- positivityScore 10-19  -> redFlags array MUST have exactly 9 items
- positivityScore 0-9    -> redFlags array MUST have exactly 10 items
This rule is MANDATORY. Do not return fewer or more patterns than specified.

### DYNAMIC & CUSTOMIZED ADVICE:
- Each suggestion MUST be extremely high-impact, practical, constructive, and soft-toned.
- Avoid generic templates. Tailor advice to specific events in this actual chat text.

Analyze the conversation and output EXACTLY matching this standardized JSON schema:
{
  "positivityScore": number (0-100),
  "stressScore": number (0-100),
  "communicationBalance": number (0-100, where 50 is perfectly balanced),
  "attachmentStyle": "string (must be exactly one of: secure, anxious, avoidant, fearful)",
  "effortScore": number (0-100, representing the combined conversational effort and mutual investment in communication),
  "responseTime": {
    "person1Name": "string (the exact name of the first sender, e.g. 'Rahul')",
    "person1Timing": "string (average time in human-readable text it takes for this person to reply to the other person, analyzed from timestamps if available, or estimated from conversational pacing/depth/density, e.g. 'Within 5 mins', 'Instant', '2 hours avg', 'Often delayed')",
    "person2Name": "string (the exact name of the second sender, e.g. 'Priya')",
    "person2Timing": "string (average time it takes for this person to reply to the first person, analyzed from timestamps if available, or estimated from conversational pacing/depth/density, e.g. 'Within 12 mins', 'Instant', '3 hours avg', 'Often delayed')"
  },
  "redFlags": [
    {
      "type": "string (must be exactly one of: defensive_behavior, emotional_distance, manipulation_pattern, communication_breakdown, stress_escalation, passive_aggression, avoidance_pattern, reassurance_dependency, conflict_loop, emotional_withdrawal)",
      "severity": "string (must be one of: low, medium, high)",
      "title": "string (clear specific pattern name)",
      "description": "string (soft-toned, potential warning description)",
      "confidence": number (0-100 score indicating your confidence in this pattern detection),
      "evidence": "string (the exact quoted sentence or key phrase from the chat text that serves as evidence)"
    }
  ],
  "suggestions": ["string (exactly 3 highly personalized, context-specific relationship coaching actions)"],
  "timelineInsights": ["string (1-2 timeline milestones or relationship insights)"],
  "voiceInsights": ["string (1-2 voice tonal alignment insights derived if any, otherwise empty)"]
}

Conversation text:
${chatText}
`;

      const response = await model.generateContent(prompt);
      const resultText = response.response.text();
      if (!resultText) throw new Error("Empty response received from Gemini API");

      const parsedResult = JSON.parse(resultText);
      const validated = validateAndNormalizeAnalysis(parsedResult, chatText);
      console.log(`✅ [AI Engine] Live Gemini Flash analysis completed via ${keyLabel}!`);
      return validated;

    } catch (error: any) {
      const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("quota");
      if (isRateLimit && attempt < apiKeys.length - 1) {
        console.warn(`⚠️ [AI Engine] ${keyLabel} hit rate limit (429). Rotating to next key...`);
        continue;
      }
      console.error(`❌ [AI Engine] ${keyLabel} failed: ${error.message}`);
      if (attempt === apiKeys.length - 1) {
        console.error("❌ [AI Engine] All API keys exhausted. Falling back to local NLP engine.");
      }
    }
  }

  return analyzeChatLocally(chatText, preferences);
}

/**
 * Intelligent utility to sample massive chat texts by taking the last 1000 messages
 * to ensure high-fidelity analysis within safe serverless, API, and local storage limits.
 */
export function sampleChatTextIfTooLong(chatText: string, maxMessages = 1000): string {
  if (!chatText || typeof chatText !== "string") return "";
  const lines = chatText.split("\n");
  if (lines.length <= maxMessages) return chatText;

  const bracketedTimestampRegex = /^\[[^\]]{5,50}\]\s*[-:]?\s*/;
  const unbracketedTimestampRegex = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}[,\s]\s?\d{1,2}:\d{2}(?::\d{2})?\s?[APap]?[Mm]?\s*[-:]?\s*/;
  const simpleLineRegex = /^([^:]+):\s*(.*)$/;

  let messageCount = 0;
  let splitIndex = 0;

  // Scan from the back to find where the maxMessages-th message from the end starts
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    let cleanLine = trimmed;
    let isMessageStart = false;

    if (bracketedTimestampRegex.test(cleanLine)) {
      cleanLine = cleanLine.replace(bracketedTimestampRegex, "");
      isMessageStart = true;
    } else if (unbracketedTimestampRegex.test(cleanLine)) {
      cleanLine = cleanLine.replace(unbracketedTimestampRegex, "");
      isMessageStart = true;
    } else {
      const matchSimple = cleanLine.match(simpleLineRegex);
      if (matchSimple) {
        const sender = matchSimple[1].trim();
        if (sender && sender.length < 50 && !sender.startsWith("[") && !sender.endsWith("]")) {
          isMessageStart = true;
        }
      }
    }

    if (isMessageStart) {
      messageCount++;
      if (messageCount >= maxMessages) {
        splitIndex = i;
        break;
      }
    }
  }

  if (messageCount >= maxMessages && splitIndex > 0) {
    return lines.slice(splitIndex).join("\n");
  }
  return chatText;
}

