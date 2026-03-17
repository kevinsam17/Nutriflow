# AI Nutrition Calculator

A full-stack web application that uses AI to analyze food input and provide nutritional insights such as calories, macronutrients, and dietary breakdowns.

## Features

- User authentication (signup/login)
- AI-powered food analysis
- Nutrition tracking and history
- Persistent data storage with database
- Real-time calculation of calories and nutrients

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Firebase (Firestore, Authentication)
- **Database:** Firebase Firestore
- **AI:** Google Gemini API (`@google/genai`)
- **Charts:** Recharts
- **Build Tool:** Vite

## Screenshots

<img width="835" height="726" alt="c2aaa14ec2cd7aefa4c6a5841aeb3467" src="https://github.com/user-attachments/assets/ff2862ef-26fc-4615-8e27-fa9cbcc04c7e" />
<img width="1103" height="911" alt="image" src="https://github.com/user-attachments/assets/3cdf8754-e834-43d1-9955-5d171c77f8b5" />


## Installation

```bash
git clone https://github.com/kevinsam17/Nutriflow
cd Nutriflow
npm install
```

Create a `.env` file in the root with your Firebase config:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then run:

```bash
npm run dev
```

## How It Works

1. Users input food items
2. Google Gemini AI analyzes the input and returns nutritional data
3. Calories, protein, carbs, and fat are displayed in real time
4. Data is saved to Firestore and users can track their dietary history over time

## Author

Kevin Sam
GitHub: https://github.com/kevinsam17
