import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logApiKeyUsage } from "@/lib/api-key-tracker";

export const dynamic = "force-dynamic";

// Multi-key load balancing configuration
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

// Deterministic hash helper to select unique combinations for fallbacks
function getSimpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ---------------------------------------------------------
// Deep Local Psychological Engine (Resilience Fallback)
// ---------------------------------------------------------
interface FallbackComponent {
  validation: string[];
  insight: string[];
  reflection: string[];
}

const fallbackMatrices: Record<string, Record<string, FallbackComponent>> = {
  english: {
    conflict: {
      validation: [
        "It is completely natural to feel overwhelmed and distressed when conflict spikes in a relationship. I hear your pain.",
        "Conflict with someone you deeply care about can trigger an intense nervous system response. Your frustration is completely valid.",
        "Experiencing arguments and tension is incredibly draining. Thank you for sharing this weight with me."
      ],
      insight: [
        "Psychological studies show that circular arguments are rarely about the surface topic; they are usually a cry for emotional safety and validation. Pausing the fight for 10-15 minutes helps bring both partners out of fight-or-flight mode.",
        "According to relationship science, shifting from accusatory 'You' statements to vulnerable 'I' statements dramatically reduces defensiveness and fosters constructive dialogue.",
        "In deep relationship dynamics, conflict is often an opportunity to understand a hidden vulnerability. Trying to see the issue as 'Us vs. The Problem' instead of 'Me vs. You' builds deep security."
      ],
      reflection: [
        "What is the core emotional need (like reassurance or respect) that you felt was missing during this argument?",
        "How do you think your partner would respond if you shared your feelings of hurt rather than anger?",
        "If you could hit a pause button during high tension, what is one gentle boundary you could communicate to cool down?"
      ]
    },
    distance: {
      validation: [
        "Fluctuations in responsiveness or feeling ignored can trigger severe attachment anxiety. Your worry is entirely understandable.",
        "It is painful when your partner feels cold, busy, or distant. Feeling disconnected from someone you love is very hard.",
        "Sensing a communication gap or waiting for replies can feel like a heavy emotional burden. I completely validate your concern."
      ],
      insight: [
        "Our minds naturally construct worst-case scenarios when there is a communication void. Often, a partner's distance is a reflection of their personal stress or cognitive fatigue, rather than a decline in affection.",
        "Attachment theory indicates that anxious styles crave immediate reassurance, while avoidant styles withdraw when overwhelmed. Recognizing this difference helps prevent misinterpreting their busyness.",
        "Building predictable windows of connection—even small ones—can act as a buffer against distance anxiety, reassuring both partners of their bond."
      ],
      reflection: [
        "How can you communicate your need for connection in a soft, non-demanding way (e.g. 'I love hearing from you because it makes me feel close')?",
        "What are some healthy self-soothing activities you can focus on to calm your mind when replies are delayed?",
        "Have you and your partner established clear boundaries regarding how busy schedules are handled in communication?"
      ]
    },
    anxiety: {
      validation: [
        "Overthinking and feeling insecure can be extremely exhausting. Your desire for safety and stability is beautiful and valid.",
        "Feeling anxious or fearing that you might lose your connection is a heavy burden to carry. I am here for you.",
        "Doubt and worry about the relationship's future can trigger intense vulnerability. It is okay to feel scared."
      ],
      insight: [
        "Anxiety often arises from a deep emotional investment in the relationship. It is your system's way of trying to protect the bond from potential disruption.",
        "In attachment styles, security is built when we openly express our fears rather than letting them turn into defensive behavior. Emotional safety grows with shared vulnerability.",
        "Remember that thoughts are not facts. Your anxious thoughts are often echoes of past hurts, not accurate predictions of your current partner's intentions."
      ],
      reflection: [
        "What is one concrete, factual sign of love and commitment your partner has shown you recently to ground your mind?",
        "Can you pinpoint exactly what triggered this sudden spike in anxiety today?",
        "How can you kindly request reassurance from your partner in a way that invites them in rather than pushing them away?"
      ]
    },
    avoidance: {
      validation: [
        "When a partner shuts down, stonewalls, or avoids talks, it can feel like facing a cold wall. Your frustration is entirely valid.",
        "Dealing with avoidance and sudden disengagement is deeply hurtful and confusing. I understand how lonely that feels.",
        "It is highly distressing when important issues are ignored. Wanting to talk things through is a very healthy impulse."
      ],
      insight: [
        "Psychology tells us that avoidant partners do not withdraw because they don't care; they withdraw because their nervous system is flooded with stress, and they need solitude to regulate.",
        "Chasing an avoidant partner usually intensifies their need to run. Giving them structured space (e.g., 'Let's take an hour, then talk') lets them return feeling safe.",
        "Stonewalling is often a self-preservation mechanism rather than a rejection. Learning to co-regulate before addressing tough topics prevents this cycle."
      ],
      reflection: [
        "How can you offer them a small, safe pocket of space while still keeping the door open for communication?",
        "What is one way you can focus on your own peace of mind while they are in their shell?",
        "If you approach them with: 'I want to understand your perspective when you are ready,' how do you think they would react?"
      ]
    },
    love: {
      validation: [
        "Your desire to deepen your intimacy and build a stronger, more romantic bond is wonderful. It shows your beautiful dedication.",
        "Wanting to align your love languages and feel closer is a sign of a very healthy, growth-oriented relationship.",
        "It is sweet to focus on emotional connection and affection. I appreciate your openness to nurture this love."
      ],
      insight: [
        "Intimacy is built in small, daily moments of emotional coordination—what psychologists call 'emotional bids.' Responding positively to these bids builds immense security.",
        "Understanding each other's unique love language allows you to express affection in a way that is easily recognized and appreciated by them.",
        "True relationship satisfaction thrives when we deliberately practice active appreciation and express gratitude for the small things our partners do."
      ],
      reflection: [
        "What is one small, unexpected act of kindness or appreciation you can surprise your partner with today?",
        "Do you know what your partner's primary love language is, and how can you feed it this week?",
        "When was the last time you sat together with no screens, just sharing stories and laughing?"
      ]
    },
    general: {
      validation: [
        "Thank you for sharing your thoughts with me. Seeking growth and perspective is a powerful step in any relationship.",
        "It takes courage to reflect on relationship dynamics and seek advice. I am honored to walk this path with you.",
        "Every relationship is a unique journey with its own rhythm. Your dedication to understanding this rhythm is very inspiring."
      ],
      insight: [
        "A healthy partnership is not the absence of problems, but the shared capability to navigate them together as a unified team.",
        "Emotional intelligence in relationships is built on curiosity—asking 'Why is my partner feeling this?' instead of reacting to their immediate defense.",
        "Setting healthy boundaries and maintaining your individuality actually strengthens your connection, fostering mutual respect."
      ],
      reflection: [
        "What is one small communication habit you would love to improve in yourself to support your relationship?",
        "How can you treat yourself with more self-compassion as you navigate these emotional waves?",
        "If you could summarize the biggest emotional need in your life right now, what would it be?"
      ]
    }
  },
  hinglish: {
    conflict: {
      validation: [
        "Jhagda aur gusse ke time par pareshaan aur overwhelmed feel karna bilkul normal hai. Main aapki tension ko samajh sakta hoon. ❤️",
        "Apne kisi khaas se behas hona humare nervous system ko disturb kar deta hai. Aapka gussa hona aur stress me hona bilkul जायज़ (valid) hai.",
        "Tension aur arguments humari saari energy choos lete hain. Is emotional weight ko mere sath share karne ke liye thank you."
      ],
      insight: [
        "Relationship psychology kehti hai ki jhagde aksar topic par nahi, balki emotional safety aur respect ki wajah se hote hain. Jab gussa zyada ho, to 10 min ka silent pause lene se dimaag shaant hota hai.",
        "Aksar 'Tumne ye kiya' bolne se partner defensive ho jata hai. Iski jagah 'Mujhe aisa feel hua' (I-statements) bolne se baatein bina jhagde ke solve hoti hain.",
        "Problems ko 'Main vs Tum' dekhne ke bajaye 'Hum dono vs Problem' dekhna shuru kijiye. Ye aap dono ke bond ko bohot majboot banayega."
      ],
      reflection: [
        "Aapko kya lagta hai, is jhagde ke piche aapki kaunsi emotional zaroorat (jaise respect ya security) adhoori reh gayi thi?",
        "Agar aap gusse ke bajaye apne partner ko apna hurt aur dard dikhayein, to unka reaction kaisa hoga?",
        "Next time jab baatein garam hone lagein, to kya aap dono pehle se tay kiya gaya koi code word bol kar shaant ho sakte hain?"
      ]
    },
    distance: {
      validation: [
        "Partner ke busy hone par ya door feel hone par bechaini aur overthinking hona bilkul natural hai. Aapki bechaini ko main validate karta hoon.",
        "Jab koi pyara cold ya distant behave karta hai, to bohot akela feel hota hai. Main samajh sakta hoon ki ye gap aapko hurt kar raha hai.",
        "Replies ka wait karna ya communication gap dekhna sach me dimaag kharab kar deta hai. Aapki ye worry bilkul normal hai."
      ],
      insight: [
        "Aksar jab hume replies nahi milte, to humara dimaag bure thoughts sochne lagta hai. Par yad rakhein, unka busy hona unki life ke stress ki wajah se ho sakta hai, aapse interest khone ki wajah se nahi.",
        "Attachment theory kehti hai ki ek partner jab tension me darta hai to wo jaldi reply chahta hai, aur dusra partner shanti ke liye peeche hat jata hai. Is pattern ko samajhna zaroori hai.",
        "Aapas me ek fixed time rakhna (jaise raat ko 15 min call) doori ki anxiety ko khatam karne me bohot help karta hai."
      ],
      reflection: [
        "Kya aap bina kisi shikayat ke apne partner se soft tarike se keh sakte hain ki unka ek chota sa message bhi aapke dimaag ko kitna sukoon deta hai?",
        "Jab wo busy hon, to aap apna dhyan bhatkane aur khud ko calm rakhne ke liye kya kar sakte hain?",
        "Kya aap dono ne busy schedules ke dauran ek dusre ko inform karne ka koi simple rule banaya hai?"
      ]
    },
    anxiety: {
      validation: [
        "Insecure feel karna aur lagatar overthinking karna bohot thaka dene wala hota hai. Aapka safety aur pyaar chahna bohot pyaara hai.",
        "Darr hona ki sab kuch kharab ho jayega, ek bohot bada emotional bojh hai. Main aapke is darr ko validate karta hoon, aap akele nahi hain.",
        "Rishte ke future ko lekar bechaini hona is baat ka saboot hai ki aap is rishte se kitna pyaar karte hain. Par is tension se khud ko pareshan mat kijiye."
      ],
      insight: [
        "Anxiety tab badhti hai jab humare purane bure experiences hume lagte hain ki dobara hone wale hain. Apne partner ke sath khul kar apne darr ko share karna security build karta hai.",
        "Vulnerability (apne darr ko khul kar bolna) rishte ko kamzor nahi, balki bohot majboot aur close banati hai.",
        "Yad rakhein ki jo hum sochte hain, wo hamesha sach nahi hota. Aapke darr ke thoughts aksar purani yaadein hoti hain, aapka present nahi."
      ],
      reflection: [
        "Aapke partner ne haal hi me aisi kaunsi baat ki ya kiya jisse unka aapke prati pyaar aur commitment saaf dikhta hai?",
        "Kya aap samajh sakte hain ki aaj specific kis baat ne aapki is insecurity ko achanak trigger kiya?",
        "Aap apne partner se reassurance (bharosa) kaise maang sakte hain bina unpar blame lagaye?"
      ]
    },
    avoidance: {
      validation: [
        "Jab partner baat karna band kar deta hai ya avoid karta hai, to aisa lagta hai jaise saamne koi deewar khadi ho. Aapka frustrated hona bilkul normal hai.",
        "Stonewalling ya silent treatment jhelna bohot lonely aur hurtful feel karwata hai. Main aapke is dard ko acche se samajhta hoon.",
        "Important baaton ko ignore hote dekhna bohot dukh deta hai. Baat solve karne ki koshish karna aapki ek bohot acchi aadat hai."
      ],
      insight: [
        "Psychology kehti hai ki avoidant partners isliye dur nahi bhaagte ki wo care nahi karte, balki wo nervous system ke stress se darr kar chup ho jate hain taaki jhagda aur na bade.",
        "Chup rehne wale partner ke peeche padne se wo aur door bhaagte hain. Unhe thoda space dekar bolna ki 'Jab tum ready ho, hum baat karenge' unhe safe feel karwata hai.",
        "Silent treatment ko aapse nafrat na samajhein, ye unka stress se deal karne ka ek tarika hai, bhale hi ye galat tarika ho."
      ],
      reflection: [
        "Aap unhe space kaise de sakte hain bina khud ko unse disconnected feel karwaye?",
        "Jab wo apne shell me hon, to aap apne sukoon aur peace ke liye kya self-care kar sakte hain?",
        "Kya aap unhe bol sakte hain ki: 'Main tumhari silence ki respect karta hoon, par jab tum comfortable ho please mujhse baat karna'?"
      ]
    },
    love: {
      validation: [
        "Apne rishte me pyaar, respect aur closeness ko badhane ki koshish karna ek bohot hi khoobsurat baat hai. Mujhe aapki effort bohot acchi lagi. ❤️",
        "Love languages ko samajhna aur ek dusre ke close aana ek lambe aur khushhaal rishte ki chabi hai.",
        "Emotional connection ko strong karne par focus karna sach me bohot heartwarming hai. Main isme aapki poori madad karunga."
      ],
      insight: [
        "Pyaar bade surprises se nahi, balki daily ki choti-choti appreciation aur attention (emotional bids) se gehra hota hai.",
        "Apne partner ki love language ko samajh kar jab hum unhe unki language me pyaar dete hain, to wo rishta ek dam safe aur secure ban jata hai.",
        "Aapas me gratitude (shukriya) express karna rishte ke saare stress ko dhire-dhire khatam kar deta hai."
      ],
      reflection: [
        "Aisi kaunsi choti si sweet baat ya help hai jo aap aaj apne partner ke liye surprise ki tarah kar sakte hain?",
        "Kya aapko pata hai ki aapke partner ko sabse zyada pyaar kab feel hota hai (gifts se, tareef se, help se, ya sath time spend karne se)?",
        "Aapne aakhri baar kab unhe bina kisi wajah ke gale lagaya tha aur thank you bola tha?"
      ]
    },
    general: {
      validation: [
        "Mujhe apni dil ki baat batane ke liye thank you. Apne rishte ko behtar banane ke liye sochna hi ek bohot bada aur positive step hai.",
        "Relationship me dhyan dena aur samajhne ki koshish karna ek mature partner ki pehchan hai. Main aapke sath hoon.",
        "Har rishta ek unique journey hota hai jisme utar-chadaav aate rehte hain. Aapka is journey par commitment bohot inspiring hai."
      ],
      insight: [
        "Ek accha rishta wo nahi hai jisme kabhi problems na hon, balki wo hai jisme dono problems se milkar ladne ke liye taiyar rehte hain.",
        "Rishte me curiosity (jaan ne ki chah) rakhein—sochein ki 'Mera partner aisa behave kyu kar raha hai' bajaye iske ki turant gussa ho jayein.",
        "Apne liye healthy boundaries rakhna aur khud ki life par focus karna rishte ko kamzor nahi balki aur fresh aur healthy banata hai."
      ],
      reflection: [
        "Aap apne communication style me aisi kaunsi choti aadat badalna chahenge jisse rishte me shanti rahe?",
        "Is emotional situation me aap khud ko thoda aur pyaar aur patience kaise de sakte hain?",
        "Agar aapko is waqt rishte me sabse badi zaroorat mehsoos ho rahi hai, to wo kya hai?"
      ]
    }
  },
  hindi: {
    conflict: {
      validation: [
        "आपसी मनमुटाव या गुस्से के समय असहज महसूस करना पूरी तरह से स्वाभाविक है। मैं आपकी इस चिंता और तनाव को समझ सकता हूँ। ❤️",
        "अपने प्रियजन से विवाद होना हमारे मानसिक सुकून को प्रभावित करता है। आपका क्रोधित होना और तनावग्रस्त महसूस करना बिल्कुल स्वाभाविक है।",
        "तनाव और बहस मानसिक ऊर्जा को पूरी तरह से सोख लेते हैं। इस भावनात्मक बोझ को मेरे साथ साझा करने के लिए धन्यवाद।"
      ],
      insight: [
        "संबंध मनोविज्ञान (relationship psychology) के अनुसार, अधिकांश विवाद सतही मुद्दों पर नहीं, बल्कि भावनात्मक सुरक्षा और सम्मान की कमी के कारण होते हैं। क्रोध बढ़ने पर 10 मिनट का मौन विराम मस्तिष्क को शांत करने में सहायक होता है।",
        "आरोप लगाने वाली भाषा ('तुमने ऐसा किया') के स्थान पर अपनी भावनाओं को व्यक्त करने वाली भाषा ('मुझे ऐसा महसूस हुआ') का उपयोग करने से साथी का रक्षात्मक रवैया कम होता है और बातचीत सफल होती है।",
        "समस्याओं को 'मैं बनाम तुम' के रूप में देखने के बजाय 'हम दोनों बनाम समस्या' के रूप में देखना शुरू करें। यह आपके बंधन को अत्यंत सुदृढ़ बनाएगा।"
      ],
      reflection: [
        "आपको क्या लगता है, इस बहस के पीछे आपकी कौन सी भावनात्मक आवश्यकता (जैसे सम्मान या सुरक्षा) अधूरी रह गई थी?",
        "यदि आप क्रोध के स्थान पर अपने साथी को अपनी उदासी या आहत महसूस होने की बात बताएं, तो उनकी प्रतिक्रिया कैसी होगी?",
        "भविष्य में बहस बढ़ने की स्थिति में क्या आप दोनों एक शांतिपूर्ण विराम लेने का कोई नियम बना सकते हैं?"
      ]
    },
    distance: {
      validation: [
        "साथी के व्यस्त होने या दूरी महसूस होने पर घबराहट और अत्यधिक सोच (overthinking) होना पूरी तरह से सामान्य है। मैं आपकी इस भावना का सम्मान करता हूँ।",
        "जब कोई प्रियजन उदासीन या दूर महसूस होता है, तो बहुत अकेलापन महसूस होता है। मैं समझ सकता हूँ कि यह संवादहीनता आपको आहत कर रही है।",
        "प्रतिक्रिया (reply) की प्रतीक्षा करना या बातचीत में दूरी देखना मानसिक रूप से बहुत तनावपूर्ण होता है। आपकी यह चिंता सर्वथा उचित है।"
      ],
      insight: [
        "अक्सर जब हमें उत्तर नहीं मिलते, तो हमारा मन नकारात्मक कल्पनाएँ करने लगता है। ध्यान रखें, उनकी व्यस्तता उनके व्यक्तिगत जीवन के तनाव के कारण हो सकती है, न कि आपसे रुचि कम होने के कारण।",
        "संबंध सिद्धांत के अनुसार, एक साथी तनाव में निकटता चाहता है, जबकि दूसरा शांति के लिए दूरी बनाता है। इस पैटर्न को समझना और स्वीकार करना महत्वपूर्ण है।",
        "आपसी सहमति से एक निश्चित समय (जैसे रात को 15 मिनट की बातचीत) तय करना इस दूरी से उत्पन्न होने वाली चिंता को शांत करने में बहुत मदद करता।"
      ],
      reflection: [
        "क्या आप बिना किसी शिकायत के अपने साथी से मधुर शब्दों में कह सकते हैं कि उनका एक छोटा सा संदेश भी आपके मन को कितना सुकून देता है?",
        "जब वे व्यस्त हों, तो आप अपना ध्यान केंद्रित करने और स्वयं को शांत रखने के लिए क्या रचनात्मक कर सकते हैं?",
        "क्या आप दोनों ने व्यस्त दिनचर्या के दौरान एक-दूसरे को सूचित करने का कोई सरल नियम बनाया है?"
      ]
    },
    anxiety: {
      validation: [
        "असुरक्षित महसूस करना और निरंतर अत्यधिक सोचना (overthinking) बहुत थका देने वाला होता है। आपका सुरक्षा और प्रेम की चाह रखना अत्यंत सुंदर है।",
        "यह भय होना कि सब कुछ समाप्त हो जाएगा, एक बहुत बड़ा भावनात्मक बोझ है। मैं आपके इस भय को समझता हूँ, आप अकेले नहीं हैं।",
        "रिश्ते के भविष्य को लेकर बेचैनी होना इस बात का प्रमाण है कि आप इस रिश्ते से कितना प्रेम करते हैं। परंतु इस तनाव को स्वयं पर हावी न होने दें।"
      ],
      insight: [
        "चिंता अक्सर तब बढ़ती है जब हमारे पुराने बुरे अनुभव हमें वर्तमान में दोबारा घटित होते हुए प्रतीत होते हैं। अपने साथी के साथ खुलकर अपने भय को साझा करना रिश्ते में सुरक्षा लाता है।",
        "अपनी संवेदनशीलताओं और डरों को साझा करना रिश्ते को कमजोर नहीं, बल्कि अत्यंत आत्मीय और मजबूत बनाता है।",
        "स्मरण रखें कि जो विचार हमारे मन में आते हैं, वे सदैव सत्य नहीं होते। आपके भय के विचार अक्सर अतीत की प्रतिध्वनि होते हैं, वर्तमान की वास्तविकता नहीं।"
      ],
      reflection: [
        "आपके साथी ने हाल ही में ऐसा क्या किया जिससे उनका आपके प्रति प्रेम और प्रतिबद्धता स्पष्ट रूप से दिखाई देती है?",
        "क्या आप समझ सकते हैं कि आज विशेष रूप से किस बात ने आपकी इस असुरक्षा को अचानक जागृत किया?",
        "आप अपने साथी से बिना कोई दोषारोपण किए आश्वासन (reassurance) कैसे मांग सकते हैं?"
      ]
    },
    avoidance: {
      validation: [
        "जब साथी बातचीत बंद कर देता है या दूरी बना लेता है, तो ऐसा लगता है जैसे सामने कोई दीवार खड़ी हो। आपकी हताशा पूरी तरह से स्वाभाविक है।",
        "मौन व्यवहार (silent treatment) को सहन करना बहुत अकेलापन और पीड़ादायक महसूस करवाता है। मैं आपकी इस पीड़ा को भली-भांति समझता हूँ।",
        "महत्वपूर्ण विषयों को अनदेखा होते देखना बहुत आहत करता है। समस्याओं को हल करने का प्रयास करना आपकी एक बहुत अच्छी आदत है।"
      ],
      insight: [
        "मनोविज्ञान के अनुसार, दूर भागने वाले साथी (avoidant partners) इसलिए दूर नहीं जाते कि वे परवाह नहीं करते, बल्कि वे तनाव के कारण मौन हो जाते हैं ताकि विवाद और न बढ़े।",
        "मौन रहने वाले साथी पर दबाव डालने से वे और दूर चले जाते हैं। उन्हें थोड़ा समय देकर कहना कि 'जब तुम तैयार हो, हम बात करेंगे' उन्हें सुरक्षित महसूस करवाता है।",
        "इस मौन को अपने प्रति घृणा न समझें, यह उनका तनाव से निपटने का एक तरीका है, भले ही यह तरीका त्रुटिपूर्ण हो।"
      ],
      reflection: [
        "आप उन्हें सुरक्षित दूरी कैसे दे सकते हैं जिससे आप स्वयं को भी उपेक्षित महसूस न कराएं?",
        "जब वे अपने मौन में हों, तो आप अपने मानसिक सुकून और आत्म-देखभाल (self-care) के लिए क्या कर सकते हैं?",
        "क्या आप उनसे कह सकते हैं: 'मैं तुम्हारे मौन का सम्मान करता हूँ, परंतु जब तुम सहज हो, कृपया मुझसे बात करना'?"
      ]
    },
    love: {
      validation: [
        "अपने रिश्ते में प्रेम, सम्मान और निकटता को बढ़ाने का प्रयास करना एक अत्यंत सुंदर बात है। मुझे आपका यह समर्पण बहुत अच्छा लगा। ❤️",
        "प्रेम की भाषाओं (love languages) को समझना और एक-दूसरे के निकट आना एक लंबे और खुशहाल रिश्ते का मुख्य आधार है।",
        "भावनात्मक जुड़ाव को गहरा करने पर ध्यान केंद्रित करना वास्तव में बहुत हृदयस्पर्शी है। मैं इस यात्रा में आपका पूर्ण सहयोग करूँगा।"
      ],
      insight: [
        "प्रेम बड़े उपहारों से नहीं, बल्कि दैनिक जीवन के छोटे-छोटे स्नेहपूर्ण व्यवहारों और ध्यान (emotional bids) से गहरा होता है।",
        "अपने साथी की प्रेम की भाषा को समझकर जब हम उन्हें उसी रूप में प्रेम देते हैं, तो रिश्ता अत्यंत सुरक्षित और प्रगाढ़ बन जाता है।",
        "एक-दूसरे के प्रति आभार व्यक्त करना रिश्ते के समस्त तनावों को धीरे-धीरे समाप्त कर देता है।"
      ],
      reflection: [
        "ऐसा कौन सा छोटा सा स्नेहपूर्ण कार्य है जो आप आज अपने साथी के लिए एक सरप्राइज के रूप में कर सकते हैं?",
        "क्या आपको पता है कि आपके साथी को सबसे अधिक प्रेम कब महसूस होता है (प्रशंसा से, उपहार से, सेवा से, या साथ समय बिताने से)?",
        "आपने अंतिम बार कब उन्हें बिना किसी कारण के गले लगाया था और धन्यवाद कहा था?"
      ]
    },
    general: {
      validation: [
        "मुझसे अपने दिल की बात साझा करने के लिए धन्यवाद। अपने रिश्ते को बेहतर बनाने के लिए सोचना ही एक बहुत बड़ा और सकारात्मक कदम है।",
        "रिश्ते में सजग रहना और उसे समझने का प्रयास करना एक परिपक्व साथी की पहचान है। मैं आपके साथ हूँ।",
        "हर रिश्ता एक अनूठी यात्रा है जिसमें उतार-चढ़ाव आते रहते हैं। आपका इस यात्रा के प्रति समर्पण बहुत प्रेरणादायक है।"
      ],
      insight: [
        "एक स्वस्थ रिश्ता वह नहीं है जिसमें कभी समस्याएं न हों, बल्कि वह है जिसमें दोनों समस्याओं से मिलकर लड़ने के लिए तैयार रहते हैं।",
        "रिश्ते में जिज्ञासा रखें—सोचें कि 'मेरा साथी ऐसा व्यवहार क्यों कर रहा है' बजाय इसके कि तुरंत क्रोधित हो जाएं।",
        "अपने लिए स्वस्थ सीमाएं रखना और स्वयं के जीवन पर ध्यान केंद्रित करना रिश्ते को कमजोर नहीं बल्कि अधिक तरोताजा और स्वस्थ बनाता है।"
      ],
      reflection: [
        "आप अपनी बातचीत के तरीके में ऐसी कौन सी छोटी आदत बदलना चाहेंगे जिससे रिश्ते में शांति बनी रहे?",
        "इस भावनात्मक परिस्थिति में आप स्वयं को थोड़ा और स्नेह और धैर्य कैसे दे सकते हैं?",
        "यदि आप इस समय रिश्ते में सबसे बड़ी आवश्यकता महसूस कर रहे हैं, तो वह क्या है?"
      ]
    }
  },
  marathi: {
    conflict: {
      validation: [
        "भांडण आणि राग या काळात अस्वस्थ आणि खचल्यासारखे वाटणे पूर्णपणे सामान्य आहे. मी तुमची ही चिंता समजू शकतो. ❤️",
        "आपल्या जवळच्या व्यक्तीशी वाद होणे आपल्या मानसिक शांततेला धक्का देते. तुमचा संताप आणि ताण पूर्णपणे साहजिक आहे.",
        "तणाव आणि वाद आपली सर्व ऊर्जा शोषून घेतात. हा भावनिक भार माझ्याशी शेअर केल्याबद्दल धन्यवाद."
      ],
      insight: [
        "नातेसंबंध मानसशास्त्राच्या (relationship psychology) मते, बहुतांश भांडणे वरवरच्या विषयांवर नसून भावनिक सुरक्षितता आणि आदराच्या कमतरतेमुळे होतात. राग वाढल्यास १० मिनिटांचा मौन विराम घेणे मेंदूला शांत करण्यास मदत करतो.",
        "आरोप करणारी भाषा ('तू असे केलेस') वापरण्याऐवजी स्वतःच्या भावना व्यक्त करणारी भाषा ('मला असे वाटले') वापरल्याने समोरच्या व्यक्तीचा बचावात्मक पवित्रा कमी होतो आणि संवाद सुकर होतो.",
        "समस्यांकडे 'मी विरुद्ध तू' असे न पाहता 'आम्ही दोघे विरुद्ध समस्या' अशा दृष्टीकोनातून पाहणे सुरू करा. हे तुमचे नाते खूप मजबूत करेल."
      ],
      reflection: [
        "या वादाच्या मागे तुमची कोणती भावनिक गरज (उदा. आदर किंवा सुरक्षितता) अपूर्ण राहिली असे तुम्हाला वाटते?",
        "रागावण्याऐवजी तुम्ही तुमच्या जोडीदाराला तुमच्या मनातील दुःख किंवा अस्वस्थता सांगितली, तर त्यांची प्रतिक्रिया कशी असेल?",
        "भविष्यात वाद वाढल्यास शांत राहून थोडा वेळ थांबण्याचा काही नियम तुम्ही दोघे बनवू शकता का?"
      ]
    },
    distance: {
      validation: [
        "जोडीदार व्यस्त असताना किंवा अंतर जाणवत असताना अस्वस्थता आणि अतिविचार (overthinking) होणे पूर्णपणे सामान्य आहे. मी तुमच्या या भावनेचा आदर करतो.",
        "जेव्हा एखादी प्रिय व्यक्ती उदासीन किंवा दूर गेल्यासारखी वाटते, तेव्हा खूप एकटेपणा जाणवतो. हा संवाद कमी होणे तुम्हाला दुखावत आहे, हे मी समजू शकतो.",
        "रिप्लायची वाट पाहणे किंवा नात्यात अंतर पाहणे मानसिकदृष्ट्या खूप थकवणारे असते. तुमची ही काळजी अत्यंत रास्त आहे."
      ],
      insight: [
        "बऱ्याचदा जेव्हा आपल्याला उत्तरे मिळत नाहीत, तेव्हा आपले मन नकारात्मक विचार करू लागते. लक्षात ठेवा, जोडीदाराची व्यस्तता त्यांच्या वैयक्तिक आयुष्यातील ताणामुळे असू शकते, तुमच्यावरील प्रेम कमी झाल्यामुळे नाही.",
        "अटॅचमेंट थिअरीनुसार, एक जोडीदार ताणामध्ये जवळीक शोधतो, तर दुसरा शांततेसाठी स्वतःला दूर ठेवतो. हा पॅटर्न समजून घेणे आणि स्वीकारणे महत्त्वाचे आहे.",
        "दोघांच्या संमतीने एक वेळ ठरवून घेणे (उदा. रात्री १५ मिनिटे बोलणे) या अंतरामुळे येणारी अस्वस्थता कमी करण्यास मदत करते."
      ],
      reflection: [
        "कोणतीही तक्रार न करता तुम्ही तुमच्या जोडीदाराला प्रेमाने सांगू शकता का की त्यांचा एक छोटासा मेसेज देखील तुमच्या मनाला किती शांतता देतो?",
        "ते व्यस्त असताना तुम्ही तुमचे मन दुसरीकडे वळवण्यासाठी आणि स्वतःला शांत ठेवण्यासाठी काय करू शकता?",
        "व्यस्त वेळापत्रकात एकमेकांना माहिती देण्याचा काही साधा नियम तुम्ही दोघांनी बनवला आहे का?"
      ]
    },
    anxiety: {
      validation: [
        "असुरक्षित वाटणे आणि सतत अतिविचार करणे खूप थकवणारे असते. तुमची सुरक्षितता आणि प्रेमाची इच्छा असणे खूप सुंदर आहे.",
        "सगळे संपेल अशी भीती वाटणे हा एक मोठा भावनिक भार आहे. मी तुमची ही भीती समजू शकतो, तुम्ही एकटे नाही आहात.",
        "नात्याच्या भविष्याबद्दल काळजी वाटणे हे या नात्यावर तुमचे किती प्रेम आहे याचे लक्षण आहे. पण या ताणाला स्वतःवर ताबा मिळवू देऊ नका."
      ],
      insight: [
        "चिंता अनेकदा तेव्हा वाढते जेव्हा आपले जुने वाईट अनुभव आपल्याला सध्या पुन्हा घडताना दिसतात. जोडीदारासोबत मोकळेपणाने भीती शेअर केल्याने नात्यात सुरक्षितता येते.",
        "आपली भीती आणि भावनिक मते मोकळेपणाने मांडल्याने नाते अधिक घट्ट आणि जवळचे बनते.",
        "लक्षात ठेवा की जे विचार मनात येतात, ते नेहमीच खरे नसतात. तुमच्या भीतीचे विचार अनेकदा भूतकाळातील जखमांचे प्रतिध्वनी असतात, वर्तमानातील सत्य नव्हे."
      ],
      reflection: [
        "तुमच्या जोडीदाराने अलीकडेच असे काय केले ज्यावरून त्यांचे तुमच्यावरील प्रेम आणि नात्याबद्दलची निष्ठा स्पष्टपणे दिसून येते?",
        "आज नेमके कशामुळे तुमची ही असुरक्षितता अचानक जागी झाली, हे तुम्ही ओळखू शकता का?",
        "कोणताही आरोप न करता तुम्ही तुमच्या जोडीदाराकडे विश्वासाची (reassurance) मागणी कशी करू शकता?"
      ]
    },
    avoidance: {
      validation: [
        "जेव्हा जोडीदार बोलणे बंद करतो किंवा टाळतो, तेव्हा समोर एखादी भिंत उभी राहिल्यासारखे वाटते. तुमची अस्वस्थता पूर्णपणे साहजिक आहे.",
        "शांत राहण्याचे वागणे (silent treatment) सहन करणे खूप एकटेपणाचे आणि त्रासदायक असते. मी तुमची ही वेदना चांगल्या प्रकारे समजू शकतो.",
        "महत्त्वाच्या विषयांकडे दुर्लक्ष होताना पाहणे खूप क्लेशदायक असते. प्रश्न सोडवण्याचा प्रयत्न करणे ही तुमची एक खूप चांगली सवय आहे."
      ],
      insight: [
        "मानसशास्त्रानुसार, दूर जाणारे जोडीदार (avoidant partners) काळजी करत नाहीत म्हणून दूर जात नाहीत, तर ते तणावामुळे शांत होतात जेणेकरून वाद आणखी वाढू नये.",
        "शांत राहणाऱ्या जोडीदारावर जास्त दबाव आणल्यास ते आणखी दूर जातात. त्यांना थोडी सुरक्षित जागा देऊन सांगणे की 'जेव्हा तू तयार असशील, आपण बोलू' त्यांना सुरक्षित वाटते.",
        "या शांततेला स्वतःबद्दलचा तिरस्कार समजू नका, हा त्यांचा तणावाशी सामना करण्याचा एक मार्ग आहे, जरी हा मार्ग चुकीचा असला तरी."
      ],
      reflection: [
        "जोडीदाराला सुरक्षित अंतर कसे देऊ शकता ज्यामुळे तुम्हाला स्वतःला उपेक्षित वाटणार नाही?",
        "ते त्यांच्या शांततेत असताना तुम्ही स्वतःच्या मानसिक स्वास्थ्यासाठी आणि आत्म-काळजीसाठी (self-care) काय करू शकता?",
        "तुम्ही त्यांना सांगू शकता का: 'मी तुझ्या शांततेचा आदर करतो/करते, पण जेव्हा तू कम्फर्टेबल असशील, प्लीज माझ्याशी बोल'?"
      ]
    },
    love: {
      validation: [
        "आपल्या नात्यात प्रेम, आदर आणि जवळीक वाढवण्याचा प्रयत्न करणे ही अत्यंत सुंदर गोष्ट आहे. तुमचे हे समर्पण मला खूप आवडले. ❤️",
        "प्रेमाच्या भाषा (love languages) समजून घेणे आणि एकमेकांच्या जवळ येणे हे एका दीर्घ आणि आनंदी नात्याचा पाया आहे.",
        "भावनिक नाते घट्ट करण्यावर लक्ष केंद्रित करणे खरोखरच खूप हृदयस्पर्शी आहे. मी या प्रवासात तुम्हाला पूर्ण सहकार्य करेन."
      ],
      insight: [
        "प्रेम मोठ्या भेटींनी नव्हे, तर दैनंदिन जीवनातील लहान-लहान कौतुक आणि लक्ष देण्याच्या सवयींनी (emotional bids) घट्ट होते.",
        "आपल्या जोडीदाराच्या प्रेमाची भाषा समजून घेऊन जेव्हा आपण त्यांना त्याच स्वरूपात प्रेम देतो, तेव्हा नाते अत्यंत सुरक्षित आणि घट्ट बनते.",
        "एकमेकांबद्दल कृतज्ञता व्यक्त केल्याने नात्यातील सर्व तणाव हळूहळू नाहीसे होतात."
      ],
      reflection: [
        "अशी कोणती लहान गोष्ट किंवा मदत आहे जी तुम्ही आज जोडीदारासाठी एक सरप्राइज म्हणून करू शकता?",
        "जोडीदाराला सर्वात जास्त प्रेम कधी जाणवते (कौतुकाने, भेटीने, मदतीने की एकत्र वेळ घालवल्याने), हे तुम्हाला ठाऊक आहे का?",
        "तुम्ही शेवटचे त्यांना कधी विनाकारण मिठी मारली होती आणि थँक्यू म्हटले होते?"
      ]
    },
    general: {
      validation: [
        "माझ्याशी मन मोकळे केल्याबद्दल धन्यवाद. आपले नाते अधिक चांगले करण्यासाठी विचार करणे हेच एक मोठे आणि सकारात्मक पाऊल आहे.",
        "नात्यात सजग राहणे आणि ते समजून घेण्याचा प्रयत्न करणे हे एका मॅच्युअर जोडीदाराचे लक्षण आहे. मी तुमच्या पाठीशी आहे.",
        "प्रत्येक नाते हा एक अनोखा प्रवास असतो ज्यामध्ये चढाव-उतार येत असतात. या प्रवासातील तुमचे नात्यावरील प्रेम प्रेरणादायी आहे."
      ],
      insight: [
        "एक निरोगी नाते ते नाही ज्यामध्ये कधी समस्या येत नाहीत, तर ते आहे ज्यामध्ये दोघेही समस्यांशी मिळून लढण्यास तयार असतात.",
        "नात्यात उत्सुकता ठेवा—विचार करा की 'माझा जोडीदार असा का वागत आहे' याऐवजी लगेच रागावणे टाळा.",
        "स्वतःसाठी निरोगी मर्यादा ठेवणे आणि स्वतःच्या आयुष्यावर लक्ष केंद्रित करणे नात्याला कमकुवत करत नाही तर अधिक ताजे आणि निरोगी बनवते."
      ],
      reflection: [
        "तुम्ही तुमच्या बोलण्याच्या पद्धतीत अशी कोणती लहान सवय बदलू इच्छिता ज्यामुळे नात्यात शांतता राहील?",
        "या भावनिक परिस्थितीत तुम्ही स्वतःला थोडे अधिक प्रेम आणि संयम कसे देऊ शकता?",
        "जर तुम्हाला या क्षणी नात्यात सर्वात मोठी गरज जाणवत असेल, तर ती कोणती आहे?"
      ]
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    // 1. Session check for security
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Parse request payload
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required." },
        { status: 400 }
      );
    }

    // 3. Load rotating API keys
    const apiKeys = loadApiKeys();

    // 4. Emergency local fallback if no API keys are configured
    if (apiKeys.length === 0) {
      console.log("📢 [AI Coach API] No API keys found in env. Running Local Psychological Fallback Engine.");
      const reply = generateLocalFallbackReply(message);
      return NextResponse.json({
        success: true,
        reply,
        source: "local_psychological_fallback"
      });
    }

    // 5. Try calling Gemini API via load balancing key rotation
    for (let attempt = 0; attempt < apiKeys.length; attempt++) {
      const currentKey = getNextApiKey(apiKeys);
      const keyLabel = `Key #${(attempt + 1)}`;
      let start = Date.now();

      try {
        const ai = new GoogleGenerativeAI(currentKey);
        const model = ai.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        // Setup contextual conversational history
        const formattedHistory = history
          .slice(-10) // Only send the last 10 messages to protect token count
          .map((m: any) => `${m.sender === "user" ? "User" : "Coach"}: ${m.text}`)
          .join("\n");

        const prompt = `
You are "AI Relationship Coach", a highly intuitive, compassionate relationship psychologist and deep-empathy communication expert.
Your goal is to support the user through their emotional or communication difficulties, providing a balance of deep empathy and highly practical, actionable advice.

### ABSOLUTE LANGUAGE & SCRIPT RULES (MANDATORY):
1. **Match Script & Dialect exactly:**
   - Detect the exact language and script of the user's input: "${message}".
   - If the user types in Hinglish (e.g. "tum hamesha", "kya karu", "nhi bol rhi", "propose kaise karu", "kuch idea do"), reply in warm, comforting, and natural **Hinglish**.
   - If the user types in Hindi (Devanagari script), reply in warm, highly respectful **Hindi in Devanagari script**.
   - If the user types in Marathi, reply in polite, empathetic, and respectful **Marathi**.
   - If the user types in English, reply in sophisticated, therapeutic, and emotionally articulate **English**.
2. **Never mix scripts** unless naturally done (like writing standard English terms like 'propose', 'frd', 'relationship' in Hinglish). Do not use Devanagari script if the user types in English/Hinglish!

### EMOTIONAL STRUCTURE & ACTIONABLE GUIDELINES (MANDATORY):
1. **Direct Actionable Advice & Creative Suggestions (CRITICAL):**
   - If the user asks a direct question (e.g. "proposal ideas", "propose kaise karu", "kya bolu", "give me options", "give me suggestions", "tips do", "kuch idea do"), you MUST **directly answer their question** and provide concrete, beautiful, practical, step-by-step suggestions, sample text dialogues, or creative tips!
   - DO NOT evade their question, and DO NOT just loop the question back to them (avoid saying "Aapko kya lagta hai..." if they explicitly asked you for ideas). Give them actual options!
2. **Authentic, Human-like Conversational Tone:**
   - Act as a wise, highly understanding friend and expert coach. Do NOT sound like an annoying, passive, clinical textbook counselor who repeats everything they say.
   - Speak with warm conviction. Be direct and active in helping them solve their dilemma!
3. **No Overused Therapeutic Loops:**
   - ONLY end with a reflective question if the user is general emotional venting (e.g. sharing sadness or pain). If the user is asking for ideas, suggestions, or advice, do NOT ask a reflection question; instead, conclude with a highly encouraging and supportive closing statement.
4. **Validation and Brief Psychological Insight:**
   - Keep validation brief and sincere (1-2 sentences), then immediately pivot to providing the helpful advice, tips, or insight.
5. **Conversational Length:** Keep the response elegant, highly comforting, and readable. Limit it strictly to 80-150 words to keep it conversational.

### CONVERSATION HISTORY FOR CONTEXT:
${formattedHistory}
User: ${message}
Coach:
`;

        start = Date.now();
        const response = await model.generateContent(prompt);
        const replyText = response.response.text();
        if (!replyText || !replyText.trim()) throw new Error("Empty response received from Gemini model.");
        const duration = Date.now() - start;

        console.log(`✅ [AI Coach API] Live Gemini response generated successfully via ${keyLabel}!`);
        logApiKeyUsage("/api/coach (AI Coach Chat)", currentKey, "success", duration);
        return NextResponse.json({
          success: true,
          reply: replyText.trim(),
          source: "gemini_ai"
        });

      } catch (error: any) {
        const duration = (typeof start === "number") ? Date.now() - start : 0;
        console.error(`❌ [AI Coach API] ${keyLabel} failed: ${error.message}`);
        const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("quota");
        if (isRateLimit && attempt < apiKeys.length - 1) {
          console.warn(`⚠️ [AI Coach API] ${keyLabel} hit rate limit. Rotating to next key...`);
          logApiKeyUsage("/api/coach (AI Coach Chat)", currentKey, "failed", duration, `Rate limit (429): ${error.message}`);
          continue;
        }
        logApiKeyUsage("/api/coach (AI Coach Chat)", currentKey, "failed", duration, error.message);
        if (attempt === apiKeys.length - 1) {
          console.error("❌ [AI Coach API] All Gemini API keys exhausted. Triggering local psychological engine.");
        }
      }
    }

    // 6. Ultimate fallback if all attempts fail
    const fallbackReply = generateLocalFallbackReply(message);
    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      source: "local_fallback"
    });

  } catch (error: any) {
    console.error("❌ [AI Coach API] Error occurred inside route:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate coaching response." },
      { status: 500 }
    );
  }
}

