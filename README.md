# ⚡ ChargeSaathi - EV Charging Station Locator
## Complete Frontend Setup Guide (VSCode)

---

## 📋 TABLE OF CONTENTS
1. Prerequisites & Installation
2. Project Setup in VSCode
3. Project Structure Explained
4. Running the App
5. Understanding the Code
6. Making Changes
7. Testing Features
8. Connecting to Backend (When Ready)
9. Deploying for Demo
10. Troubleshooting

---

## STEP 1: Prerequisites & Installation

### Install these BEFORE starting:

#### 1.1 Install Node.js
- Go to: https://nodejs.org/
- Download: LTS version (e.g., Node 20.x)
- Install: Run the installer, click Next → Next → Finish
- Verify: Open terminal → type `node --version` → should show v20.x.x

#### 1.2 Install VSCode
- Go to: https://code.visualstudio.com/
- Download and install for Windows/Mac/Linux

#### 1.3 Install VSCode Extensions (Recommended)
Open VSCode → Press Ctrl+Shift+X → Search and install:
- ✅ ES7+ React/Redux/React-Native snippets
- ✅ Prettier - Code formatter
- ✅ Auto Import - ES6 & TypeScript
- ✅ Bracket Pair Colorizer
- ✅ GitLens (for Git collaboration)

---

## STEP 2: Project Setup in VSCode

### 2.1 Get the Project Files
Option A - If using Git:
```bash
git clone https://github.com/yourteam/ev-charging-frontend.git
cd ev-charging-frontend
```

Option B - If manually copying files:
- Copy the entire `ev-charging-frontend` folder
- Open VSCode
- File → Open Folder → Select `ev-charging-frontend`

