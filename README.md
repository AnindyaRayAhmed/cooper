# Cooper 🌱

**Daily carbon check-ins, AI-powered insights, and calm progress — no guilt required.**

Cooper is a lightweight sustainability habit tracker that meets you where you are. Instead of overwhelming dashboards or crushing emissions calculators, it gives you ten honest questions each day, a clear carbon score, and a Gemini-powered coach that meets you where you are — encouraging small, consistent steps without judgment.

Built on Next.js, deployed to Google Cloud Run, and engineered to run without a database.

---

## The Problem

Most sustainability apps fail for the same reasons: they demand too much, too fast. Users open them once, feel the weight of their carbon footprint, and never return.

Habit fatigue sets in when tracking feels like homework. Climate guilt compounds when progress feels invisible. And inconsistency wins whenever an app prioritizes completeness over calmness.

**Cooper is built around a different premise:** a two-minute daily ritual that scores your habits, celebrates your streak, and surfaces one gentle nudge for tomorrow — powered by AI, but never overwhelming.

---

## Features

| Feature | Description |
|---|---|
| **Daily Check-In** | 10 structured questions covering transport, food, energy, and consumption |
| **Carbon Score** | A 0–100 score calculated from your answers, updated every check-in |
| **Streak Tracking** | Consecutive-day tracking to build and sustain the habit |
| **Weekly Trend Chart** | Visualizes your last 7 check-in scores to surface momentum |
| **Gemini AI Insights** | Personalized recommendations, motivation, and a daily goal from Gemini 2.5 Flash |
| **Fallback Guidance** | Calm, curated insights served locally when Gemini is unavailable |
| **Local-First Persistence** | `localStorage` with validation and sanitization — no account required |
| **Responsive Design** | Fully usable on mobile, tablet, and desktop |
| **Accessible Markup** | Semantic HTML, ARIA labels, and clear focus management throughout |
| **Production-Safe API** | Server-side key handling — `GEMINI_API_KEY` is never exposed to the client |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, standalone output) |
| **Language** | TypeScript 6 |
| **Styling** | Tailwind CSS 4 |
| **AI** | Google Gemini 2.5 Flash via REST API |
| **Package Manager** | pnpm 11 |
| **Containerization** | Docker (multi-stage, Alpine-based) |
| **Cloud** | Google Cloud Run (fully managed, serverless) |
| **Registry** | Google Artifact Registry |
| **CI / Build** | Google Cloud Build |

---

## Architecture Overview

Cooper is intentionally a single-application deployment. There is no separate backend service, no database, and no external state store.

```
Browser
  └── Next.js App Router (SSR + Client Components)
        ├── /app/page.tsx           — Landing / onboarding
        ├── /app/check-in/         — Daily 10-question form
        ├── /app/dashboard/        — Score, streak, trend, insights
        └── /app/api/insights/     — Server-side Gemini proxy (POST)

src/services/storage.ts            — localStorage read/write with validation
src/lib/insights.ts                — Fallback insight builder + JSON parser
src/types/                         — Shared TypeScript types
```

**Key design decisions:**

- **No database for MVP.** All user data lives in `localStorage`. The storage layer is cleanly isolated in `src/services/storage.ts` behind a typed interface, making a future database swap straightforward without touching component code.
- **Server-side AI only.** The `POST /api/insights` route handles all Gemini communication. `GEMINI_API_KEY` is read from `process.env` on the server and never serialized into a client bundle.
- **Standalone Next.js output.** `next.config.ts` uses `output: "standalone"`, which produces a minimal Node.js server (`server.js`) with only the files needed at runtime — ideal for a lean container image.
- **Multi-stage Docker build.** The `deps`, `builder`, and `runner` stages ensure that `node_modules`, TypeScript sources, and build tooling never make it into the final image.

---

## AI Integration

### Gemini 2.5 Flash

