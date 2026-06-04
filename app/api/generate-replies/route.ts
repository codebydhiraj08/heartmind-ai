import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logApiKeyUsage } from "@/lib/api-key-tracker";

export const dynamic = "force-dynamic";

const toneDetails: Record<string, { name: string; description: string }> = {
  mature: { name: "Mature", description: "Thoughtful, deep, emotionally mature, and composed" },
  calm: { name: "Calm", description: "Peaceful, soothing, anxiety-reducing, and understanding" },
  confident: { name: "Confident", description: "Assertive, strong, highly reassuring, and respectfully supportive" },
  emotional: { name: "Emotional", description: "Heartfelt, vulnerable, highly expressive, and deeply loving" },
  funny: { name: "Funny", description: "Light-hearted, sweet, playful, cute, and witty" },
  apology: { name: "Apology", description: "Accountable, genuine, deeply validating, and healing" },
  conflict: { name: "Conflict Resolution", description: "De-escalating, collaborative ('us vs the problem'), and peaceful" }
};

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

// Highly emotional, validation-first randomized fallback pools (supporting English, Hinglish, Marathi, and Devanagari Hindi)
function generateDynamicFallbackReplies(message: string, tone: string): string[] {
  const words = message.toLowerCase();
  
  // Devanagari Unicode Range Detector
  const isDevanagari = /[\u0900-\u097F]/.test(message);
  
  // Distinct Marathi keywords in Devanagari and Latin script
  const marathiWords = /आहे|आहेस|आहेत|माझा|माझी|माझे|तुझा|तुझी|तुझे|काय|कुठे|खूप|करत|बोल|ताण|नको|मला|तुला|आवाज|ळ|चहा|प्रेम|सुंदर|तुम्ही|आम्ही|कसे|कसा|कशी|झाला|झाली/i;
  const hasMarathi = (isDevanagari && marathiWords.test(message)) || 
    /mi|tu|aahe|chhaan|mahit|mala|tula|kaay|bol|khup|prem|cha|chi|che|doke|trass|shanti|jiv|sunder/i.test(message);
    
  // Hindi in Devanagari script (Devanagari input that is not Marathi)
  const hasHindiDevanagari = isDevanagari && !marathiWords.test(message);
  
  // Hinglish
  const hasHinglish = /tum|na|hai|hu|ko|se|hi|bhi|ki|ke|tera|meri|kya|yaar|aur|nhi|nahi|acha|accha|vhi|vo|muze|mujhe|toh/i.test(message);

  const shuffle = (array: string[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  // 1. Marathi Fallback Pools (Devanagari/Latin matched)
  if (hasMarathi) {
    const pools: Record<string, string[]> = {
      mature: [
        "आपल्या दोघांमध्ये खुलेपणाने संवाद असणे खूप महत्त्वाचे आहे. चला यावर शांतपणे बोलूया. ❤️",
        "तुझ्या भावनांचा मी पूर्ण आदर करतो/करते. आपण एकत्र बसून यावर मार्ग काढूया.",
        "पूर्ण गोष्ट ऐकून घेतल्याशिवाय उत्तर देणे चुकीचे ठरेल. मी नेहमी तुझ्यासोबत आहे.",
        "आपल्या नात्यात समजूतदारपणा सर्वात महत्त्वाचा आहे. आपण एकत्र मिळून विचार करूया.",
        "मला तुझा दृष्टिकोन समजून घ्यायचा आहे. चला शांततेत चर्चा करूया.",
        "आपले नाते मजबूत ठेवण्यासाठी आपण दोघांनी प्रयत्न केले पाहिजेत."
      ],
      calm: [
        "काळजी करू नकोस, सर्व काही ठीक होईल. मी नेहमी तुझ्या पाठीशी उभा/उभी आहे. 🥰",
        "थोड्या शांततेने विचार कर, मी तुझ्यासोबत आहे. नाते प्रत्येक संकटापेक्षा मोठे आहे.",
        "तुला कम्फर्टेबल वाटणे हेच माझ्यासाठी सर्वात महत्त्वाचे आहे. आराम कर, काही काळजी नको.",
        "शांत रहा, आपण दोघे मिळून यावर नक्कीच मार्ग काढू शकतो.",
        "माझा हेतू तुला शांतता देणे हाच आहे. कोणतीही चिंता करू नकोस.",
        "तुझे बोलणे नेहमी माझ्या मनाला शांतता देते. चला आरामात बोलूया."
      ],
      confident: [
        "मला आपल्या नात्यावर पूर्ण विश्वास आहे. आपण कोणत्याही परिस्थितीला एकत्र सामोरे जाऊ. 💪",
        "मी तुझ्यासाठी १००% कमिटेड आहे. चला कोणत्याही भीतीशिवाय मोकळेपणाने बोलूया.",
        "आपले मतभेद आपल्या नात्याला अजून मजबूत बनवतील. आपण एक खूप छान टीम आहोत.",
        "आपल्या विश्वासाला तडा जाणार नाही याची मी काळजी घेईन. मी तुझ्यासोबत आहे.",
        "आपण एकत्र आहोत तर कोणतीही गोष्ट अशक्य नाही. चला सकारात्मक राहूया.",
        "आपल्यातील नाते आणि विश्वास हीच आपली सर्वात मोठी शक्ती आहे."
      ],
      emotional: [
        "तुझे हे बोलणे थेट माझ्या मनाला भिडले. तू माझे संपूर्ण जग आहेस! 😭❤️",
        "मी कितीही व्यस्त असलो/असले तरी तू माझ्यासाठी सर्वात आधी आहेस. तुझे सुख हेच माझे सुख आहे.",
        "तुझे हसणे पाहून माझा पूर्ण दिवस छान जातो. तू माझी सर्वात आनंदी जागा आहेस.",
        "माझी प्रत्येक भावना तुझ्यापासूनच सुरू होते. माझे तुझ्यावर खूप प्रेम आहे.",
        "तुझ्याशिवाय मी माझ्या आयुष्याची कल्पनाही करू शकत नाही. तू माझे सर्वस्व आहेस.",
        "तू माझ्या आयुष्यातील सर्वात सुंदर आणि महत्त्वाची व्यक्ती आहेस."
      ],
      funny: [
        "हाहाहा, शेवटी मी तुझा स्ट्रेस बस्टर आहेच! चला आता याच आनंदावर आईस्क्रीम खायला जाऊया? 🍦",
        "जर जास्त विचार करणे हा एखादा खेळ असता, तर आपण दोघे प्रो चॅम्पियन झालो असतो! 😂 Let's chill.",
        "काळजी नको करू! माझ्या आयुष्याचे एकच ध्येय आहे - तुझ्या गोड चेहऱ्यावर हसू आणणे.",
        "माझ्या मेंदूने सांगितले शांत रहा, मनाने सांगितले खरे बोला, आणि तोंडून काहीतरी वेगळेच निघाले! 🤪",
        "Chalo saare stress la baher takuya ani ek mast romantic long drive la jauya!",
        "स्ट्रेस पळाला ना? चला आता आपण दोघे मिळून विनाकारण खूप हसूया! 😂"
      ],
      apology: [
        "माझ्या बोलण्यामुळे तुला दुखापत झाली असेल तर मी मनापासून माफी मागतो/मागते. 🥺",
        "मला जाणीव आहे की तुला वाईट वाटले. मी स्वतःला नक्कीच सुधारेन आणि काळजी घेईन.",
        "प्लीज माझी माफी स्वीकार कर. तुझ्या भावना माझ्यासाठी खूप महत्त्वाच्या आहेत.",
        "मी पुन्हा अशी चूक होणार नाही याची काळजी घेईन. तुझा आनंद सर्वात महत्त्वाचा आहे.",
        "मला माहित आहे मी चुकलो/चुकले. प्लीज मला ही चूक दुरुस्त करण्याची एक संधी दे.",
        "तुला दुःखी पाहून माझे स्वतःचे मन खूप दुखावते. आय एम रिअली सॉरी."
      ],
      conflict: [
        "मला तुझ्याशी भांडायचे नाहीये. चला थोडा वेळ शांत राहून मग बोलूया. 🤗",
        "आपले विचार वेगळे असू शकतात पण शेवटी आपण एक आहोत. चला सुवर्णमध्य शोधूया.",
        "तुझे म्हणणे अगदी बरोबर आहे. चला या समस्येचा 'आपण विरुद्ध समस्या' म्हणून एकत्र मुकाबला करूया.",
        "रागाच्या भरात गोष्टी बिघडतात. चला शांतपणे एकमेकांचे म्हणणे ऐकून घेऊया.",
        "मला तुला दुखावायचे नाहीये, फक्त माझे मत मांडायचे होते. चला गोड बोलूया.",
        "आपल्यातील प्रेम या छोट्याशा वादापेक्षा खूप मोठे आहे. भांडण संपवूया."
      ]
    };
    const selectedPool = pools[tone] || pools.mature;
    return shuffle(selectedPool).slice(0, 3);
  }

  // 2. Devanagari Hindi Fallback Pools
  if (hasHindiDevanagari) {
    const pools: Record<string, string[]> = {
      mature: [
        "हमारे बीच खुलकर बात होना सबसे ज़रूरी है। चलिए इस पर शांत होकर बात करते हैं। ❤️",
        "मैं आपकी भावनाओं का पूरा सम्मान करता/करती हूँ। चलिए साथ बैठकर इस पर विचार करते हैं।",
        "पूरी बात सुने बिना कोई भी प्रतिक्रिया देना ठीक नहीं होगा। मैं हमेशा आपके साथ हूँ।",
        "रिश्ते में आपसी समझ सबसे महत्वपूर्ण होती है। हम दोनों मिलकर इसका हल निकाल लेंगे।",
        "मुझे आपका नज़रिया समझना है। बिना किसी जल्दबाजी के बैठकर बात करते हैं।",
        "हमारे बीच का तालमेल मेरे लिए बहुत मूल्यवान है। चलिए शांति से बात करें।"
      ],
      calm: [
        "चिंता मत करो, सब ठीक हो जाएगा। मैं हमेशा तुम्हारे साथ खड़ा/खड़ी हूँ। 🥰",
        "थोड़ा शांत होकर सोचो, मैं तुम्हारे साथ हूँ। हमारा रिश्ता हर मुश्किल से बड़ा है।",
        "तुम्हारा सहज महसूस करना ही मेरे लिए सबसे ज़रूरी है। आराम करो, कोई बात नहीं।",
        "शांत रहो, हम दोनों मिलकर इसका हल आराम से निकाल लेंगे।",
        "मेरा उद्देश्य तुम्हें केवल सुकून देना है। सारा तनाव हम मिलकर दूर कर देंगे।",
        "तुम्हारी हर बात मेरे लिए सुकून की तरह है। चलिए शांति से चर्चा करते हैं।"
      ],
      confident: [
        "मुझे हमारे रिश्ते पर पूरा भरोसा है। हम हर चुनौती का मिलकर सामना करेंगे। 💪",
        "मैं तुम्हारे लिए पूरी तरह से प्रतिबद्ध हूँ। चलिए बिना किसी झिझक के खुलकर बात करते हैं।",
        "हमारे मतभेद हमें और मजबूत बनाएंगे। हम एक बहुत अच्छी टीम हैं।",
        "हमारे भरोसे को कभी ठेस नहीं पहुँचेगी। मैं हमेशा तुम्हारे साथ खड़ा हूँ।",
        "हम दोनों साथ हैं तो कोई भी समस्या बड़ी नहीं है। सकारात्मक रहें।",
        "आपसी विश्वास ही हमारे रिश्ते की सबसे बड़ी ताकत है।"
      ],
      emotional: [
        "आपकी ये प्यारी बातें मेरे दिल को छू गईं। आप मेरी पूरी दुनिया हैं! 😭❤️",
        "मैं कितना भी व्यस्त रहूँ, आप मेरे दिल में सबसे ऊपर हैं। आपका सुकून ही मेरा सुकून है।",
        "तुम्हारी मुस्कान देखकर मेरा पूरा दिन बन जाता है। तुम मेरी सबसे प्यारी जगह हो।",
        "मेरी हर भावना तुमसे ही शुरू होती है। मैं तुमसे बहुत प्यार करता/करती हूँ।",
        "तुम्हारे बिना मैं अपने जीवन की कल्पना भी नहीं कर सकता/सकती। तुम मेरा हमेशा हो।",
        "तुम मेरे जीवन की सबसे सुंदर और अनमोल इंसान हो।"
      ],
      funny: [
        "हाहाहा, मैं तो तुम्हारा स्ट्रेस बस्टर हूँ ही! चलिए इसी बात पर एक चाय पार्टी हो जाए? ☕",
        "अगर ज़्यादा सोचना एक खेल होता, तो हम दोनों प्रो चैंपियन होते! 😂 Let's chill.",
        "चिंता मत करो! मेरा एक ही लक्ष्य है - तुम्हारे प्यारे चेहरे पर एक बड़ी सी मुस्कान लाना। 😊",
        "दिमाग ने कहा कूल रहो, दिल ने कहा सच बोलो, पर जुबां ने कुछ अजीब ही बोल दिया! 🤪",
        "चलो सारे तनाव को खिड़की से बाहर फेंकते हैं और एक लॉन्ग ड्राइव पर चलते हैं!",
        "तनाव गायब हो गया ना? चलिए अब इस खुशी में हम दोनों खूब हँसते हैं! 😂"
      ],
      apology: [
        "मुझे दिल से खेद है अगर मेरी किसी बात से आपको ठेस पहुँची हो। मेरा इरादा ऐसा नहीं था। 🥺",
        "मुझे समझ आ रहा है कि आपको बुरा लगा। मैं अपनी गलती मानता/मानती हूँ और इसमें सुधार करूँगा/करूँगी.",
        "कृपया मेरी माफ़ी स्वीकार करें। आपकी भावनाएँ मेरे लिए बहुत कीमती हैं।",
        "मैं वादा करता/करती हूँ कि आगे से इस बात का पूरा ध्यान रखूँगा/रखूँगी।",
        "मुझे पता है कि गलती मेरी थी। कृपया मुझे इसे ठीक करने का एक मौका दें।",
        "आपको दुखी देखकर मेरा अपना दिल बहुत रोता है। आई एम रियली सॉरी।"
      ],
      conflict: [
        "मैं तुमसे बहस नहीं करना चाहता/चाहती। चलिए थोड़ी देर बाद शांति से बात करते हैं। 🤗",
        "हम दोनों अलग सोच सकते हैं पर हम एक हैं। चलिए मिलकर कोई अच्छा रास्ता निकालते हैं।",
        "आपकी बातें बिल्कुल सही हैं। चलिए इस समस्या का 'हम दोनों बनाम समस्या' के रूप में सामना करते हैं।",
        "गुस्से में बातें बिगड़ जाती हैं। चलिए शांत होकर एक-दूसरे को सुनते हैं।",
        "मैं आपको ठेस नहीं पहुँचाना चाहता/चाहती, बस अपनी बात कह रहा/रही हूँ।",
        "हमारा प्यार इस छोटी सी लड़ाई से बहुत बड़ा है। चलिए सुलह कर लेते हैं।"
      ]
    };
    const selectedPool = pools[tone] || pools.mature;
    return shuffle(selectedPool).slice(0, 3);
  }

  // 3. Hinglish Fallback Pools
  if (hasHinglish) {
    const pools: Record<string, string[]> = {
      mature: [
        "Humare beech open communication aur understanding sabse important hai. Chalo ise aaram se discuss karte hain. ❤️",
        "Aapki baatein mere liye bohot value rakhti hain. Let's sit together and share our perspectives openly.",
        "Main aapki space aur emotions ki puri respect karta/karti hoon. Hum dono maturely iska solution nikal lenge.",
        "Puri baat sunne aur samajhne ke baad hi respond karna sahi rahega. Main humesha aapki side hoon.",
        "I completely understand where you are coming from, aur main humesha humare connection ko prioritize karunga/karungi.",
        "Aapka perspective mere liye bohot meaningful hai. Chalo sath baithkar baat karte hain."
      ],
      calm: [
        "Aww, sunkar bohot acha laga. Relax feel karo, main humesha yahan hoon tumhare paas. 🥰",
        "Sab kuch bilkul theek ho jayega. Koi tension mat lo, hum dono milkar har cheez aaram se handle kar lenge.",
        "Take your time, koi jaldi nahi hai. Main bas chahta/chahti hoon ki tum comfortable aur safe raho.",
        "Shanti se socho, main tumhare saath hoon. Humara connection har problem se bada hai.",
        "Mera aim bas tumhein peace dena hai. Har stress hum milkar door kar denge.",
        "Tumhari har baat mere liye ek sukoon ki tarah hai. Chalo aaram se baat karte hain."
      ],
      confident: [
        "Mujhe pata hai ki humara connection bohot strong hai, aur main humesha is relation ke liye stand karunga/karungi. 💪",
        "I am 100% committed to you. Chalo openly aur pure confidence ke sath baat karte hain, sab positive hoga.",
        "Humare differences humein aur strong banate hain. Let's handle this like the amazing team we are.",
        "I trust our bond completely. Kuch bhi ho jaye, humara trust humesha barkarar rahega.",
        "Hum dono sath hain toh koi bhi challenge bada nahi hai. Let's deal with this together.",
        "Connection tabhi strong hota hai jab hum ek doosre par absolute trust karte hain."
      ],
      emotional: [
        "Tumhari ye pyaari baatein mere dil ko chhu gayi. You mean the absolute world to me! 😭❤️",
        "Main kitna bhi busy rahoon, tum mere dil mein sabse upar ho. Tera sukoon hi mera sukoon hai.",
        "Aapki khushi hi mere liye sab kuch hai. Har din aapke sath bohot hi special aur blessed feel hota hai.",
        "Mera har ek emotion tumse hi shuru hota hai. Main tumse bohot pyaar karta/karti hoon.",
        "Tumhari smile dekhkar mera saara din ban jata hai. You are my happy place.",
        "Main tumhare bina apni life imagine bhi nahi kar sakta/sakti. You are my forever."
      ],
      funny: [
        "Hahaha, main toh tumhara personal stress buster hoon hi! Chalo ab jaldi se ice cream treat plan karein? 🍦",
        "Agar overthinking karna ek competitive game hota, toh hum dono pakka champions hote! 😂 Let's chill.",
        "Aww, don't worry! Mera ek hi goal hai - tumhare is pyaare se chehre par ek badi wali smile laana.",
        "Mera brain bola be cool, heart bola be honest, par mouth ne kuch aur hi badbada diya! Classic me! 🤪",
        "Chalo saare stress ko window se bahar fenkte hain aur ek romantic long drive par chalte hain!",
        "Stress disappear ho gaya? Chalo ab is khushi mein hum dono 10 minute tak bina wajah haste hain! 😂"
      ],
      apology: [
        "I am extremely sorry agar meri kisi baat se tumhein hurt hua ho. Mera intention kabhi wo nahi tha. 🥺",
        "Mujhe realize ho raha hai ki tumhein kitna bura laga. Main apni mistake accept karta/karti hoon aur ise improve karunga/karungi.",
        "Please accept my apology. Tumhari feelings mere liye bohot important hain aur main sab theek kar dunga/dungi.",
        "I promise main aage se dhyan rakhunga/rakhungi. Tumhara trust aur khushi mere liye sabse pehle hai.",
        "Main jaanta/jaanti hoon ki maine galti ki. Please mujhe ek chance do ise theek karne ka.",
        "Mujhe sach mein afsos hai. Tumhe hurt dekhkar mera apna dil bohot dukhta hai."
      ],
      conflict: [
        "Main tumse argue nahi karna chahta/chahti. Chalo thoda break lete hain fir shanti se discuss karenge. 🤗",
        "Hum dono alag soch sakte hain par hum ek team hain. Let's find a beautiful middle ground together.",
        "Tumhare points bilkul valid hain. Chalo is problem ko 'us vs the problem' ki tarah milkar sort out karte hain.",
        "Gusse mein baatein bigad jati hain. Chalo shanti se ek doosre ko sunte hain.",
        "Main tumhein hurt nahi karna chahta/chahti, bas apni baat clear kar raha/rahi hoon. Let's cooperate.",
        "Humare beech ka pyaar is choti si fight se bohot bada hai. Chalo sulah kar lete hain."
      ]
    };
    const selectedPool = pools[tone] || pools.mature;
    return shuffle(selectedPool).slice(0, 3);
  }

  // 3. English Fallback Pools (Default)
  const poolsEng: Record<string, string[]> = {
    mature: [
      "I appreciate you bringing this up. Let's find some dedicated time to talk through this properly. ❤️",
      "I hear where you're coming from. I want to fully understand your perspective so we can align our goals.",
      "Your feelings are completely valid. Let's discuss this calmly so we can both feel safe and heard.",
      "I value our connection deeply, and I'm always here to listen and grow together.",
      "Let's sit down and share our thoughts without any rush or assumptions.",
      "Relationships thrive on mutual respect, and I promise to respect your boundary and voice."
    ],
    calm: [
      "I'm right here with you. Take a deep breath, we will figure everything out step by step. 🥰",
      "There is absolutely no rush. Let's deal with this at whatever pace feels most comfortable for you.",
      "Your peace of mind matters most to me. Let's just focus on staying relaxed and cozy right now.",
      "Everything is going to be completely fine. Don't worry, we are in this together.",
      "I want to be your safe harbor. Just relax and let the stress float away.",
      "Listening to you always brings me peace too. Let's keep it calm and sweet."
    ],
    confident: [
      "I'm fully committed to working through this with you because our relationship is worth it. 💪",
      "I believe in us and I know we can find a healthy, positive solution together. Here's to us!",
      "I want to be completely open with you about my perspective, and I'm ready to listen to yours with respect.",
      "Nothing can break the trust we've built. I stand by you through thick and thin.",
      "We are an unstoppable team. Let's face this challenge head-on and make our bond stronger.",
      "I have absolute faith in our connection. We've got this."
    ],
    emotional: [
      "Reading your message makes me realize how deeply I care about you. You mean everything to me. 😭❤️",
      "I feel so incredibly connected to you right now. Thank you for always being my safe space.",
      "Your happiness is my highest priority, and I want to cherish every single moment with you.",
      "You make my heart skip a beat even after all this time. I am so lucky to have you.",
      "Every emotion of mine starts and ends with your beautiful presence.",
      "I love you more than words can ever express. You are my forever and always."
    ],
    funny: [
      "I think we both deserve a gold medal in overthinking! How about we pause the drama and grab food? 🍕",
      "My brain wanted to write a very poetic reply, but my stomach voted for a dinner date instead!",
      "I promise to always keep you laughing, even if my jokes are terrible! Let's smile today. 😊",
      "Stress disappear? That's my cue to perform my happy dance! 💃 Let's celebrate.",
      "You are the peanut butter to my jelly, and the crazy to my sanity! Let's stay weird together.",
      "Let's throw all worries in a box, lock it, and go eat some delicious desserts!"
    ],
    apology: [
      "I'm truly sorry for how my actions made you feel. You deserved much better care from me. 🥺",
      "I take full responsibility for this misunderstanding. I'm committed to doing better in the future.",
      "I was wrong, and I hate knowing I caused you stress. Let me make this up to you today.",
      "Please forgive me. Your trust is precious to me, and I want to heal any hurt I've caused.",
      "I am deeply sorry. Seeing you upset is the hardest thing for me.",
      "I apologize from the bottom of my heart. I promise to be more mindful."
    ],
    conflict: [
      "I don't want us to fight. Can we take a quick pause and make sure we're on the same team? 🤗",
      "Let's look at this as 'us vs. the problem', rather than 'me vs. you'. We can find a solution.",
      "Your side of the story is important to me. Let's work together to resolve this peacefully.",
      "Let's avoid raising our voices and instead raise our understanding. I'm listening.",
      "I value our peace more than winning an argument. Let's make peace.",
      "Let's cooperate and build a bridge instead of a wall. What do you need right now?"
    ]
  };

  const selectedPool = poolsEng[tone] || poolsEng.mature;
  return shuffle(selectedPool).slice(0, 3);
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
    const { message, tone } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Input message is required." },
        { status: 400 }
      );
    }

    const selectedTone = tone || "mature";
    const toneInfo = toneDetails[selectedTone] || toneDetails.mature;

    // 3. Load Gemini API Keys
    const apiKeys = loadApiKeys();

    if (apiKeys.length === 0) {
      console.log("📢 [AI Replies API] No valid Gemini API keys found. Using high-fidelity local dynamic response generator!");
      const fallbackReplies = generateDynamicFallbackReplies(message, selectedTone);
      return NextResponse.json({
        success: true,
        replies: fallbackReplies,
        source: "local_dynamic"
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

        // Refined system prompt to enforce strict language-matching (Marathi, Hinglish, English, Hindi, etc.)
        const prompt = `
You are a highly sophisticated relationship psychologist, empathetic communication expert, and high-EQ dialogue coach.
A partner has sent the following message:
"${message}"

Your task is to generate exactly 3 distinct, emotionally intelligent, highly natural, and highly contextual replies based on the selected tone.

Selected Response Tone: "${toneInfo.name}"
Tone Description: "${toneInfo.description}"

### RELATIONSHIP PSYCHOLOGY & LANGUAGE RULES (CRITICAL):
1. **Emotional validation first:** Every response must be deeply validating, sincere, and emotionally supportive. Use advanced NLP language that bridges connection and reduces anxiety.
2. **Language Autodetect & Absolute Matching (MANDATORY):**
   - **Autodetect** the exact language, dialect, and script of the partner's input message ("${message}").
   - **If the input is in Marathi** (e.g., तू कुठे आहेस?, काळजी, प्रेम, खूप, छान, trass, jiv, etc. written in Marathi script or Marathi-English translit), the generated replies **MUST** be in sweet, warm, high-EQ **Marathi**.
   - **If the input is in Hinglish** (Hindi written in English alphabets like "tumhara stress", "ho jata hai", "kya", etc.), the generated replies **MUST** be in modern, sweet, natural **Hinglish**.
   - **If the input is in English**, the generated replies **MUST** be in contemporary, natural, emotionally intelligent **English**.
   - **If the input is in Hindi (Devanagari)**, the generated replies **MUST** be in sweet, warm, natural **Hindi**.
   - **RULE:** The language, script, and emotional tone of the generated replies must **100% match** the input message's language and script. If the input message is code-mixed (e.g. Marathi-English mix), output in the same mix.
3. **Conversational Length Matching (CRITICAL):**
   - Carefully evaluate the length and word count of the partner's input message ("${message}").
   - If the input message is short (1-2 lines, or under 20 words, e.g. "Because I'm your peace 😌❤️" or "kya hua?"), the generated replies MUST be equally short, sweet, and concise (strictly 1 or 2 short sentences). Do NOT generate long, wordy paragraphs for simple brief inputs.
   - If the input message is long (multiple lines, detailed emotional paragraph), the generated replies should be proportionally longer and more detailed (2-3 sentences or a concise paragraph) to match their emotional investment and provide comprehensive validation.
4. Keep the replies conversational, realistic, and free of any robotic or cliché phrasing. Avoid overly generic templates.
5. **Strict Spoken Marathi & Hinglish Transliteration Guidelines (SPELLING & GRAMMAR CRITICAL):**
   - Do NOT make spelling or word mismatch mistakes when transliterating Marathi/Hinglish in English script:
     * Enforce **"shant"** or **"shaant"** (शांत) for quiet/calm. NEVER use **"sant"** (which means saint in Marathi).
     * Enforce **"aikun"** or **"aikoon"** (ऐकून) for listening/hearing. NEVER use **"aikon"**.
     * Enforce **"samjun"** (समजून) for understanding. NEVER use **"samjon"**.
     * Enforce **"kalte"** or **"kalatay"** (कळतंय) for understanding/knowing.
   - AVOID awkward literal structural translations of English. Make them sound like natural spoken texting. For example:
     * Instead of "Mi aata tujhya sathi purnpane ahe" (which is an awkward English literal structure), output natural phrasing like "Mi ahe na tujhya sathi purnpane, bol na kaay zala?" or "Mi tula samjun ghyayla nehmich ithech ahe."
     * Instead of "Jana ahe ki..." write "Mala kalat ahe ki..." or "Mala jaeniv ahe ki...".
   - Mimic how modern, warm, high-EQ partners actually text each other to ensure emotional resonance and absolute linguistic clarity.
6. Output your response as a valid JSON array containing exactly 3 string values, like:
[
  "First generated reply option",
  "Second generated reply option",
  "Third generated reply option"
]
Ensure the output is ONLY the raw JSON array (no markdown code blocks, no backticks, no wrap, no introductory or concluding text).
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
        if (Array.isArray(parsedResult) && parsedResult.length >= 3) {
          // Normalize to exactly 3 replies and remove any escaped quotes
          const finalReplies = parsedResult.slice(0, 3).map(r => String(r).replace(/&apos;/g, "'").replace(/&quot;/g, '"'));
          console.log(`✅ [AI Replies API] Real Gemini-generated replies completed via ${keyLabel}!`);
          logApiKeyUsage("/api/generate-replies (Generate Replies)", currentKey, "success", duration);
          return NextResponse.json({
            success: true,
            replies: finalReplies,
            source: "gemini_ai"
          });
        } else {
          throw new Error("Gemini response is not a valid string array of length >= 3");
        }

      } catch (error: any) {
        const duration = (typeof start === "number") ? Date.now() - start : 0;
        console.error(`❌ [AI Replies API] ${keyLabel} failed: ${error.message}`);
        const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("quota");
        if (isRateLimit && attempt < apiKeys.length - 1) {
          console.warn(`⚠️ [AI Replies API] ${keyLabel} hit rate limit (429). Rotating key...`);
          logApiKeyUsage("/api/generate-replies (Generate Replies)", currentKey, "failed", duration, `Rate limit (429): ${error.message}`);
          continue;
        }
        logApiKeyUsage("/api/generate-replies (Generate Replies)", currentKey, "failed", duration, error.message);
        if (attempt === apiKeys.length - 1) {
          console.error("❌ [AI Replies API] All API keys exhausted. Falling back to local dynamic engine.");
        }
      }
    }

    // 5. Ultimate fallback if all Gemini attempts fail
    const fallbackReplies = generateDynamicFallbackReplies(message, selectedTone);
    return NextResponse.json({
      success: true,
      replies: fallbackReplies,
      source: "local_dynamic_fallback"
    });

  } catch (error: any) {
    console.error("❌ [AI Replies API] Error generating replies:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AI replies." },
      { status: 500 }
    );
  }
}
