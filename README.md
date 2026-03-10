# FitMind

**FitMind** is an AI-powered Progressive Web Application (PWA) designed to help adults aged **40+ prevent sarcopenia** through safe resistance training and intelligent nutrition tracking.

The system combines **computer vision, edge AI, and expert nutrition rules** to guide users during workouts and ensure adequate protein intake for muscle health.

The platform runs entirely in the browser with **privacy-first AI**, meaning camera video data is **never sent to external servers**.

---

# Key Features

## AI Posing Corrector (Computer Vision)

FitMind uses **Google MediaPipe Pose** to analyze body posture during exercises.

The system:
- Detects **33 body landmarks**
- Calculates **joint angles**
- Identifies incorrect posture (e.g., knee valgus during squats)
- Counts exercise repetitions in real time

All pose detection runs **locally in the browser** to ensure user privacy.

---

## AI Workout Scheduler

FitMind includes a machine learning classifier that generates personalized workout programs.

The AI model takes **six health parameters**:

- Age
- BMI
- Gender
- Experience Level
- Pain Level
- Fitness Goal

The model outputs a **training plan category**, for example:

```
Silver_Mobility_Rehab
Beginner_Strength
Joint_Protection
```

The application then generates a **28-day training roadmap** following a clinical pattern:

```
2 Training Days → 1 Rest Day
```

The model runs locally using **ONNX Runtime Web**.

---

## Nutritional Expert System

FitMind includes a rule-based nutrition system based on **sarcopenia prevention guidelines**.

The system:
- Calculates **daily protein targets**
- Tracks protein consumption from meals
- Recommends protein-rich foods

Protein targets follow clinical recommendations:

```
> 1.2 g protein per kg body weight
```

---

## Privacy-First AI

Unlike many fitness applications, FitMind ensures **complete user privacy**.

- Pose detection runs **client-side**
- No video data is uploaded
- Only structured exercise results are stored

---

# Technology Stack

| Layer | Technology |
|------|-------------|
| Frontend | Next.js (React) |
| State Management | Zustand |
| Styling | Tailwind CSS |
| AI Vision | Google MediaPipe Pose |
| AI Model | ONNX Runtime Web |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth (JWT) |
| Hosting | Vercel |

---

# System Architecture

The system follows a **three-layer architecture**.

```
User Device
     │
     ▼
Presentation Layer
Next.js PWA
MediaPipe Pose
ONNX Runtime
     │
     ▼
Hosting Layer
Vercel CDN
     │
     ▼
Backend Layer
Supabase
PostgreSQL
Auth + RLS
```

AI inference runs **on the client device**, while Supabase manages authentication and structured data storage.

---

# Getting Started

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Open your browser and go to:

```
http://localhost:3000
```

---

# Environment Variables

Create a `.env.local` file in the root directory and add:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

# Project Structure

```
app/
   dashboard/
   exercise/
   meals/
components/
   ui/
   workout/
lib/
   supabase/
   ai/
models/
   schedule_classifier.onnx
public/
```

---

# Performance Optimizations

### Debounced Search
Food search waits **300ms** before querying the database to reduce unnecessary requests.

### Lazy Loading
Food library data loads incrementally instead of loading the entire dataset at once.

### Edge AI Inference
The ONNX model runs **inside the browser**, eliminating network latency.

---

# Deployment

FitMind is deployed using **Vercel**.

To deploy:

```bash
vercel
```

The system automatically builds and deploys the Next.js application.

---

# Research Context

This project was developed as part of a **BSc Software Engineering dissertation at Cardiff Metropolitan University**.

Research focus:
- AI-powered digital therapeutics
- Sarcopenia prevention
- Edge AI privacy
- Computer vision in fitness

---

# Future Improvements

Potential improvements include:

- 3D pose estimation
- Wearable device integration
- Adaptive AI training plans
- Clinical validation studies

---

# License

This project is developed for **academic research purposes**.
