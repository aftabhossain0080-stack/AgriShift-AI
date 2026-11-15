# AgriShift AI : Co-Developer Merge & Integration Checklist

## Overview

This checklist guides backend engineers and co-developers merging the Next.js 14 frontend into the AgriShift AI monorepo or deploying it alongside the FastAPI service (`AgriShift-AI`).

Target Region: Hooghly District, West Bengal, India  
Frontend Framework: Next.js 14 App Router (TypeScript Strict)  
Backend Service: FastAPI (Python 3.11+)

---

## 1. Pre-Merge Verification Steps

Execute these commands from the frontend project root (`NASA`):

```bash
# 1. Verify TypeScript type safety (must output 0 errors)
npx tsc --noEmit

# 2. Verify ESLint compliance (must report zero warnings or errors)
npx next lint

# 3. Verify Next.js production build (generates 33/33 static pages)
npm run build
```

- [ ] `npx tsc --noEmit` exits with status 0.
- [ ] `npx next lint` reports "✔ No ESLint warnings or errors".
- [ ] `npm run build` generates all static routes and standalone output.

---

## 2. Backend Configuration Checklist

In the FastAPI repository (`AgriShift-AI`):

- [ ] **Verify CORS Middleware**: Ensure `app/main.py` has `CORSMiddleware` mounted with allowed origins.
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=cors_origins,
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- [ ] **Set Backend Environment**: Ensure `AgriShift-AI/.env` contains:
  ```bash
  APP_HOST=0.0.0.0
  APP_PORT=8000
  CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
  DEFAULT_LATITUDE=22.90
  DEFAULT_LONGITUDE=88.40
  ```
- [ ] **Confirm Primary Endpoint**: Ensure `POST /api/v1/agriculture/recommendations` responds with valid JSON matching `src/lib/api/schema.d.ts`.
- [ ] **Confirm Health Endpoint**: Ensure `GET /health` returns `{ "status": "healthy" }`.

---

## 3. Frontend Environment Configuration

In the frontend repository (`NASA`):

- [ ] Copy `.env.example` to `.env.local`:
  ```bash
  cp .env.example .env.local
  ```
- [ ] Set configuration flags:
  ```bash
  # URL where the FastAPI backend is running
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

  # Set to "false" for live backend; set to "true" for offline mock testing
  NEXT_PUBLIC_USE_MOCKS=false
  ```

---

## 4. Full-Stack End-to-End Verification

Test the integrated flow in your local browser:

1. **Start Backend**:
   ```bash
   cd AgriShift-AI
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   Verify Swagger docs load at `http://localhost:8000/docs`.

2. **Start Frontend**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/en` in your browser.

3. **Verify Landing Page**:
   - Hero section loads with title, CTA button, and `rice-transplanting.png`.
   - Data section displays NASA POWER, GPM IMERG, SMAP information.
   - Live demo section renders at the bottom.

4. **Verify Intake Wizard (`/en/advice`)**:
   - Step 1: Click "Singur" preset button (coordinates populate automatically).
   - Click "Next Step" to advance to Step 2 (Soil and Land).
   - Advance to Step 3 (Cropping History) and Step 4 (Review).
   - Click "Generate Recommendations".
   - Browser navigates to `/en/results` with query parameters.

5. **Verify Results Page (`/en/results`)**:
   - Skeleton loader displays while query is in-flight.
   - Ranked crop candidates render (e.g., Mustard, Lentil, Maize).
   - 100-point transparent score breakdown table renders.
   - 4-week irrigation schedule renders with weekly millimetre depths.
   - Crop rotation synergy card displays.
   - Soil moisture and temperature telemetry cards render.

6. **Verify Bilingual Switching**:
   - Click the language toggle button ("বাংলা").
   - Confirm page switches to `/bn/results` with authentic Bengali agricultural terminology.
   - Confirm toggle back to English ("English") functions cleanly.

7. **Verify Legal Pages**:
   - Navigate to `/en/terms` and `/en/privacy`.
   - Confirm mandatory "DRAFT FOR REVIEW BY A LAWYER" warning banner is present on both.

8. **Verify Fallback & Resilience**:
   - Stop the backend server (`Ctrl+C` in backend terminal).
   - Submit the advice form again.
   - Confirm frontend automatically falls back to ICAR/BCKV agronomic data with notice, or displays an accessible error card with retry button.

---

## 5. 30 Design Rules Conformance

Before pushing to main, verify that none of the 30 rules have been compromised:

- [ ] Rule 1: No gradients. Flat solid colors only.
- [ ] Rule 2: Phosphor regular icons only. Zero Lucide imports.
- [ ] Rule 3: Background is `#F6F3EC` (`bg-offWhite`).
- [ ] Rule 4: Strict palette: `#1E4D36`, `#6B4A2F`, `#D9B26A`, `#1B1F1C`, `#B3261E`.
- [ ] Rule 5: No drop shadows. Full 1px borders (`#D8D2C4`).
- [ ] Rule 6: Asymmetric editorial layouts. No 3-card identical rows.
- [ ] Rule 7: Zero emojis anywhere in copy or code.
- [ ] Rule 8: Zero blur or glassmorphism.
- [ ] Rule 9: Zero em dashes (`U+2014`) or en dashes (`U+2013`).
- [ ] Rule 10: Typography: Fraunces (headings), Source Sans 3 (body), Noto Sans Bengali.
- [ ] Rule 11: Full 1px border on alerts with severity icon. No left-border stripes.
- [ ] Rule 12: Zero testimonials.
- [ ] Rule 13: Zero bento grids.
- [ ] Rule 14: Zero terminal window graphics.
- [ ] Rule 15: No "It is not X, it is Y" phrasing.
- [ ] Rule 16: Numbered steps or prose. Zero checkmark bullet lists.
- [ ] Rule 17: Zero pricing tables or tiers. Free service.
- [ ] Rule 18: Real working demo wired to API / mock fallback.
- [ ] Rule 19: Corner radius 6px (`rounded`, `rounded-md`). Zero pills.
- [ ] Rule 20: No purple/black themes.
- [ ] Rule 21: Skeleton loaders for all async regions while loading.
- [ ] Rule 22: Zero radial orbs or glowing blobs.
- [ ] Rule 23: Zero dot-grid backgrounds.
- [ ] Rule 24: Zero sparkle or AI magic icons.
- [ ] Rule 25: Zero looping bounce or arrow animations.
- [ ] Rule 26: Terms of Service page exists at `/terms`.
- [ ] Rule 27: Privacy Policy page exists at `/privacy` with DRAFT banner.
- [ ] Rule 28: Hover effects change color or underline only. No scale/translate.
- [ ] Rule 29: Zero neon colors.
- [ ] Rule 30: Zero pastel fills.

Reference: Detailed rule audit report at `docs/RULES_AUDIT.md`.

---

## 6. Docker Deployment Verification

To test production containerization locally:

```bash
# Build and run both backend and frontend via docker-compose
docker compose up --build

# Verify frontend is accessible
curl http://localhost:3000

# Verify backend healthcheck
curl http://localhost:8000/health
```

- [ ] Frontend container builds successfully using multi-stage `Dockerfile`.
- [ ] Backend container starts and passes internal healthcheck.
- [ ] Both containers communicate over `agrishift-network`.
