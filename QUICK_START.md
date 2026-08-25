# 🚀 UtsavMitra - Quick Start Guide

## Three Simple Steps

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Configure Environment
```bash
# Copy the template
cp .env.example .env

# Edit .env and add your Groq API key
# GROQ_API_KEY=sk-your-key-here
```

**Get Groq API Key:**
1. Visit: https://console.groq.com/
2. Sign up/login
3. Create API key
4. Copy to `.env`

### Step 3: Run the App
```bash
python app.py
```

**The app starts on:** `http://localhost:5000`

---

## ✓ What's Included

- ✅ **Flask Backend** - Python REST API
- ✅ **React Frontend** - Built & optimized
- ✅ **Authentication** - Sign up/login system
- ✅ **AI Planning** - Groq-powered festival plans
- ✅ **Database** - SQLite (auto-created)
- ✅ **Tests** - Included test suites

---

## 📝 Test It Works

```bash
# Test session & authentication
python test_session.py

# Test all API endpoints
python test_api.py
```

Both should show successful responses ✓

---

## 🗂️ Important Files

| File | Purpose |
|------|---------|
| `app.py` | Main Flask application |
| `.env` | Your configuration & secrets |
| `requirements.txt` | Python dependencies |
| `dist/public/` | Built React frontend |
| `festival_db.db` | Database (auto-created) |

---

## 🔧 Using Different Database

### SQLite (Default)
Leave `DATABASE_URL` empty in `.env`

### MySQL
1. Create database:
   ```sql
   CREATE DATABASE festival_db;
   ```

2. Set in `.env`:
   ```
   DATABASE_URL=mysql+pymysql://user:password@localhost:3306/festival_db
   ```

---

## ⚠️ Common Issues

**"Module not found"**
```bash
pip install -r requirements.txt
```

**"Groq API error"**
- Check GROQ_API_KEY in `.env`
- Verify key is correct

**"Port 5000 in use"**
- Edit `.env`: `PORT=5001`
- Or: `python app.py` shows alternatives

---

## 📚 Full Documentation

See [README_FLASK.md](README_FLASK.md) for complete details.

---

## 🎉 Done!

Your festival planning app is ready. Run `python app.py` and start planning! 🎊
