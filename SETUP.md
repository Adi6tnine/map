# Smart Equipment Monitor — Setup Guide

## Full Flow
```
📱 Mobile (GPS) → 🔌 ESP32 (WiFi bridge) → 🖥️ Node Backend → 📊 Dashboard
```

---

## Step 1 — Flash ESP32

1. Open `server/esp32_full.ino` in Arduino IDE
2. Install board: **Tools → Board → ESP32 Dev Module**
3. Install libraries via Library Manager:
   - `ArduinoJson` by Benoit Blanchon
4. Edit these lines:
   ```cpp
   const char* WIFI_SSID   = "YOUR_WIFI_NAME";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   const char* BACKEND_URL = "http://YOUR_PC_IP:4000/location";
   ```
   > Find your PC IP: run `ipconfig` on Windows, look for IPv4 (e.g. 192.168.1.5)

5. Flash to ESP32
6. Open Serial Monitor (115200 baud)
7. Note the ESP32's IP address printed there, e.g. `192.168.1.42`

---

## Step 2 — Run Backend

```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:4000
📡 Mobile GPS endpoint : POST http://localhost:4000/location
```

---

## Step 3 — Run Dashboard

```bash
cd client
npm run dev
```

Open: http://localhost:5173

---

## Step 4 — Open Tracker on Mobile

> Mobile must be on the SAME WiFi as ESP32 and your PC

Open on your phone:
```
http://YOUR_PC_IP:5173/tracker.html
```

1. Select **"Via ESP32"** tab
2. Enter ESP32 IP: `http://192.168.1.42`  (from Step 1)
3. Set Device ID: `TRANSPORT-001`
4. Tap **Start Tracking**

---

## What Happens

```
Mobile GPS fires every ~2s
  ↓
POST http://ESP32_IP/gps  { lat, lng }
  ↓
ESP32 reads battery from ADC pin 34
ESP32 POSTs to backend: { id, lat, lng, battery, source: "esp32" }
  ↓
Backend updates device store
Backend emits via Socket.io → all dashboards
  ↓
Dashboard map: TRANSPORT-001 marker moves in real-time ✅
```

---

## ESP32 Wiring (Battery Monitor)

```
Battery (+) ──┬── 100kΩ ──┬── 100kΩ ── GND
              │            │
              │          GPIO34 (ADC)
              │
           (to load)
```
> This divides voltage by 2. Max 3.3V on GPIO34!
> If not using battery monitoring, comment out `readBatteryPercent()` and hardcode `battery = 100`

---

## Test Without ESP32

You can test the full flow without hardware using curl:

```bash
# Simulate ESP32 sending GPS + battery
curl -X POST http://localhost:4000/location \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"TRANSPORT-001\",\"lat\":33.7450,\"lng\":-118.2580,\"battery\":85,\"source\":\"esp32\",\"type\":\"Transport\"}"
```

Run this a few times with slightly different lat/lng values — you'll see the marker move on the map.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| ESP32 can't reach backend | Make sure PC firewall allows port 4000. Run `netsh advfirewall firewall add rule name="Node4000" dir=in action=allow protocol=TCP localport=4000` |
| Mobile can't reach ESP32 | Both must be on same WiFi. Check ESP32 Serial Monitor for its IP |
| GPS not working on mobile | Must use HTTPS or localhost. If on local network HTTP, use Chrome and allow insecure content |
| Marker not moving | Check backend terminal for incoming POST logs |
