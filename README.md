# 🧠 HeartMind AI — Premium Emotional Intelligence & Relationship Diagnostics

HeartMind AI is a state-of-the-art relationship analytics platform and empathetic dialogue coach. It uses advanced NLP diagnostics, speech pattern metrics, and Gemini-powered cognitive modeling to decode emotional rhythms, track attachment synchronization, identify dismissive communication red flags, and recommend high-EQ responsive dialogue.

---

## ⚡ Deployment & Stateless Serverless Data Persistence Guide

When hosting this platform on serverless platforms (like **Vercel**), the server containers are stateless and recycle automatically. If the platform is running on the **Mock JSON Database Fallback** (defaulting to writing to `db.json` when `MONGODB_URI` is missing or fails to connect), **newly added timeline memories, profile details, and analysis history will disappear upon server container recycling.**

To resolve this permanently and ensure 100% data persistence on your mobile and live deployments:

### Step 1: Add MONGODB_URI in Vercel
1. Go to your **Vercel Dashboard** and select your project `heartmind-ai`.
2. Navigate to **Settings** ➡️ **Environment Variables**.
3. Add a new variable:
   - **Key:** `MONGODB_URI`
   - **Value:** `mongodb+srv://dhirajwarangane08_db_user:4MGUMhA02B9gL7u8@cluster0.mongodb.net/heartmind` (Copy this exact production connection string from your local `.env` file).
4. Save and trigger a redeployment.

### Step 2: Configure MongoDB Atlas Network Access
MongoDB Atlas strictly restricts incoming database connections by default. Because Vercel functions scale dynamically and use random server IPs, you must allow connection access from Vercel:
1. Log in to your **MongoDB Atlas Console**.
2. Navigate to **Security** ➡️ **Network Access** in the left sidebar.
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (which inputs `0.0.0.0/0` as the target).
5. Save changes. 

Once both steps are active, HeartMind AI will transition seamlessly from the local ephemeral database to your secure, persistent MongoDB Atlas database on all live, desktop, and mobile devices!

---

## 🔑 Development Key Configuration

Make sure your local `.env` contains the correct variables:
- `PORT=3005` (Avoids Windows port 3000 background socket conflicts).
- `NEXTAUTH_URL=http://localhost:3005` (Matches local cookie authentication domains).
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (Authorize redirect callbacks at Google Cloud Console).
- `GEMINI_API_KEYS` (Multiple rotation API keys separated by commas).