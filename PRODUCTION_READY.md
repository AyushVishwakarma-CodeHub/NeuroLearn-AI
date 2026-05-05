# 🚀 NeuroLearn AI Production Guide (Render + Vercel — Free Stack)

This is the best way to host your platform for **$0/month**.

---

## ☁️ 1. Backend Deployment (Render.com)
1. **New Web Service**: Click "New +" -> "Web Service".
2. **Connect GitHub**: Link your `NeuroLearn-AI` repository.
3. **Root Directory**: Set this to `server`.
4. **Environment**: `Node`.
5. **Build Command**: `npm install`
6. **Start Command**: `npm start`
7. **Environment Variables**: Click "Advanced" and add:
   - `MONGO_URI`: (Your MongoDB Atlas Link)
   - `JWT_SECRET`: (Your secret key)
   - `GROQ_API_KEY`: (Your API key)
   - `VITE_CLIENT_URL`: (Set this AFTER you get your Vercel URL)

## 🎨 2. Frontend Deployment (Vercel)
1. **Import Repo**: Import `NeuroLearn-AI`.
2. **Root Directory**: `client`.
3. **Framework**: Vite.
4. **Environment Variables**:
   - `VITE_API_URL`: (The URL Render gives you, e.g., `https://neurolearn.onrender.com`).

---

## 🛡️ Important Note for Free Tier
On Render's free tier, the backend "sleeps" if it's not used. The first time you open the site after a while, it might take **30-60 seconds** to wake up. This is normal for free hosting!

**Go to [Render.com](https://render.com) and click "New Web Service" to start!** 🎓✨