// Helper to analyze the message locally and synthesize a beautiful high-EQ reply
function generateLocalFallbackReply(message: string): string {
  const isDevanagari = /[\u0900-\u097F]/.test(message);
  
  // Marathi keywords
  const marathiWords = /आहे|आहेस|आहेत|माझा|माझी|माझे|तुझा|तुझी|तुझे|काय|कुठे|खूप|करत|बोल|ताण|नको|मला|तुला|आवाज|ळ|चहा|प्रेम|सुंदर|तुम्ही|आम्ही|कसे|कसा|कशी|झाला|झाली/i;
  const hasMarathi = (isDevanagari && marathiWords.test(message)) || 
    /\b(mi|tu|aahe|chhaan|mahit|mala|tula|kaay|bol|khup|prem|cha|chi|che)\b/i.test(message);
    
  // Hinglish keywords
  const hasHinglish = /\b(tum|na|hai|hu|ko|se|hi|bhi|ki|ke|tera|meri|kya|yaar|aur|nhi|nahi|acha|accha|vhi|vo|muze|mujhe|toh)\b/i.test(message);
  const hasHindiDevanagari = isDevanagari && !marathiWords.test(message);

  const lang = hasMarathi ? "marathi" : (hasHindiDevanagari ? "hindi" : (hasHinglish ? "hinglish" : "english"));

  const lowerMsg = message.toLowerCase();
  let category = "general";
  if (/\b(fight|argue|argument|jhagda|gussa|conflict|shouting|abuse|screaming|cheat|angry|chilla|dhoka|dhokha)\b/i.test(lowerMsg)) {
    category = "conflict";
  } else if (/\b(ignore|busy|reply|cold|silent|distance|neglect|time|duration|gap|not talking)\b/i.test(lowerMsg)) {
    category = "distance";
  } else if (/\b(anxious|insecure|fear|worry|breaking|leave|trust|overthink|darr|chinta|breakup)\b/i.test(lowerMsg)) {
    category = "anxiety";
  } else if (/\b(avoid|stonewall|ghost|silent treatment|chup|bhaag|run away)\b/i.test(lowerMsg)) {
    category = "avoidance";
  } else if (/\b(love|bond|connect|romance|feeling|attach|together|understand|pyaar|prem|saath)\b/i.test(lowerMsg)) {
    category = "love";
  }

  const matrix = fallbackMatrices[lang][category] || fallbackMatrices[lang]["general"];
  const seed = getSimpleHash(message);

  const valIndex = seed % matrix.validation.length;
  const insIndex = (seed + 1) % matrix.insight.length;
  const refIndex = (seed + 2) % matrix.reflection.length;

  const validation = matrix.validation[valIndex];
  const insight = matrix.insight[insIndex];
  const reflection = matrix.reflection[refIndex];

  return `${validation} ${insight} ${reflection}`;
}
