# 🌸 BloomPath

**AI-Powered Mental Health Companion for Pregnant Women**

BloomPath is a supportive web application designed to help pregnant women track their emotional wellness and receive AI-powered mental health support throughout their pregnancy journey.

Built for **HackNation AI Hackathon** - Addressing perinatal depression, which affects **1 in 4 women** globally.

## Features

- **AI Companion Chat**: Empathetic, pregnancy-aware conversational AI that provides emotional support 24/7
- **Mood Tracking**: Daily check-ins with emoji-based mood scoring and emotion tagging
- **EPDS Screening**: Clinically-validated Edinburgh Postnatal Depression Scale with AI-powered interpretation
- **Crisis Detection**: Real-time detection of concerning language with immediate crisis resource display
- **Partner Communication Helper**: AI-powered tool to help craft thoughtful messages to partners
- **Voice Input**: Voice-to-text for mood check-ins (accessibility feature)
- **AI Insights**: Personalized AI-generated reflections after each mood entry
- **Wellness Dashboard**: Visualize mood trends, EPDS history, and receive weekly AI summaries
- **Privacy-First**: All user data is stored securely in your own database

## Key Statistics

- **1 in 4** women experience perinatal depression globally
- **50%** of cases go undiagnosed due to stigma
- **96%** user satisfaction with AI pregnancy chatbots (Northwell study)
- Perinatal depression is the **#1 complication** of childbirth

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: SQLite (easily switchable to PostgreSQL)
- **AI**: Anthropic Claude API (claude-3-haiku)

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ──────> │   Backend    │ ──────> │ Claude API  │
│  (Next.js)  │ <────── │  (Express)   │ <────── │  (Anthropic)│
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │   SQLite    │
                        │  Database   │
                        └─────────────┘
```

**Why This Architecture?**

1. **Security**: API keys stay on the server, never exposed to clients
2. **Data Persistence**: All user data stored securely in database
3. **Scalability**: Backend can handle rate limiting, caching, and scaling
4. **Privacy**: Sensitive mental health data never leaves secure server
5. **Reliability**: Server-side validation and error handling

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### Installation

1. **Clone and install dependencies:**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. **Set up the backend:**

```bash
cd backend

# Copy environment file and add your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Generate Prisma client and create database
npx prisma generate
npx prisma db push
```

3. **Start the development servers:**

```bash
# Terminal 1 - Backend (from backend folder)
npm run dev

# Terminal 2 - Frontend (from frontend folder)
npm run dev
```

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="your-anthropic-api-key"
PORT=3001
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user` | POST | Create new user |
| `/api/user/:userId` | GET | Get user details |
| `/api/chat` | POST | Send message to AI |
| `/api/chat/:userId` | GET | Get chat history |
| `/api/mood` | POST | Submit mood entry |
| `/api/mood/:userId` | GET | Get mood history |
| `/api/epds` | POST | Submit EPDS screening |
| `/api/epds/:userId` | GET | Get EPDS history |
| `/api/epds/:userId/latest` | GET | Get latest EPDS score |
| `/api/partner` | POST | Generate partner communication message |
| `/api/insights/:userId` | GET | Get weekly insights (includes EPDS data) |

## Crisis Resources (Displayed In-App)

- **National Suicide Prevention Lifeline**: 988
- **Postpartum Support International**: 1-800-944-4773
- **Crisis Text Line**: Text HOME to 741741
- **SAMHSA National Helpline**: 1-800-662-4357

## Project Structure

```
bloompath/
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   │   ├── page.tsx       # Home/onboarding
│   │   ├── chat/          # AI chat interface
│   │   ├── mood/          # Mood check-in (with voice input)
│   │   ├── screening/     # EPDS depression screening
│   │   ├── partner/       # Partner communication helper
│   │   └── insights/      # Wellness dashboard (with EPDS integration)
│   ├── components/        # React components
│   │   ├── Navigation.tsx
│   │   ├── MoodChart.tsx
│   │   ├── CrisisResources.tsx
│   │   ├── VoiceInput.tsx
│   │   └── ...
│   └── lib/               # API client
│
├── backend/               # Express.js backend
│   ├── src/
│   │   ├── index.ts       # Server entry
│   │   ├── routes/        # API routes (chat, mood, epds, insights, user, partner)
│   │   └── services/      # AI service with crisis detection & partner messaging
│   └── prisma/            # Database schema
│
└── README.md
```

## Demo Script (for Judges)

1. **Onboarding** (15s): Enter name and due date
2. **Mood Check-in** (20s): Select mood, emotions, and optional notes (demonstrate voice input)
3. **View AI Insight** (15s): See personalized AI-generated reflection
4. **EPDS Screening** (30s): Complete validated 10-question depression screening
5. **Chat with AI** (30s): Have supportive conversation about pregnancy anxiety
6. **Crisis Detection** (15s): Show how app responds to concerning language
7. **Partner Communication** (20s): Generate thoughtful message to explain feelings to partner
8. **View Insights** (15s): See mood trends, EPDS history, and weekly AI summary

**Key Demo Messages:**
- "I'm scared about labor and can't sleep"
- "Help me explain my feelings to my partner"
- Show crisis resources are always visible in footer
- Highlight EPDS score integration in insights dashboard



## Important Notes

- BloomPath is designed to supplement, not replace, professional mental health care
- For medical concerns, always consult a healthcare provider
- If experiencing severe distress, please contact a crisis helpline


**Theme**: AI for Global Health Impact

**Focus**: Perinatal mental health and pregnancy wellness

## License

MIT License - Feel free to build upon this project!
