# TrimLink Frontend

Premium Next.js frontend for the TrimLink platform.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- TanStack Query
- Axios
- Zustand
- React Hook Form + Zod
- Framer Motion
- Recharts
- PWA support
- i18n ready for English and Amharic

## Run

```bash
npm install
npm run dev
```

## Environment

Create `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8999/api/v1
```

## Notes

- The app is designed to connect to the Spring Boot backend in `../TrimLink_backend`.
- Auth uses the backend OTP flow.
- Payments, queue updates, and device registration are wired through clean service modules.
- Several pages include polished placeholder analytics and fallback mock data so the UI remains reviewable before every backend endpoint is fully populated.
- Next.js App Router is used with `src/app`, route-specific layouts, and client components where interactivity is required.