Each request to `POST /api/insights` forwards the user's check-in data — carbon score, streak, highest-impact categories, and daily habits — to Gemini 2.5 Flash with a tightly scoped system prompt:

> *"You are Cooper, a calm sustainability habit coach. Give concise, supportive, practical advice. Avoid judgment, guilt, and technical jargon."*

The model is instructed to return a strict JSON shape:

```json
{
  "recommendations": ["...", "...", "..."],
  "motivation": "...",
  "goal": "..."
}
```

### Input Validation & Sanitization

Before any data leaves the server, the API route runs two layers of defense:

1. **Type guard (`isInsightsRequest`)** — enforces field types, integer constraints, array length limits, and string length caps.
2. **Sanitizer (`sanitizeInsightsRequest`)** — strips HTML tags and control characters from all free-text fields before they enter the prompt.

### JSON Parsing Resilience

`src/lib/insights.ts` uses a lenient parser that extracts JSON from the raw Gemini text response even when the model wraps it in markdown fences or prose. If parsing fails entirely, the system falls through to the fallback path.

### Graceful Degradation

If `GEMINI_API_KEY` is absent, or if the Gemini request fails for any reason (rate limit, network error, malformed response), the route returns a curated fallback insight built from the user's own check-in data. The API never surfaces a 500 to the user. Fallback behavior is logged server-side for observability.

```
GEMINI_API_KEY present?
  ├── Yes → Call Gemini → Parse JSON → Return insights (source: "gemini")
  │             └── Parse fails or network error → Fallback (source: "fallback")
  └── No  → Fallback immediately (source: "fallback")
```

---

## Accessibility & Code Quality

- **Semantic HTML** — headings, landmarks, lists, and buttons are used according to their spec meaning
- **ARIA labels** — interactive elements carry descriptive labels where visual context alone is insufficient
- **Responsive layouts** — flexbox and grid layouts adapt from 375px mobile to widescreen without horizontal overflow
- **Graceful loading states** — async operations surface loading indicators; no content flashes or layout shifts on hydration
- **TypeScript throughout** — all props, API payloads, and storage shapes are typed; `tsc --noEmit` is a required check before deployment
- **ESLint** — enforced via `eslint-config-next`; linting is run as part of the build validation workflow

---

## Local Development

**Prerequisites:** Node.js 22+, corepack enabled.

```bash
corepack enable
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**Useful checks before committing:**

```bash
pnpm lint        # ESLint
pnpm typecheck   # tsc --noEmit
pnpm build       # Full Next.js production build
pnpm start       # Run the production build locally
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini API key. Without it, Cooper serves fallback insights. |

Create a `.env.local` file for local development (already listed in `.gitignore`):

```env
GEMINI_API_KEY=your_key_here
```

> **Security note:** `GEMINI_API_KEY` is read exclusively on the server inside the `POST /api/insights` route handler. It is never referenced in any client component and never included in the browser bundle. For production deployments, inject it as a Cloud Run environment variable backed by Secret Manager — never hard-code it in the image or commit it to source control.

---

## Docker

The included `Dockerfile` uses a three-stage multi-stage build:

| Stage | Base | Purpose |
|---|---|---|
| `deps` | `node:22-alpine` | Install pnpm dependencies with a frozen lockfile |
| `builder` | `node:22-alpine` | Copy deps, run `pnpm build`, produce standalone output |
| `runner` | `node:22-alpine` | Copy only the standalone artifacts — no dev tooling |

**Build and run locally:**

```bash
docker build -t cooper .
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key_here cooper
```

The container starts a Node.js server bound to `0.0.0.0:8080`. Cloud Run can override the port at runtime via the `PORT` environment variable.

---

## Google Cloud Run Deployment

### Prerequisites

- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated
- A GCP project with billing enabled
- Docker (for local image builds, optional if using Cloud Build)

### Step 1 — Authenticate and configure your project

```bash
gcloud auth login
gcloud config set project PROJECT_ID
```

