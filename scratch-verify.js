const { validateAndNormalizeAnalysis } = require("./lib/ai-engine");

// 1. Define Loving/Secure Chat Log
const lovingChat = `
Rahul: Hey Priya! I just wanted to say thank you for the lovely coffee today. I really appreciate how supportive you are.
Priya: Hey Rahul! 😊 Of course, I loved spending time with you. I always feel so heard and valued when we talk.
Rahul: Me too! Let's plan another date this weekend. I trust you completely and feel so happy when we are together.
Priya: That sounds perfect! ❤️ I'm looking forward to it!
`;

// 2. Define Toxic/Manipulative Chat Log
const toxicChat = `
Rahul: Why didn't you pick up my calls? You always ignore me.
Priya: I was in a meeting Rahul. I told you that before.
Rahul: Stop making things up. You're crazy and delusional. You never listen to me anyway.
Priya: That's not fair Rahul, I always try to care for you.
Rahul: Everything is your fault! You always overreact and act dramatic. I don't care anymore.
`;

console.log("=========================================");
console.log("🧪 TESTING LOVING CHAT LOG:");
const resultLoving = validateAndNormalizeAnalysis({ positivityScore: 92, stressScore: 12, attachmentStyle: "secure" }, lovingChat);
console.log("Positivity Score:", resultLoving.positivityScore);
console.log("Stress Score:", resultLoving.stressScore);
console.log("Attachment Style:", resultLoving.attachmentStyle);
console.log("Red Flags Detected:", resultLoving.redFlags.length);
resultLoving.redFlags.forEach((flag, i) => {
  console.log(`  [Flag ${i+1}] Title: "${flag.title}", Desc: "${flag.description}"`);
});

console.log("\n=========================================");
console.log("🧪 TESTING TOXIC CHAT LOG (Toxicity Firewall Trigger):");
const resultToxic = validateAndNormalizeAnalysis({ positivityScore: 100, stressScore: 0, attachmentStyle: "secure" }, toxicChat);
console.log("Capped Positivity Score (Firewall):", resultToxic.positivityScore);
console.log("Elevated Stress Score (Firewall):", resultToxic.stressScore);
console.log("Attachment Style:", resultToxic.attachmentStyle);
console.log("Red Flags Detected:", resultToxic.redFlags.length);
resultToxic.redFlags.forEach((flag, i) => {
  console.log(`  [Flag ${i+1}] Title: "${flag.title}", Desc: "${flag.description}"`);
});
console.log("=========================================");
