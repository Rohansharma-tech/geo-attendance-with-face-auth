# 📍 AttendAI — Location-Based Attendance System
### Final Year Project | Face Recognition + Geofencing

---

## 🗂️ Project Structure

```
attendance-system/
├── backend/                  ← Node.js + Express API
│   ├── models/
│   │   ├── User.js           ← User schema (name, email, password, faceDescriptor)
│   │   └── Attendance.js     ← Attendance schema (userId, date, time, lat, lng)
│   ├── routes/
│   │   ├── auth.js           ← POST /api/auth/login, GET /api/auth/me
│   │   ├── users.js          ← Admin: CRUD users
│   │   ├── attendance.js     ← Mark & view attendance
│   │   └── settings.js       ← Geofence config, face descriptor
│   ├── middleware/
│   │   └── auth.js           ← JWT protect & adminOnly middleware
│   ├── server.js             ← Express entry point
│   ├── .env                  ← Environment variables (edit this!)
│   └── package.json
│
├── frontend/                 ← React + Vite + Tailwind
│   ├── public/
│   │   └── models/           ← face-api.js weights (run download-models.sh)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js      ← Pre-configured HTTP client
│   │   ├── context/
│   │   │   └── AuthContext.jsx ← Global auth state (login/logout)
│   │   ├── components/
│   │   │   ├── Navbar.jsx    ← Top bar + bottom tab navigation
│   │   │   ├── PageWrapper.jsx ← Layout wrapper with padding
│   │   │   └── Toast.jsx     ← Success/error notification
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx          ← Login form
│   │   │   ├── UserDashboard.jsx      ← User home screen
│   │   │   ├── MarkAttendancePage.jsx ← MAIN: face + geo attendance
│   │   │   ├── RegisterFacePage.jsx   ← Face registration
│   │   │   ├── MyAttendancePage.jsx   ← User history
│   │   │   ├── AdminDashboard.jsx     ← Admin overview + stats
│   │   │   ├── UserManagementPage.jsx ← Create/delete users
│   │   │   └── AttendanceTablePage.jsx ← All records table
│   │   ├── App.jsx           ← Routing
│   │   ├── main.jsx          ← React entry point
│   │   └── index.css         ← Tailwind + custom styles
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── download-models.sh        ← Downloads face-api.js model weights
└── SETUP.md                  ← This file
```

---

## 🚀 Step-by-Step Setup

### Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB Community → https://www.mongodb.com/try/download/community
- Git (optional)

---

### Step 1 — Start MongoDB

**Mac/Linux:**
```bash
mongod --dbpath /data/db
```
**Windows:**
```bash
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
```
Or just start the **MongoDB service** from Services panel.

---

### Step 2 — Configure Backend

```bash
cd attendance-system/backend
```

Open `.env` and update the geofence to your actual location:
```env
GEOFENCE_LAT=13.0827       ← Your allowed latitude
GEOFENCE_LNG=80.2707       ← Your allowed longitude  
GEOFENCE_RADIUS=100        ← Radius in meters
JWT_SECRET=changeThisToSomethingRandom
```

💡 **Find your coordinates:** Open Google Maps → right-click your location → copy coordinates.

---

### Step 3 — Install & Start Backend

```bash
cd attendance-system/backend
npm install
npm run dev
```

You should see:
```
✅ Connected to MongoDB
👤 Default admin created → Email: admin@attendance.com | Password: admin123
🚀 Server running on http://localhost:5000
```

---

### Step 4 — Download Face Recognition Models

```bash
cd attendance-system
bash download-models.sh
```

This downloads ~7MB of model weights to `frontend/public/models/`.

> ⚠️ If curl is not available, download manually from:
> https://github.com/justadudewhohacks/face-api.js/tree/master/weights
> Copy all files into `frontend/public/models/`

---

### Step 5 — Install & Start Frontend

```bash
cd attendance-system/frontend
npm install
npm run dev
```

Open your browser: **http://localhost:5173**

---

## 🔑 Default Login

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@attendance.com     | admin123   |

---

## 📱 Usage Workflow

### Admin Setup (do this first):
1. Login as admin → **admin@attendance.com / admin123**
2. Go to **Users** → Create user accounts for employees
3. Share credentials with each employee

### Employee Usage:
1. Login with your credentials
2. Go to **Face ID** tab → Register your face (one time)
3. To mark attendance:
   - Tap **Mark** tab
   - Click **Start Attendance**
   - Allow location access when prompted
   - Allow camera access
   - Look at camera → click **Verify Face & Submit**
4. View your history in **History** tab

---

## ⚙️ How Face Recognition Works

```
User opens webcam
        ↓
face-api.js detects face in video stream
        ↓
Computes 128-dimensional descriptor vector
        ↓
Compares with stored descriptor (Euclidean distance)
        ↓
Distance < 0.6 → Match ✅    Distance ≥ 0.6 → Reject ❌
        ↓
If match → API marks attendance
```

## 📍 How Geofencing Works

```
Browser requests GPS coordinates
        ↓
Backend computes Haversine distance between
  user's location and configured geofence center
        ↓
Distance < radius → Inside zone ✅
Distance ≥ radius → Outside zone ❌
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB not connecting | Make sure `mongod` is running |
| Camera not working | Allow camera in browser settings |
| Location denied | Allow location in browser settings |
| Models not loading | Run `download-models.sh` again |
| Face not matching | Better lighting; re-register face |
| Already marked today | System allows one attendance per day |
| `npm install` fails | Delete `node_modules` and retry |

---

## 🎓 Key Concepts for Viva

1. **JWT Authentication** — Stateless tokens, no sessions stored on server
2. **face-api.js** — Client-side ML using TensorFlow.js; no server GPU needed
3. **Haversine Formula** — Great-circle distance between GPS coordinates
4. **Face Descriptors** — 128-dim embedding vectors that uniquely represent a face
5. **Euclidean Distance** — sqrt(Σ(d1ᵢ - d2ᵢ)²) — lower = more similar
6. **Geofencing** — Virtual geographic boundary enforced programmatically
7. **MongoDB** — Document-based NoSQL database; flexible schema
8. **React Context API** — Global state without external libraries like Redux
