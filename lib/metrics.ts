/**
 * Centralized Relationship Metrics Calculator
 * 
 * Provides unified, mathematically stable calculations for:
 * 1. Emotional Intelligence spectrum values
 * 2. Couple Compatibility metrics (radar dataset)
 * 3. Attachment Style percentages
 * 
 * This ensures all components and API layers display identical, synchronized values.
 */

export interface IEmotions {
  joy: number;
  sadness: number;
  anxiety: number;
  anger: number;
  confusion: number;
  stress: number;
}

export interface ICompatibility {
  overallScore: number;
  valuesAlignment: number;
  conflictStyle: number;
  intimacy: number;
  independence: number;
}

export interface IAttachmentBreakdown {
  secure: number;
  anxious: number;
  avoidant: number;
  fearful: number;
}

/**
 * Computes exact emotional spectrum values from positivity score and red flag counts.
 */
export function calculateEmotions(positivityScore: number, redFlagsCount: number): IEmotions {
  const p = Math.max(0, Math.min(100, positivityScore));
  const rf = Math.max(0, redFlagsCount);

  return {
    joy: Math.round(p),
    sadness: Math.max(5, Math.min(95, Math.round((100 - p) * 0.4))),
    anxiety: Math.max(5, Math.min(95, Math.round((100 - p) * 0.3 + rf * 6))),
    anger: Math.max(2, Math.min(90, Math.round(rf * 8 + (100 - p) * 0.15))),
    confusion: Math.max(5, Math.min(90, Math.round((100 - p) * 0.25))),
    stress: Math.max(5, Math.min(95, Math.round((100 - p) * 0.5 + rf * 4)))
  };
}

/**
 * Computes Couple Compatibility Radar dimensions from dynamic relationship safety parameters.
 */
export function calculateCompatibility(
  positivityScore: number,
  stressScore: number,
  attachmentStyle: string,
  redFlagsCount: number
): ICompatibility {
  const p = Math.max(0, Math.min(100, positivityScore));
  const s = Math.max(0, Math.min(100, stressScore));
  const style = String(attachmentStyle || "secure").toLowerCase();
  const rf = Math.max(0, redFlagsCount);

  const valuesAlignment = Math.max(40, Math.min(98, 100 - s * 0.15 - rf * 4));
  const conflictStyle = Math.max(30, Math.min(95, 100 - s));
  
  const intimacy = style === "secure" ? 92 : style === "anxious" ? 78 : style === "avoidant" ? 62 : 55;
  const independence = style === "avoidant" ? 95 : style === "secure" ? 82 : style === "anxious" ? 68 : 58;

  return {
    overallScore: Math.round(p),
    valuesAlignment: Math.round(valuesAlignment),
    conflictStyle: Math.round(conflictStyle),
    intimacy,
    independence
  };
}

/**
 * Calculates the individual attachment profile matching the primary attachment style category.
 */
export function calculateAttachmentBreakdown(attachmentStyle: string, positivityScore: number): IAttachmentBreakdown {
  const p = Math.max(0, Math.min(100, positivityScore));
  const style = String(attachmentStyle || "secure").toLowerCase();
  const remaining = 100 - p;

  let secure = 0;
  let anxious = 0;
  let avoidant = 0;
  let fearful = 0;

  if (style === "secure") {
    secure = p;
    anxious = Math.round(remaining * 0.5);
    avoidant = Math.round(remaining * 0.35);
    fearful = Math.max(0, remaining - anxious - avoidant);
  } else if (style === "anxious") {
    anxious = p;
    secure = Math.round(remaining * 0.3);
    avoidant = Math.round(remaining * 0.5);
    fearful = Math.max(0, remaining - secure - avoidant);
  } else if (style === "avoidant") {
    avoidant = p;
    secure = Math.round(remaining * 0.35);
    anxious = Math.round(remaining * 0.45);
    fearful = Math.max(0, remaining - secure - anxious);
  } else {
    fearful = p;
    secure = Math.round(remaining * 0.2);
    anxious = Math.round(remaining * 0.5);
    avoidant = Math.max(0, remaining - secure - anxious);
  }

  // Ensure overall normalization so sum stays exactly 100%
  const total = secure + anxious + avoidant + fearful;
  if (total !== 100 && total > 0) {
    const scale = 100 / total;
    secure = Math.round(secure * scale);
    anxious = Math.round(anxious * scale);
    avoidant = Math.round(avoidant * scale);
    fearful = Math.max(0, 100 - secure - anxious - avoidant);
  }

  return {
    secure,
    anxious,
    avoidant,
    fearful
  };
}
