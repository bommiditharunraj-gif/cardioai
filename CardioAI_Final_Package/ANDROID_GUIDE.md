# 📱 CardioAI — Android App Guide

## ✅ Current Status

| Service | Status | URL |
|---------|--------|-----|
| Backend API | ✅ RUNNING | http://localhost:8000 |
| Frontend Dev | ✅ RUNNING | http://localhost:3000 |
| Android Project | ✅ GENERATED | `frontend/android/` |

---

## 🤖 Upgraded Intelligent Chatbot

The chatbot is now a fully context-aware AI medical assistant. It can understand **20+ topics**:

| Ask About | Example Questions |
|-----------|-------------------|
| Your risk | *"What's my risk level?"*, *"How am I doing?"* |
| Blood Pressure | *"Explain my blood pressure"*, *"What is hypertension?"* |
| Cholesterol | *"My cholesterol is high"*, *"Tell me about LDL"* |
| Heart Rate | *"What's a normal pulse?"*, *"My max heart rate"* |
| Chest Pain | *"I have chest pain"*, *"What is angina?"* |
| Diet | *"What should I eat?"*, *"Heart healthy foods"* |
| Exercise | *"How much should I exercise?"*, *"Is it safe to run?"* |
| ECG | *"Explain my ECG"*, *"What is ST depression?"* |
| Medications | *"What are statins?"*, *"Tell me about beta blockers"* |
| Diabetes | *"My blood sugar is high"*, *"What is HbA1c?"* |
| Smoking | *"Should I quit smoking?"* |
| Stress/Sleep | *"I'm stressed"*, *"How to sleep better?"* |
| Weight | *"I need to lose weight"*, *"What is a healthy BMI?"* |
| Emergency | *"Heart attack symptoms"*, *"When to call ambulance?"* |
| History | *"Show my health trends"*, *"My previous assessments"* |

> All responses are **personalized** using your actual vitals from the last assessment!

---

## 📱 Running as Android App

### Step 1: Install Android Studio

Download from: https://developer.android.com/studio

### Step 2: Install Java JDK 17+

Download from: https://adoptium.net/

### Step 3: Open the Android Project

```bash
cd /Users/jarnox/Heart-disease/frontend
npm run android:open
```

This opens `frontend/android/` in Android Studio.

### Step 4: Run on Emulator or Device

In Android Studio:
1. Click **"Run"** (▶️ green button) or press `Shift+F10`
2. Choose your device (emulator or connected phone)
3. The app will build and install automatically

### Step 5: Connect to Backend

The Android app connects to:
- **Android Emulator** → `http://10.0.2.2:8000` (automatically configured)
- **Real Device** → Set your Mac's local IP in the app config

For **real device**, update `frontend/capacitor.config.json`:
```json
{
  "server": {
    "androidScheme": "http"
  }
}
```

And in `frontend/script.js` change the backend URL to your Mac's local IP (shown in the dev server output as the "Network" URL, e.g. `http://192.168.1.37:8000`).

---

## 🌐 Testing in Browser (Right Now)

The app is already running at:
- **http://localhost:3000** — Full web app with all features

---

## 🔄 Quick Commands

```bash
# Start backend
cd backend && source venv/bin/activate && python main.py

# Start frontend dev server
cd frontend && npm run dev

# Build for Android (after changes)
cd frontend && npm run android:build

# Open in Android Studio
cd frontend && npm run android:open
```

---

## 📁 Android Project Location

The generated Android project is at:
```
/Users/jarnox/Heart-disease/frontend/android/
```

You can open this folder directly in Android Studio without any npm commands.

---

## ⚠️ Requirements for Android Build

| Tool | Version | Download |
|------|---------|----------|
| Android Studio | Latest | https://developer.android.com/studio |
| Java JDK | 17+ | https://adoptium.net/ |
| Android SDK | API 34+ | Installed via Android Studio |
| Node.js | 18+ | Already installed ✅ |
