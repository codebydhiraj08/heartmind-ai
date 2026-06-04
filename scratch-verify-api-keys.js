const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Read .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error("❌ .env file not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const keysMatch = envContent.match(/GEMINI_API_KEYS\s*=\s*([^\r\n]+)/);
const singleKeyMatch = envContent.match(/GEMINI_API_KEY\s*=\s*([^\r\n]+)/);

let keys = [];
if (keysMatch) {
  keys = keysMatch[1]
    .split(",")
    .map(k => k.trim())
    .filter(k => k.length > 0 && !k.includes("<") && !k.includes("placeholder"));
}

if (singleKeyMatch) {
  const singleKey = singleKeyMatch[1].trim();
  if (singleKey && !singleKey.includes("<") && !singleKey.includes("placeholder") && !keys.includes(singleKey)) {
    keys.push(singleKey);
  }
}

console.log(`Found ${keys.length} Gemini API keys to test.\n`);

async function testKey(key, index) {
  const maskedKey = key.slice(0, 8) + "..." + key.slice(-4);
  console.log(`Testing Key #${index + 1}: ${maskedKey}`);
  try {
    const ai = new GoogleGenerativeAI(key);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const start = Date.now();
    const result = await model.generateContent("Hello, write exactly the word 'OK'.");
    const text = result.response.text().trim();
    const duration = Date.now() - start;
    console.log(`  ✅ Success! Response: "${text}" (took ${duration}ms)`);
    return { index, key: maskedKey, status: "valid", response: text, duration, error: null };
  } catch (error) {
    console.log(`  ❌ Failed! Error: ${error.message}`);
    return { index, key: maskedKey, status: "invalid", response: null, duration: null, error: error.message };
  }
}

async function run() {
  const results = [];
  for (let i = 0; i < keys.length; i++) {
    const res = await testKey(keys[i], i);
    results.push(res);
    console.log("-----------------------------------------");
  }

  const valid = results.filter(r => r.status === "valid");
  const invalid = results.filter(r => r.status === "invalid");

  console.log("\n================ SUMMARY ================");
  console.log(`Total Keys Tested: ${results.length}`);
  console.log(`✅ Valid: ${valid.length}`);
  console.log(`❌ Invalid: ${invalid.length}`);
  console.log("=========================================\n");
}

run();
