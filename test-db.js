const fs = require("fs");
const path = require("path");

const DB_FILE_PATH = "c:/Users/DhirajWarangane/OneDrive/Desktop/Heartmind/db.json";

function testBehavior() {
  const data = JSON.parse(fs.readFileSync(DB_FILE_PATH, "utf8"));
  const user = data.find(u => u.email === "rushiwarangane@gmail.com" || u._id === "uh270q1iya");
  
  if (!user) {
    console.log("User not found!");
    return;
  }
  
  console.log("Initial chatAnalyses count:", user.chatAnalyses ? user.chatAnalyses.length : 0);
  
  // Let's mimic User.findOne
  const dbUser = JSON.parse(JSON.stringify(user)); // deep copy like instantiation
  
  // Let's mimic ChatAnalysis.create (which updates db.json)
  const users = JSON.parse(fs.readFileSync(DB_FILE_PATH, "utf8"));
  const uIndex = users.findIndex(u => u._id === user._id);
  if (uIndex >= 0) {
    if (!users[uIndex].chatAnalyses) users[uIndex].chatAnalyses = [];
    users[uIndex].chatAnalyses.push({
      _id: "test_" + Math.random().toString(36).substring(2, 5),
      name: "Test Chat",
      score: 50
    });
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(users, null, 2));
    console.log("Added new chatAnalysis in db.json. New count in db.json:", users[uIndex].chatAnalyses.length);
  }
  
  // Now let's mimic dbUser.save()
  const users2 = JSON.parse(fs.readFileSync(DB_FILE_PATH, "utf8"));
  const index = users2.findIndex(u => u._id === dbUser._id);
  
  if (index >= 0) {
    const existingUser = users2[index];
    
    // The exact logic in models/User.ts:
    let chatAnalyses = dbUser.chatAnalyses || [];
    if (existingUser.chatAnalyses && existingUser.chatAnalyses.length > chatAnalyses.length) {
      chatAnalyses = existingUser.chatAnalyses;
    }
    
    // BUT WAIT! In models/User.ts:
    // serialized is constructed like this:
    const serialized = {
      ...dbUser, // Wait, dbUser has the OLD chatAnalyses!
      chatAnalyses: chatAnalyses, // This has the new chatAnalyses
    };
    
    // Then it does:
    users2[index] = {
      ...existingUser,
      ...serialized
    };
    
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(users2, null, 2));
    console.log("Saved dbUser. Final count in db.json:", users2[index].chatAnalyses.length);
  }
}

testBehavior();
