# 🚀 NeuroLearn AI Production Guide (Railway + Vercel)

Your platform is ready for the ultimate 1-2 punch: **Railway** for the Backend and **Vercel** for the Frontend.

---

## 🚂 1. Backend Deployment (Railway.app)
1. **New Project**: Select "Deploy from GitHub repo" and choose `NeuroLearn-AI`.
2. **Root Directory**: Select `server`.
3. **Environment Variables**: Add these in the "Variables" tab:
   - `PORT`: `5000` (Railway usually provides this, but good to set).
   - `MONGO_URI`: (Your MongoDB Atlas connection string).
   - `JWT_SECRET`: (A strong random secret).
   - `GROQ_API_KEY`: (Your API key).
   - `VITE_CLIENT_URL`: (Set this AFTER you get your Vercel URL).

## 🎨 2. Frontend Deployment (Vercel)
1. **Import Repo**: Import `NeuroLearn-AI`.
2. **Root Directory**: Set to `client`.
3. **Framework**: Vite.
4. **Environment Variables**:
   - `VITE_API_URL`: (The URL from your Railway backend, e.g., `https://xxx.up.railway.app`).

---

## 🔄 3. Linking the two
Once both are deployed:
1. Copy your **Vercel URL** (e.g., `https://neurolearn.vercel.app`).
2. Go to **Railway Settings** -> Variables.
3. Update `VITE_CLIENT_URL` to your Vercel link. This secures your API so ONLY your site can talk to it.

---

## 🛡️ Final Checks
- [x] Backend is using the `npm start` script.
- [x] CORS is configured for your Vercel domain.
- [x] Database is reachable from external IPs (Check MongoDB Atlas Whitelist).

**Your platform is now ready for world-class hosting!** 🎓✨
