# StillSpace

> AI-powered mental health platform built for students.

StillSpace connects students with counsellors, provides AI-assisted mental health tools, and fosters a supportive community — all in one place.

**Live:** https://stillspace-opal.vercel.app

---

## Features

### For Students
- **AI Chat** — 24/7 mental health support powered by Claude (Anthropic)
- **Triage** — AI-assisted mood assessment to route students to the right level of care
- **Daily Questions** — Reflective prompts to build self-awareness
- **Mood Diary** — Track emotional patterns over time
- **Breathing Exercises** — Guided breathing tools for in-the-moment relief
- **Community Feed** — Peer support space with AI-classified posts
- **Missions & To-Do** — Goal-setting and daily task management
- **Calendar** — Schedule and manage appointments
- **Messaging** — Secure chat and voice calls with counsellors via Twilio

### For Counsellors
- **Dashboard** — Overview of assigned students and session activity
- **Student Notes** — Private session notes per student
- **Mood Trends** — Visual analytics on student wellbeing over time
- **Community Moderation** — Monitor and respond to community posts
- **Earnings & Calendar** — Manage schedule and track compensation
- **Counsellor Suggestions** — AI-generated session recommendations

### For Admins
- **Student Management** — View and manage all registered students
- **Counsellor Management** — Onboard and oversee counsellors
- **Platform Mood Trends** — Aggregate mental health analytics

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database & Auth | [Supabase](https://supabase.com) |
| AI | [Anthropic Claude](https://anthropic.com) + Groq |
| Voice & Messaging | [Twilio](https://twilio.com) |
| Animations | Framer Motion |
| Charts | Recharts |
| Deployment | [Vercel](https://vercel.com) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key
- A [Twilio](https://twilio.com) account (for voice/messaging)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/Pikallery/stillspace.git
   cd stillspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GROQ_API_KEY=your_groq_api_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_API_KEY=your_twilio_api_key
   TWILIO_API_SECRET=your_twilio_api_secret
   ```

4. **Set up the database**

   Run the schema in your Supabase SQL editor — copy the contents of `supabase/schema.sql` and execute it.

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
  app/
    admin/          # Admin portal pages
    counsellor/     # Counsellor portal pages
    student/        # Student portal pages
    api/            # API routes (AI, Twilio, etc.)
  components/
    ui/             # Reusable UI components (shadcn-based)
  lib/
    anthropic.ts    # Claude AI client
    supabase.ts     # Supabase client
    crypto.ts       # Encryption utilities
    utils.ts        # Shared helpers
supabase/
  schema.sql        # Database schema
```

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is currently unlicensed. All rights reserved.
