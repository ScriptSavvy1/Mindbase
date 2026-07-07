# Mindbase Academy

A full-stack e-learning platform focused on AI and Fintech education, built with **Next.js 15**, **Tailwind CSS v4**, and **Supabase** (PostgreSQL + Auth + Storage).

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with `@theme` design tokens
- **Backend**: Supabase (PostgreSQL, RLS policies, Auth, Storage)
- **Icons**: Lucide React
- **Deployment**: Vercel + Supabase Cloud

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your Project URL and anon key
3. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run database migrations

Go to the **SQL Editor** in your Supabase dashboard and run:

1. `supabase/migrations/001_initial_schema.sql` — Creates all tables, RLS policies, indexes, and storage buckets
2. `supabase/seed.sql` — Inserts demo data (instructors, courses, lessons, reviews)

### 4. Enable Google OAuth (optional)

1. In Supabase Dashboard → Authentication → Providers → Google
2. Add your Google OAuth credentials
3. Set redirect URL to `http://localhost:3000/auth/callback`

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        # Login page
│   │   └── signup/page.tsx       # Signup with role selection
│   ├── admin/page.tsx            # Admin panel (course/instructor approval)
│   ├── auth/callback/route.ts    # OAuth callback handler
│   ├── courses/
│   │   ├── page.tsx              # Course catalog with filters
│   │   └── [courseId]/page.tsx    # Course detail page
│   ├── dashboard/page.tsx        # Learner dashboard
│   ├── instructor/
│   │   ├── page.tsx              # Instructor dashboard
│   │   └── courses/
│   │       ├── new/page.tsx      # Create new course
│   │       └── [courseId]/edit/   # Edit existing course
│   ├── learn/[courseId]/page.tsx  # Course player
│   ├── globals.css               # Design system & tokens
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/
│   ├── catalog/                  # Filter sidebar
│   ├── course/                   # CurriculumAccordion, InstructorCard, ReviewCard
│   ├── instructor/               # CurriculumBuilder, FileUpload
│   ├── layout/                   # Navbar, Footer
│   ├── player/                   # VideoPlayer, LessonSidebar
│   └── ui/                       # Button, Badge, StarRating, ProgressBar, CourseCard
├── contexts/AuthContext.tsx       # Auth state management
├── lib/
│   ├── queries/                  # Supabase query functions
│   └── supabase/                 # Client, server, middleware helpers
├── middleware.ts                  # Auth session refresh & route protection
└── types/index.ts                # TypeScript type definitions
```

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, roadmaps, featured courses |
| `/courses` | Full course catalog with search, filters, sort |
| `/courses/[id]` | Course detail with curriculum, instructor, reviews |
| `/learn/[id]` | Course player with video and lesson sidebar |
| `/login` | Sign in with email or Google |
| `/signup` | Create account with learner/instructor role |
| `/dashboard` | Learner dashboard with enrolled courses |
| `/instructor` | Instructor dashboard with stats and courses |
| `/instructor/courses/new` | Create a new course |
| `/admin` | Admin panel for approvals |

## Design System

The design follows a dark, developer-first aesthetic:

- **Background**: Deep charcoal (#08080d → #12121c)
- **Accent**: Electric purple (#6c5ce7)
- **Typography**: Inter (Google Fonts)
- **Glass effects**: Backdrop blur on navbar
- **Animations**: Fade-in, slide-in, staggered children

## License

Private — Mindbase Academy
