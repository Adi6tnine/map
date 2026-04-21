# Deploy Guide — Smart Equipment Monitor

## Architecture
```
📱 Mobile tracker.html  →  🖥️ Railway (backend)  ←→  📊 Vercel (dashboard)
```

---

## Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/equipment-monitor.git
git push -u origin main
```

---

## Step 2 — Deploy Backend to Railway (free)

1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your repo → select the **`server`** folder as root
3. Railway auto-detects Node.js and runs `node index.js`
4. Add environment variable:
   ```
   PORT = (Railway sets this automatically)
   CLIENT_ORIGIN = *
   SIMULATION_INTERVAL_MS = 2500
   ```
5. Click Deploy → wait ~1 min
6. Copy your Railway URL, e.g. `https://equipment-monitor-production.up.railway.app`

---

## Step 3 — Deploy Frontend to Vercel (free)

1. Go to https://vercel.com → New Project → Import from GitHub
2. Select your repo → set **Root Directory** to `client`
3. Framework: **Vite**
4. Add environment variable:
   ```
   VITE_SERVER_URL = https://equipment-monitor-production.up.railway.app
   ```
5. Deploy → get your URL, e.g. `https://equipment-monitor.vercel.app`

---

## Step 4 — Open Mobile Tracker

On your phone, open:
```
https://equipment-monitor.vercel.app/tracker.html
```

1. Device ID: `TRANSPORT-001`
2. Server URL: `https://equipment-monitor-production.up.railway.app`
3. Tap **Start Tracking**
4. Open dashboard on laptop → watch the marker move in real-time ✅

---

## How Live Tracking Works

```
Mobile watchPosition() fires every ~1-2s
  ↓ POST /location { id, lat, lng, speed, accuracy }
Railway backend updates device store
  ↓ Socket.io emit → all connected dashboards
Vercel dashboard receives update
  ↓ Leaflet marker.setLatLng() → smooth movement
  ↓ Polyline trail grows as you move
```

---

## Local Development

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2  
cd client && npm run dev

# Open dashboard
http://localhost:5173

# Open tracker on phone (same WiFi)
http://YOUR_PC_IP:5173/tracker.html
```

Find your PC IP: run `ipconfig` → look for IPv4 Address
