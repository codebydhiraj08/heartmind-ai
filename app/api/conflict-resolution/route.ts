import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logApiKeyUsage } from "@/lib/api-key-tracker";

export const dynamic = "force-dynamic";

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

let keyRotationIndex = 0;
function getNextApiKey(keys: string[]): string {
  const key = keys[keyRotationIndex % keys.length];
  keyRotationIndex = (keyRotationIndex + 1) % keys.length;
  return key;
}

function generateConflictFallback(message: string): { triggers: string[]; alternatives: string[] } {
  const isDevanagari = /[\u0900-\u097F]/.test(message);
  
  // Marathi
  const marathiWords = /आहे|आहेस|आहेत|माझा|माझी|माझे|तुझा|तुझी|तुझे|काय|कुठे|खूप|करत|बोल|ताण|नको|मला|तुला|आवाज|ळ|चहा|प्रेम|सुंदर|तुम्ही|आम्ही|कसे|कसा|कशी|झाला|झाली/i;
  const hasMarathi = (isDevanagari && marathiWords.test(message)) || 
    /mi|tu|aahe|chhaan|mahit|mala|tula|kaay|bol|khup|prem|cha|chi|che/i.test(message);
    
  // Hinglish
  const hasHinglish = /tum|na|hai|hu|ko|se|hi|bhi|ki|ke|tera|meri|kya|yaar|aur|nhi|nahi|acha|accha|vhi|vo|muze|mujhe|toh/i.test(message);
  const hasHindiDevanagari = isDevanagari && !marathiWords.test(message);

  // Check for specific high-emotion boundary statements like "loyalty" and "timepass"
  const lowerMsg = message.toLowerCase();
  const hasLoyalty = lowerMsg.includes("loyalty") || lowerMsg.includes("लॉयल्टी") || lowerMsg.includes("loyalty ठेव");
  const hasTimepass = lowerMsg.includes("timepass") || lowerMsg.includes("टाईमपास") || lowerMsg.includes("time pass");

  if (hasMarathi) {
    if (hasLoyalty || hasTimepass) {
      return {
        triggers: ["भावनिक सीमा आणि थेट मागणी (Direct Boundary)", "असुरक्षिततेची भीती (Fear of Insecurity)"],
        alternatives: [
          "मला आपल्या नात्यात तुझ्याकडून १००% Loyalty आणि प्रामाणिकपणा हवा आहे, timepass नाही. मला हे नातं मनापासून टिकवायचं आहे. 😤❤️",
          "जर आपण एकमेकांवर खरं प्रेम करत असू, तर आपल्या नात्यात विश्वास आणि Loyalty सर्वात महत्त्वाची असायला हवी, नातं timepass म्हणून नको.",
          "मला आपल्या भविष्याबद्दल स्पष्टता हवी आहे. जर तुला गंभीर राहायचं असेल तर आपण सोबत राहू, कारण माझ्यासाठी commitment खूप महत्त्वाची आहे."
        ]
      };
    }
    return {
      triggers: ["आरोप करणारी भाषा (Accusatory)", "अति-सामान्यीकरण (Always/Never)"],
      alternatives: [
        "मला असे वाटते की आपल्या नात्यात संवाद थोडा कमी होत आहे, चला यावर बोलूया. ❤️",
        "तुझे म्हणणे मी समजून घेऊ इच्छितो/इच्छिते, आपण एकत्र बसून यावर विचार करूया.",
        "रागाच्या भरात संवाद साधण्याऐवजी आपण शांतपणे एकमेकांचे ऐकून घेऊया."
      ]
    };
  }

  if (hasHindiDevanagari) {
    return {
      triggers: ["आरोप लगाने वाला लहजा (Accusatory)", "अति-सामान्यीकरण (Absolutist Language)"],
      alternatives: [
        "मुझे ऐसा लगता है कि हमारे बीच खुलकर बात नहीं हो पा रही है, चलिए शांति से बैठते हैं। ❤️",
        "मैं आपकी बात को समझना चाहता/चाहती हूँ, क्या आप मुझे अपना नज़रिया समझाएंगे?",
        "गुस्से में बात बिगड़ने के बजाय हम एक टीम की तरह इस समस्या का हल निकाल सकते हैं।"
      ]
    };
  }

  if (hasHinglish) {
    return {
      triggers: ["Absolutist Language (humesha/kabhi nahi)", "Accusatory Tone (Aapne kiya)", "Emotional Stress Indicators"],
      alternatives: [
        "Mujhe aisa feel hota hai ki humare beech thoda communication gap aa raha hai. Chalo shanti se discuss karte hain. ❤️",
        "Main aapki baat samajhna chahta/chahti hoon. Kya hum is problem ko sath milkar handle kar sakte hain?",
        "Gusse me baatein kharab hone se accha hai ki hum aaram se ek doosre ki perspective sunte hain."
      ]
    };
  }

  // English fallback
  return {
    triggers: ["Absolutist language (never/always)", "Accusatory tone", "Generalizing behavior"],
    alternatives: [
      "I feel unheard when my opinions aren't considered in our decisions.",
      "I'd appreciate if we could discuss things before making choices that affect both of us.",
      "Can we talk about how we make decisions together? I want to feel more included."
    ]
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Parse payload
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Conflict message content is required." },
        { status: 400 }
      );
    }

    // 3. Load Gemini API Keys
    const apiKeys = loadApiKeys();

    if (apiKeys.length === 0) {
      console.log("📢 [Conflict AI API] No valid Gemini API keys found. Using local bilingual fallback generator!");
      const fallbackResult = generateConflictFallback(message);
      return NextResponse.json({
        success: true,
        result: fallbackResult,
        source: "local_bilingual"
      });
    }

    // 4. Try calling Gemini model
    for (let attempt = 0; attempt < apiKeys.length; attempt++) {
      const currentKey = getNextApiKey(apiKeys);
      const keyLabel = `Key #${(attempt + 1)}`;
      let start = Date.now();

      try {
        const ai = new GoogleGenerativeAI(currentKey);
        const model = ai.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        // Prompt to enforce strict language-matching (Marathi, Hinglish, English, Hindi, etc.)
        const prompt = `
You are a highly sophisticated relationship psychologist, empathetic dialogue coach, and high-EQ conflict resolution expert.
A partner has sent the following conflict-prone, tense, or accusatory message:
"${message}"

Your task is to analyze this message, identify emotional triggers, and suggest exactly 3 healthier, constructive, and supportive alternatives based on modern psychological models (such as "I-statements", collaborative problem solving, and reducing verbal asymmetry).

### ABSOLUTE LANGUAGE & SCRIPT RULES (MANDATORY):
1. **Autodetect Language & Script:**
   - Detect the exact language, script, and dialect of the input message: "${message}".
   - **If the input is in Hinglish** (Hindi written in English alphabets, e.g. "tum hamesha", "kya", "nhi sunte", etc.), your output triggers and alternatives **MUST** be in natural, sweet, and emotionally supportive **Hinglish**.
   - **If the input is in Hindi (Devanagari)**, your output triggers and alternatives **MUST** be in warm, respectful, and comforting **Hindi in Devanagari script**.
   - **If the input is in Marathi** (e.g. "tu bolત", "kharach", "mala", "tula", or Devanagari Marathi script), your output triggers and alternatives **MUST** be in polite, empathetic **Marathi**.
   - **If the input is in English**, your output triggers and alternatives **MUST** be in sophisticated, emotionally mature **English**.
   - **CRITICAL:** Every word, description, and alternative suggested **MUST** strictly match the user's input language, dialect, and script. Do NOT reply in English if the user input is in Hinglish or Hindi!
2. Keep the suggested alternatives warm, highly natural, emotional, realistic, conversational, and deeply validating. Avoid cliché, overly formal, dry, or robotic textbook-like phrasing. The suggested alternatives MUST sound like a real person expressing a clear boundary, preserving the passionate emotional core and intensity of the original message but framing it constructively (without aggressive or accusatory ultimatums).
3. **Conversational Style & Vocabulary Alignment (CRITICAL):**
   - Retain the exact colloquial tone, style, and vocabulary (e.g., if the user mixes English terms like "loyalty", "timepass" with Marathi/Hindi script, you **MUST** retain those English terms transliterated or kept in the alternatives to feel highly organic and relatable). Do NOT convert passionate colloquial emotional boundary statements into dry, formal, high-brow textbook sentences!
4. **Conversational Length Matching (CRITICAL):**
   - Carefully evaluate the length and word count of the partner's input message ("${message}").
   - If the input is a short sentence (under 10-12 words, e.g., "Tum kabhi meri baat nahi sunte!" or "You never listen to me!"), the generated healthier alternatives MUST be equally short, brief, and concise (strictly 1 short sentence, matching the length of the input). Do NOT generate long, wordy paragraphs for brief inputs.
   - If the input is a long message (multiple lines, detailed emotional paragraph), the generated healthier alternatives should be proportionally longer and more detailed (2-3 sentences or a concise paragraph) to match their emotional investment and depth.

Output your response as a valid JSON object matching this schema:
{
  "triggers": [
    "string (1-2 words identifying the first detected emotional trigger, in the matching language)",
    "string (1-2 words identifying the second detected emotional trigger, in the matching language)"
  ],
  "alternatives": [
    "string (first healthier alternative reply option in the matching language, e.g., using I-statements or collaborative phrasing)",
    "string (second healthier alternative reply option in the matching language)",
    "string (third healthier alternative reply option in the matching language)"
  ]
}

Ensure the output is ONLY the raw JSON object (no markdown code blocks, no backticks, no wrap, no introductory or concluding text).
`;

        start = Date.now();
        const response = await model.generateContent(prompt);
        const resultText = response.response.text();
        if (!resultText) throw new Error("Empty response received from Gemini API");
        const duration = Date.now() - start;

        // RESILIENT SANITIZATION: Remove any markdown code blocks (```json ... ```) to prevent JSON parse failures
        let cleanText = resultText.trim();
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        }

        const parsedResult = JSON.parse(cleanText);
        if (parsedResult && Array.isArray(parsedResult.triggers) && Array.isArray(parsedResult.alternatives) && parsedResult.alternatives.length >= 3) {
          // Normalize inputs
          const finalTriggers = parsedResult.triggers.map((t: any) => String(t).trim());
          const finalAlternatives = parsedResult.alternatives.slice(0, 3).map((a: any) => String(a).replace(/&apos;/g, "'").replace(/&quot;/g, '"').trim());

          console.log(`✅ [Conflict AI API] Real Gemini-generated conflict resolution completed via ${keyLabel}!`);
          logApiKeyUsage("/api/conflict-resolution (Conflict Resolution)", currentKey, "success", duration);
          return NextResponse.json({
            success: true,
            result: {
              triggers: finalTriggers,
              alternatives: finalAlternatives
            },
            source: "gemini_ai"
          });
        } else {
          throw new Error("Gemini response is not a valid JSON containing triggers and 3 alternatives");
        }

      } catch (error: any) {
        const duration = (typeof start === "number") ? Date.now() - start : 0;
        console.error(`❌ [Conflict AI API] ${keyLabel} failed: ${error.message}`);
        const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("quota");
        if (isRateLimit && attempt < apiKeys.length - 1) {
          console.warn(`⚠️ [Conflict AI API] ${keyLabel} hit rate limit (429). Rotating key...`);
          logApiKeyUsage("/api/conflict-resolution (Conflict Resolution)", currentKey, "failed", duration, `Rate limit (429): ${error.message}`);
          continue;
        }
        logApiKeyUsage("/api/conflict-resolution (Conflict Resolution)", currentKey, "failed", duration, error.message);
        if (attempt === apiKeys.length - 1) {
          console.error("❌ [Conflict AI API] All API keys exhausted. Falling back to local dynamic engine.");
        }
      }
    }

    // 5. Ultimate fallback if all Gemini attempts fail
    const fallbackResult = generateConflictFallback(message);
    return NextResponse.json({
      success: true,
      result: fallbackResult,
      source: "local_fallback"
    });

  } catch (error: any) {
    console.error("❌ [Conflict AI API] Error generating conflict resolution:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate conflict alternatives." },
      { status: 500 }
    );
  }
}
