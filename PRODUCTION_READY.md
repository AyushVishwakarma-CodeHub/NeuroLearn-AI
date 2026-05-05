# 🚀 NeuroLearn AI Production Guide

Congratulations! Your platform is hardened and ready for the real world. Follow these steps to go live.

---

## 1. 🌍 Backend Deployment (Render.com)
1. **Connect GitHub**: Create a new "Web Service" on Render and link your `NeuroLearn-AI` repository.
2. **Root Directory**: Set this to `server`.
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**: Add these in the Render dashboard:
   - `MONGO_URI`: (Your MongoDB Atlas Link)
   - `JWT_SECRET`: (A long random string)
   - `GROQ_API_KEY`: (Your AI key)

## 🎨 2. Frontend Deployment (Vercel)
1. **Import Repo**: Import the repository into Vercel.
2. **Framework Preset**: Vite.
3. **Root Directory**: `client`.
4. **Environment Variables**:
   - `VITE_API_URL`: (The URL Render gives you for your backend)

## 🧠 3. ML Service (Optional)
If you want the AI Smart Planner:
1. Deploy the `ml-service` as a "Python Web Service" on Render.
2. Set the `ML_SERVICE_URL` in your Backend environment variables.

---

## 🛡️ Final Production Checklist
- [x] **Auth Hardening**: JWT tokens are active and secure.
- [x] **Admin Portal**: Restricted to `admin` role only.
- [x] **Frontend Optimized**: Production build verified.
- [x] **Error Handling**: Standardized across all AI endpoints.
- [x] **Role Protection**: Admin routes are gated at the middleware level.

---

### **Need a Live Domain?**
You can now point a custom domain (e.g., `neurolearn.ai`) to your Vercel deployment and you are officially open for business!

**Good luck with your launch!** 🎓✨