### Step 2 — Enable required APIs

```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

### Step 3 — Create an Artifact Registry repository

```bash
gcloud artifacts repositories create cooper \
  --repository-format=docker \
  --location=REGION \
  --description="Cooper container images"
```

Replace `REGION` with your preferred region (e.g., `us-central1`, `europe-west1`).

### Step 4 — Build and push the image with Cloud Build

```bash
gcloud builds submit \
  --tag REGION-docker.pkg.dev/PROJECT_ID/cooper/cooper:latest .
```

Cloud Build streams the multi-stage Docker build in the cloud — no local Docker daemon required.

### Step 5 — Deploy to Cloud Run

```bash
gcloud run deploy cooper \
  --image REGION-docker.pkg.dev/PROJECT_ID/cooper/cooper:latest \
  --region REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **Production recommendation:** Instead of `--set-env-vars`, store the key in Secret Manager and reference it with `--set-secrets GEMINI_API_KEY=gemini-api-key:latest`. This prevents the key from appearing in deployment logs or gcloud command history.

### Step 6 — Subsequent deployments (redeployment workflow)

After pushing code changes, rebuild and redeploy in two commands:

```bash
gcloud builds submit \
  --tag REGION-docker.pkg.dev/PROJECT_ID/cooper/cooper:latest .

gcloud run deploy cooper \
  --image REGION-docker.pkg.dev/PROJECT_ID/cooper/cooper:latest \
  --region REGION \
  --platform managed
```

Cloud Run performs a zero-downtime rollout — traffic shifts to the new revision only after it passes health checks.

### GitHub Actions Integration (optional)

To automate deployments on push to `main`, create `.github/workflows/deploy.yml` with the following steps:

1. Authenticate to GCP using [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) (preferred over service account keys)
2. Run `gcloud builds submit` to build and push the image
3. Run `gcloud run deploy` to promote the new revision

---

## Production Engineering Notes

### Fallback AI strategy

Cooper is designed to never fail visibly. If Gemini is unreachable or returns an unparseable response, the fallback insight builder produces calm, data-informed guidance from the user's own check-in fields. The UX is identical — users see recommendations, motivation, and a goal regardless of AI availability.

### Lightweight architecture

The absence of a database is a deliberate MVP decision, not an oversight. localStorage provides sufficient persistence for single-user habit tracking and eliminates an entire category of infrastructure complexity — no connection pooling, no schema migrations, no cold-start latency from a database proxy.

### Scalability path

When multi-device sync, data export, or community features become requirements, `src/services/storage.ts` is the only file that changes. Its interface (`load()` / `save()`) is already typed and decoupled from component logic. A database-backed implementation can be swapped in without modifying a single component.

### Container efficiency

The standalone Next.js build combined with a multi-stage Docker build produces a minimal runtime image. Only `public/`, `.next/standalone/`, and `.next/static/` are copied to the runner stage — no TypeScript compiler, no pnpm, no dev dependencies.

---

## Roadmap

- [ ] **Database persistence** — migrate to a lightweight store (e.g., Firestore, PlanetScale, or Turso) behind the existing storage interface
- [ ] **Multi-device sync** — user accounts with cross-device check-in history
- [ ] **Emissions benchmarking** — compare scores against regional or national averages
- [ ] **Gamification** — milestone badges, monthly challenges, and leaderboards
- [ ] **Community features** — opt-in group streaks and shared progress
- [ ] **Analytics** — aggregate trend analysis and category-level breakdowns
- [ ] **Personalized sustainability plans** — Gemini-generated weekly plans based on historical habits
- [ ] **Export** — download your check-in history as CSV or JSON

---

## Screenshots

> Coming soon — screenshots and a live demo GIF will be added here.

---

## License

Released under the [MIT License](./LICENSE).

Copyright © 2026 Anindya Ray Ahmed. Permission is granted, free of charge, to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software, subject to the conditions stated in the LICENSE file.
