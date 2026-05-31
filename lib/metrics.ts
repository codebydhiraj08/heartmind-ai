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

  let secure = 0;
  let anxious = 0;
  let avoidant = 0;
  let fearful = 0;

  // Let's assign the dominant score based on the style and positivity.
  // Secure attachment grows with positivity. Insecure attachments grow as positivity falls (i.e. conflict rises).
  if (style === "secure") {
    secure = Math.max(45, Math.round(p)); // Secure is dominant, min 45%
    const remaining = 100 - secure;
    anxious = Math.round(remaining * 0.4);
    avoidant = Math.round(remaining * 0.35);
    fearful = Math.max(0, remaining - anxious - avoidant);
  } else if (style === "anxious") {
    // Insecure anxious is dominant, grows when positivity is lower
    anxious = Math.max(45, Math.round(100 - p * 0.8));
    secure = Math.round((100 - anxious) * 0.4);
    avoidant = Math.round((100 - anxious) * 0.35);
    fearful = Math.max(0, 100 - anxious - secure - avoidant);
  } else if (style === "avoidant") {
    // Insecure avoidant is dominant, grows when positivity is lower
    avoidant = Math.max(45, Math.round(100 - p * 0.8));
    secure = Math.round((100 - avoidant) * 0.4);
    anxious = Math.round((100 - avoidant) * 0.35);
    fearful = Math.max(0, 100 - avoidant - secure - anxious);
  } else {
    // Fearful is dominant, grows when positivity is lower
    fearful = Math.max(45, Math.round(100 - p * 0.8));
    secure = Math.round((100 - fearful) * 0.3);
    anxious = Math.round((100 - fearful) * 0.4);
    avoidant = Math.max(0, 100 - fearful - secure - anxious);
  }

  // Double check that the selected primary style has the absolute maximum percentage
  let secureVal = secure;
  let anxiousVal = anxious;
  let avoidantVal = avoidant;
  let fearfulVal = fearful;

  // Final sanity clamp: enforce that the dominant style is strictly greater than the others
  if (style === "secure") {
    const maxInsecure = Math.max(anxiousVal, avoidantVal, fearfulVal);
    if (secureVal <= maxInsecure) {
      secureVal = maxInsecure + 5;
    }
  } else if (style === "anxious") {
    const maxOthers = Math.max(secureVal, avoidantVal, fearfulVal);
    if (anxiousVal <= maxOthers) {
      anxiousVal = maxOthers + 5;
    }
  } else if (style === "avoidant") {
    const maxOthers = Math.max(secureVal, anxiousVal, fearfulVal);
    if (avoidantVal <= maxOthers) {
      avoidantVal = maxOthers + 5;
    }
  } else if (style === "fearful") {
    const maxOthers = Math.max(secureVal, anxiousVal, avoidantVal);
    if (fearfulVal <= maxOthers) {
      fearfulVal = maxOthers + 5;
    }
  }

  const total = secureVal + anxiousVal + avoidantVal + fearfulVal;
  const scale = total > 0 ? 100 / total : 1;
  
  secure = Math.round(secureVal * scale);
  anxious = Math.round(anxiousVal * scale);
  avoidant = Math.round(avoidantVal * scale);
  fearful = Math.max(0, 100 - secure - anxious - avoidant);

  return {
    secure,
    anxious,
    avoidant,
    fearful
  };
}
