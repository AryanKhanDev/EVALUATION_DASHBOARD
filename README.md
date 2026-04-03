## Database Schema

**mentors** — stores mentor accounts with list of assigned student IDs and submission status

**students** — stores student info (name, email, roll number), seeded directly

**evaluations** — one document per mentor-student pair, contains embedded marks array and lock status

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/eval-dashboard.git
cd eval-dashboard
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/eval-dashboard?retryWrites=true&w=majority&appName=Cluster0
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **Note:** If your network blocks MongoDB's default port 27017 (e.g. college WiFi), switch to a mobile hotspot or add `family: 4` to your Mongoose connect options and use the direct shard connection string.

Seed the database:
```bash
node seed.js
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open the app