# MediTwin AI 🏥

### Predictive Healthcare Digital Twin System

MediTwin AI creates a virtual model of your cardiovascular system, predicts your health risk using machine learning, and explains it in plain language — all in under 30 seconds.

> **“Predicting healthcare before it becomes a crisis.”**

---

## 🚨 The Problem

Cardiovascular disease kills **17.9 million people every year**, yet most cases are preventable with early detection.

However:

* Healthcare access is limited
* Wearables are expensive
* Medical data is hard to understand
* Risk remains invisible until it’s too late

---

## 💡 Our Solution

MediTwin AI democratizes cardiovascular screening by:

* 🧬 Creating a **Digital Twin** of the user
* 🔮 Predicting **future health risks**
* 🧠 Explaining results in **simple language**
* 🎙️ Delivering **voice-based reports**
* 📷 Using camera-based **contactless vitals detection**

---

## 👥 Who Can Use It

* General public → quick health checks
* Rural patients → pre-screening
* Fitness users → track improvements
* Caregivers → monitor elderly
* Healthcare workers → triage tool

---

## ✨ Features

* Digital Twin Engine (Framingham-based)
* AI Chat (Gemini)
* Voice Report (ElevenLabs)
* Camera-based vitals (Presage SDK)
* Risk visualization (D3.js)
* Future simulation (7/30/90 days)
* PDF health report
* Scan history tracking

---

## 🧠 ML Model

* Logistic Regression
* Based on Framingham Heart Study
* 10 input features
* Outputs risk probability, label, and insights

---

## 💻 Tech Stack

* Frontend: React, Vite
* Backend: Flask
* ML: scikit-learn
* AI: Gemini API
* Voice: ElevenLabs
* DB/Auth: Supabase
* Visualization: D3.js

---

## 🚀 Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors scikit-learn numpy google-genai requests
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ⚠️ Disclaimer

This is a predictive wellness tool, not a medical device.
