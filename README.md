# WindBorne ASOS Explorer

Interactive map + charts for **ASOS (Automated Surface Observing Systems)** weather stations.  
Built for the **WindBorne Systems – Software Engineering Intern (Product)** challenge.

**Live Demo:** https://<your-vercel-domain>.vercel.app  
**Repository:** https://github.com/<you>/<repo>

---

## ✨ Features

- 🗺️ **Clustered map** of ~6k ASOS stations (smooth bubbles with counts)
- 🔎 **Search** by station id / name / city / state
- 📊 **Station details** page with time-series charts (temperature, wind, pressure, precip) + raw data table
- 🧼 **Data sanitization** for corrupted upstream rows (type guards + null-safe fields)
- ⚡ **Server routes** with simple **rate limiting** and **LRU caching**
- 🧭 **Friendly 404** for unknown stations or empty history
- 🎨 Clean Carto Light basemap, round bubbles for clusters **and** single stations

---

## 🧰 Tech Stack

- **Next.js (App Router)** + **TypeScript**
- **React-Leaflet v5** + **Supercluster** (clustering)
- **Recharts** (charts)
- **Tailwind** utility classes (via `globals.css`)
- **LRU Cache** + tiny **rateLimiter**
- Deployed on **Vercel**

---

## 🔌 Upstream API

WindBorne’s public API (rate-limited ~20/min):

- `https://sfc.windbornesystems.com/stations`
- `https://sfc.windbornesystems.com/historical_weather?station={ID}`

This app fronts those with server routes:

- `GET /api/stations` → normalized `Station[]`
- `GET /api/historical?station={ID}` → `{ data: HistoricalRecord[], warnings: string[] }`

---

## ▶️ Local Development

```bash
# 1) Install deps
npm install

# 2) Env var (base URL used by server code)
#    Create .env.local at project root:
#    NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 3) Run dev server
npm run dev

# 4) Open
# http://localhost:3000
