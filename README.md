# Cooper

A lightweight sustainability habit tracker built with Next.js App Router, Tailwind CSS, and localStorage.

## Development

```bash
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:3000` locally. In Cloud Run, the app serves on the runtime-provided `PORT` automatically through the standalone Next.js server.

Useful checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

Data access is isolated in `src/services/storage.ts` so a database-backed implementation can replace localStorage later. `POST /api/insights` now calls Gemini 2.5 Flash server-side when `GEMINI_API_KEY` is present, and falls back to mock guidance when Gemini is unavailable.

## Environment

Set `GEMINI_API_KEY` to enable live AI insights:

```bash
GEMINI_API_KEY=your_key_here
```

If the variable is missing in local development or Cloud Run, Cooper still works and returns calm fallback insights instead of failing.

## Docker / Cloud Run

```bash
docker build -t cooper .
docker run -p 8080:8080 cooper
```

The standalone image is Cloud Run-ready: it runs with `HOSTNAME=0.0.0.0` and respects the runtime `PORT` environment variable. The Dockerfile defaults to `8080`, which Cloud Run can override at runtime.

Deploy from the project root with Artifact Registry and Cloud Run:

```bash
gcloud auth login
gcloud config set project PROJECT_ID
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com
gcloud artifacts repositories create cooper --repository-format=docker --location=REGION
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/cooper/cooper:latest .
gcloud run deploy cooper --image REGION-docker.pkg.dev/PROJECT_ID/cooper/cooper:latest --region REGION --platform managed --allow-unauthenticated --port 8080 --set-env-vars GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Replace `PROJECT_ID` and `REGION` (for example, `us-central1`) before running the commands. For production, prefer a secret-backed Cloud Run environment variable instead of baking the key into the image or committing it to GitHub.
