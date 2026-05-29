const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

if (fs.existsSync(dbPath)) {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const users = JSON.parse(data || '[]');
    
    const clearedUsers = users.map(u => {
      return {
        ...u,
        chatAnalyses: [],
        timelineMemories: [],
        compatibilities: [],
        emotionalReports: [],
        freeAnalysisUsed: false,
        monthlyAnalysisCount: 0,
        trialAnalysesCount: 0,
        trialFeaturesEngaged: []
      };
    });
    
    fs.writeFileSync(dbPath, JSON.stringify(clearedUsers, null, 2));
    console.log(`\n✅ [DATABASE CLEANUP] Successfully cleared all test analysis history, timeline entries, compatibility grids, and emotions data for ${users.length} user profile(s) in db.json!`);
  } catch (err) {
    console.error("❌ Failed to parse or clean db.json:", err.message);
  }
} else {
  console.log('⚠️ db.json file not found in current directory.');
}
