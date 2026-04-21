# Stranger Chat App

Anonymous 1-on-1 real-time chat application with random pairing.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime + Storage)
- **Theme**: Midnight Indigo (cyberpunk aesthetic)

## Features

- Random stranger pairing via queue system
- Real-time messaging with typing indicators
- Image upload support (max 5MB)
- Profanity filter on nicknames
- Block list (30 min cooldown)
- Reporting system
- Auto-disconnect after 5 min inactivity

## Setup

### 1. Prerequisites

- Node.js 18+
- Supabase account

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to start

### 3. Run Database Schema

1. Open Supabase SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Execute the query

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: Settings → API

### 5. Install & Run

```bash
npm install
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Landing/     # Nickname input
│   ├── Matching/    # Pairing screen
│   └── Chat/        # Chat interface
├── hooks/
│   ├── useSession.js   # Session management
│   └── useMatching.js  # Queue & messaging
├── lib/
│   └── supabase.js    # Supabase client
├── types/
│   └── chat.ts        # TypeScript types
└── App.jsx           # Main app routing
```

## Flow

1. **Landing**: Enter nickname → validate → join queue
2. **Matching**: Wait for partner → animated indicator
3. **Chat**: Exchange messages → skip/leave/report

## Safety

- Nicknames with profanity are rejected
- Blocked users can't be paired for 30 min
- Reports are logged for moderation
- Images validated (type + size) before upload