
# Yankee AI — Personal AI Study Assistant

Yankee AI is a personal learning platform designed to help students organize their studies, practice IT skills, and monitor their learning progress.

The platform combines AI-powered tutoring with practical study tools in one place.

## Features

- **Dashboard:** View learning statistics and navigate the platform.
- **AI Tutor:** Ask questions and receive AI-generated explanations using Dify.
- **My Materials:** Upload, organize, search, open, and download study documents.
- **Flashcards:** Create, review, and track flashcard mastery.
- **Study Planner:** Create tasks, set deadlines, and monitor completion.
- **IT Certifications:** Explore free IT learning resources and record learning activities.
- **My Progress:** Review study activity, completed tasks, and learning progress.
- **Light and Dark Mode:** Choose a comfortable display theme.

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase (database, authentication, and file storage)
- Dify (AI tutor)
- GitHub
- Vercel

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yannickhirwa-coder/yankee-ai-study-assistant.git
cd yankee-ai-study-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

Add your own credentials:

```env
DIFY_API_KEY=your_dify_api_key
DIFY_API_BASE_URL=https://api.dify.ai/v1

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Never publish private API keys or secret credentials.

### 4. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Database and Storage

Yankee AI uses Supabase for:

- Student authentication.
- Study materials and private file storage.
- Flashcards.
- Study planner tasks.
- IT skills progress records.
- User roles and progress monitoring.

Database access is protected using Row Level Security (RLS) policies.

The database schema and required policies must be configured in your own Supabase project.

## AI Integration

The AI Tutor connects to a Dify Chatflow through a Next.js API route.

Students can request different learning formats:

- Step-by-step tutoring.
- Flashcard generation.
- Conversational lesson scripts.
- Multiple-choice quizzes.

Generated flashcards can be saved to the student's Supabase account.

## Deployment

Yankee AI can be deployed using Vercel.

Configure the required environment variables in your Vercel project settings before deployment.

## Project Status

Yankee AI is an actively developed learning project. Features and improvements are being added as development progresses.

## Author

Developed by **Hirwa Mpore Michel Yannick**.

GitHub: https://github.com/yannickhirwa-coder