### 2.2 Open Terminal in VSCode
- Press: Ctrl + ` (backtick key)
- OR: Menu → Terminal → New Terminal

### 2.3 Install Dependencies
```bash
npm install
```
This installs all required packages. Wait 1-2 minutes.
You'll see a `node_modules` folder appear.

### 2.4 Verify Installation
```bash
npm list --depth=0
```
You should see: react, react-dom, react-leaflet, leaflet, react-router-dom, axios

---

## STEP 3: Project Structure Explained

```
ev-charging-frontend/
│
├── public/
│   └── index.html              ← Main HTML file (don't change much)
│
├── src/
│   ├── components/             ← Reusable UI pieces
│   │   ├── Header/
│   │   │   ├── Header.jsx      ← Top navigation bar
│   │   │   └── Header.css      ← Header styles
│   │   │
│   │   ├── Map/
│   │   │   ├── MapView.jsx     ← Interactive Leaflet map ⭐ MAIN
│   │   │   └── MapView.css     ← Map styles & marker styles
│   │   │
│   │   ├── StationList/
│   │   │   ├── StationList.jsx ← List of station cards
│   │   │   └── StationList.css ← Card styles
│   │   │
│   │   ├── StationDetails/
│   │   │   ├── StationDetails.jsx ← Popup/modal with full info
│   │   │   └── StationDetails.css ← Modal styles
│   │   │
│   │   └── SearchFilter/
│   │       ├── SearchFilter.jsx ← Search bar + filters
│   │       └── SearchFilter.css ← Filter styles
│   │
│   ├── pages/                  ← Full pages (routes)
│   │   ├── Home.jsx            ← Map + List main page ⭐ MAIN
│   │   ├── Home.css
│   │   ├── Favorites.jsx       ← Saved stations page
│   │   ├── Favorites.css
│   │   ├── About.jsx           ← About the app page
│   │   └── About.css
│   │
│   ├── services/
│   │   └── api.js              ← All API calls (mock/real toggle) ⭐ KEY
│   │
│   ├── data/
│   │   └── mockStations.js     ← 10 fake stations in Rajkot ⭐ KEY
│   │
│   ├── hooks/
│   │   └── useApp.js           ← Custom React hooks (favorites, location)
│   │
│   ├── App.js                  ← Main app with routing
│   ├── App.css                 ← Global styles
│   └── index.js                ← React entry point
│
├── .env                        ← Configuration (API URL, mock toggle)
├── package.json                ← Dependencies list
└── README.md                   ← This file!
```

### Most Important Files for You:
| File | What it does | When you'll change it |
|------|-------------|----------------------|
| `src/data/mockStations.js` | Fake station data | To add/change stations |
| `src/services/api.js` | API calls | When backend is ready |
| `.env` | Config variables | To switch mock→real API |
| `src/components/Map/MapView.jsx` | The map with markers | To customize map |
| `src/pages/Home.jsx` | Main home page layout | To change layout |

---

## STEP 4: Running the App

### 4.1 Start Development Server
```bash
npm start
```

### 4.2 Open in Browser
- Browser opens automatically at: http://localhost:3000
- If not, manually go to: http://localhost:3000

### 4.3 What You Should See
✅ Dark-themed app with "ChargeSaathi" header
✅ Interactive OpenStreetMap in center
✅ 10 charging station markers (green = available, red = unavailable)
✅ Station list on the right side
✅ Search and filter controls

### 4.4 Hot Reload (Auto Refresh)
- When you save any file → browser auto-refreshes
- No need to restart npm start

### 4.5 Stop the Server
- Press: Ctrl + C in terminal

---

## STEP 5: Understanding the Code

### How Mock Data Works:
```
.env file:
REACT_APP_USE_MOCK_DATA=true  ← This tells app to use fake data

src/services/api.js:
if (USE_MOCK) {
  return mockStations;  ← Returns fake data from mockStations.js
} else {
  return fetch(API_URL) ← Calls real backend (when ready)
}
```

### How the Map Displays Markers:
```
src/data/mockStations.js:
{ id: 1, latitude: 22.3039, longitude: 70.8022, isAvailable: true, ... }
     ↓
src/components/Map/MapView.jsx:
stations.map(station => (
  <Marker position={[station.latitude, station.longitude]}
          icon={station.isAvailable ? greenIcon : redIcon} />
))
     ↓
Map shows green/red pin at those coordinates!
```

### How Favorites Work (Without Backend):
```
User clicks ❤️ button
     ↓
src/services/api.js → favoritesAPI.add(stationId)
     ↓
In MOCK mode: saves to localStorage (browser storage)
     ↓
localStorage.setItem('ev_favorites', [1, 3, 5])
     ↓
Page refresh? Still saved! ✅
```

---

## STEP 6: Making Changes

### 6.1 Add a New Charging Station to Mock Data
Open `src/data/mockStations.js` and add to the array:
```javascript
{
  id: 11,                              // Unique number
  name: "My New Station",             // Station name
  latitude: 22.3100,                  // GPS coordinates
  longitude: 70.8050,                 // GPS coordinates
  address: "New Location, Rajkot",   // Full address
  connectorType: "Type 2",           // Main connector
  connectors: ["Type 2", "CCS"],     // All connectors
  power: 100,                         // kW
  price: "₹15/kWh",                  // Price
  isAvailable: true,                  // true = green, false = red
  distance: 3.0,                      // km from center
  rating: 4.5,                        // 1-5 stars
  totalReviews: 50,
  totalPlugs: 4,
  availablePlugs: 3,
  operatingHours: "24/7",
  amenities: ["WiFi", "Parking"],    // List of amenities
  provider: "My Provider",
  providerLogo: "MP",                 // 1-2 letter abbreviation
  lastUpdated: "Just now",
  waitTime: "No wait",
  isFavorite: false
}
```
Save the file → Browser refreshes → New station appears on map! ✅

### 6.2 Change the Map's Default Location
Open `src/data/mockStations.js` or `.env`:
```bash
# .env
REACT_APP_DEFAULT_LAT=19.0760    # Mumbai
REACT_APP_DEFAULT_LON=72.8777    # Mumbai
```

### 6.3 Change App Name
Open `public/index.html`:
```html
<title>Your App Name ⚡</title>
```
Open `src/components/Header/Header.jsx`:
```jsx
<span className="logo-name">Your App Name</span>
<span className="logo-tagline">Your Tagline</span>
```

### 6.4 Change Colors
Open `src/App.css` and `src/components/Header/Header.css`:
```css
/* Main blue color: change #00c8ff to your color */
/* Main dark background: change #070714 to your color */
```

---

## STEP 7: Testing Features

### Test 1: Map Interaction
- ✅ Click any green/red pin → popup appears with station info
- ✅ Click "View Details" in popup → side panel opens
- ✅ Zoom in/out with scroll wheel
- ✅ Drag map to pan

### Test 2: Search & Filter
- ✅ Type "Tesla" in search → only Tesla stations show
- ✅ Select "Available Only" → only green stations show
- ✅ Select "150+ kW" power → only high-power stations show
- ✅ Click "↺ Reset" → all filters clear

### Test 3: Favorites
- ✅ Click 🤍 on any station card → turns ❤️ (saved)
- ✅ Go to Favorites page → station appears there
- ✅ Refresh browser → favorite is still saved (localStorage)
- ✅ Click ❤️ again → removes from favorites

### Test 4: Station Details
- ✅ Click any station card → details panel slides in from right
- ✅ Report availability buttons work (shows success message)
- ✅ "Get Directions" → shows route info
- ✅ "Open Maps" → opens Google Maps in new tab
- ✅ Click outside panel → closes it

### Test 5: View Toggle
- ✅ Click "🗺️ Map" → shows only map full screen
- ✅ Click "⚡ Both" → shows map + list side by side
- ✅ Click "📋 List" → shows only station list

### Test 6: Responsive Design
- ✅ Open browser DevTools (F12) → Toggle device toolbar
- ✅ Select mobile size (375px) → app adapts for mobile
- ✅ Navigation menu becomes hamburger menu

---

## STEP 8: Connecting to Backend (When Ready)

### When Backend Developer gives you the API URL:
Example: `https://ev-charging-api.azurewebsites.net`

### Step 8.1: Update .env file
```bash
# .env
REACT_APP_API_URL=https://ev-charging-api.azurewebsites.net
REACT_APP_USE_MOCK_DATA=false    ← CHANGE THIS TO false!
```

### Step 8.2: Restart the app
```bash
# Stop current server (Ctrl+C), then:
npm start
```

### Step 8.3: Test connection
Open browser console (F12 → Console tab):
- You should see API calls to backend
- No more "[MOCK]" messages in console

### That's it! One line change connects to real backend! ✅

---

## STEP 9: Deploying for Demo Review

### Option A: Netlify (Easiest - FREE)
```bash
# Step 1: Build the app
npm run build

# Step 2: Go to https://netlify.com
# Step 3: Drag & drop the 'build' folder
# Step 4: Get URL like: https://chargesaathi.netlify.app
# Step 5: Share with reviewers! ✅
```

### Option B: GitHub Pages (FREE)
```bash
# Step 1: Install gh-pages
npm install --save-dev gh-pages

# Step 2: Add to package.json
"homepage": "https://yourusername.github.io/ev-charging-frontend",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Step 3: Deploy
npm run deploy

# URL: https://yourusername.github.io/ev-charging-frontend
```

### Option C: Vercel (FREE + Fastest)
```bash
# Step 1: Install Vercel CLI
npm install -g vercel

# Step 2: Deploy
vercel

# Follow the prompts → Get URL like: https://chargesaathi.vercel.app
```

---

## STEP 10: Troubleshooting

### Problem: `npm install` fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force
# Try again
npm install
```

### Problem: Map doesn't load (grey/blank)
**Solution:**
```bash
# Missing Leaflet CSS - add to public/index.html:
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
# OR reinstall:
npm install leaflet react-leaflet
```

### Problem: Markers not showing
**Solution:** Check browser console (F12) for errors.
Most common fix:
```javascript
// Make sure coordinates are numbers, not strings
latitude: 22.3039,   // ✅ Number
latitude: "22.3039", // ❌ String - will break
```

### Problem: `npm start` port 3000 already in use
**Solution:**
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <number> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Problem: Favorites not saving
**Solution:** Check if browser blocks localStorage (private/incognito mode).
Test in normal browser window.

### Problem: CORS error when connecting to backend
**Solution:** Tell backend developer to add your URL to CORS:
```csharp
// Backend Program.cs should have:
policy.WithOrigins("http://localhost:3000", "https://your-deployed-url.netlify.app")
```

---

## 📝 Daily Development Workflow

```
1. Open VSCode
2. Open terminal: Ctrl + `
3. Run: npm start
4. Browser opens at localhost:3000
5. Make changes in src/ files
6. Browser auto-refreshes! ✅
7. When done → Ctrl+C to stop
8. Commit to Git: git add . && git commit -m "your message"
```

---

## 🤝 Collaboration with Backend Developer

### What YOU need from Backend Developer:
- API base URL (e.g., https://ev-charging-api.azurewebsites.net)
- Confirmation that CORS is enabled for localhost:3000
- API documentation (Swagger URL)

### What YOU give to Backend Developer:
- The exact API endpoints you're calling (listed in src/services/api.js)
- Data format expected (structure from mockStations.js)

### API Endpoints Frontend Calls:
```
GET  /api/stations              → Get all stations
GET  /api/stations/nearby?lat=X&lon=Y&radius=Z → Nearby stations
GET  /api/stations/{id}         → Single station
POST /api/stations/availability → Report availability
GET  /api/favorites             → Get user favorites
POST /api/favorites             → Add favorite
DELETE /api/favorites/{id}      → Remove favorite
GET  /api/routing?userLat=X&userLon=Y&stationId=Z → Get route
```

### Expected Response Format:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Station Name",
      "latitude": 22.3039,
      "longitude": 70.8022,
      "address": "Full address",
      "connectorType": "Type 2",
      "connectors": ["Type 2", "CCS"],
      "power": 150,
      "price": "₹15/kWh",
      "isAvailable": true,
      "distance": 2.5,
      "rating": 4.5,
      "totalReviews": 128,
      "totalPlugs": 8,
      "availablePlugs": 5,
      "operatingHours": "24/7",
      "amenities": ["WiFi", "Parking"],
      "provider": "Tesla",
      "providerLogo": "T",
      "lastUpdated": "2 mins ago",
      "waitTime": "No wait"
    }
  ]
}
```

---

## ✅ Progress Checklist

### Week 1 (Setup + Basic Map):
- [ ] Node.js installed
- [ ] VSCode set up with extensions
- [ ] Project running with `npm start`
- [ ] Map visible with markers
- [ ] Station list showing

### Week 2 (Features):
- [ ] Search and filter working
- [ ] Station details panel opening
- [ ] Favorites saving and loading
- [ ] Report availability working
- [ ] Responsive on mobile

### Week 3 (Integration):
- [ ] Backend API URL received
- [ ] .env updated with real URL
- [ ] REACT_APP_USE_MOCK_DATA=false
- [ ] App working with real data
- [ ] All features tested with backend

### Week 4 (Polish + Deploy):
- [ ] Any UI fixes based on feedback
- [ ] Deployed to Netlify/Vercel
- [ ] Link shared with team
- [ ] Demo prepared

---

Built with ❤️ by Team ChargeSaathi
Frontend: React + Leaflet.js | Backend: ASP.NET Core + SQL Server
