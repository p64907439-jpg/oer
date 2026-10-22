# OER — Open Education Resources

A web app where teachers share learning materials and students browse them — no account required.

## Features

**Teachers** (sign in with Google)

- Create an account → get a public profile
- Create subject folders (e.g. "Algebra II")
- Upload videos, PDFs, and images into each subject
- Manage everything from a personal dashboard

**Students** (Google sign-in optional)

- Browse all subjects and teacher profiles with **no account** (guest)
- Search by subject, description, or teacher name; view files in the browser and download them
- Optionally create a student account — when signed in, their profile icon
  appears in every folder they open, so teachers and other students see who
  viewed it (guests are never tracked and can't see the viewer list)
- **Downloads tab** — download a file and its subject folder is saved to your downloads, with ✓ marks on saved files and "Not downloaded" marks on the rest (stored locally per device, no account)
- Installable PWA, works offline and is comfortable on small screens

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS 4
- [Supabase](https://supabase.com) — Auth (Google), Postgres, Storage
- [Sonner](https://sonner.emilkowal.ski) toasts
- UI follows [Emil Kowalski's design engineering skills](https://github.com/emilkowalski/skills) (in `.agents/skills/`)

## Database

| Table | Purpose |
| --- | --- |
| `profiles` | Teacher profiles — auto-created on Google signup via DB trigger |
| `subjects` | Subject folders owned by a teacher |
| `files` | Metadata for uploaded materials (name, size, kind, storage path) |

All tables have RLS: everyone can **read**; only the owning teacher can **write**. Files live in the public `oer-files` storage bucket under `{teacherId}/{subjectId}/…`, writable only by the owner.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm run dev
```

Open http://localhost:3000.

> In the Supabase dashboard, add `http://localhost:3000/auth/callback` to **Authentication → URL Configuration → Redirect URLs** so local Google sign-in works.

## Security notes

- `keys.txt` and `.env.local` are gitignored — never commit them.
- The **service_role** key and Supabase access token are server-side only; the app uses only the anon/public key.
