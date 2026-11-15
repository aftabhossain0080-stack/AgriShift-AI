# AgriShift AI Frontend

A bilingual (English and Bengali) web application built for smallholder farmers in Hooghly District, West Bengal, India. AgriShift AI translates Earth observation data from NASA POWER, NASA GPM IMERG, and NASA SMAP into actionable crop recommendations, transparent 100-point suitability scores, stage-specific irrigation schedules, and crop rotation plans.

Calibrated against regional research packages of practice from the Indian Council of Agricultural Research (ICAR) and Bidhan Chandra Krishi Viswavidyalaya (BCKV).

---

## Key Capabilities

1. **Transparent 100-Point Suitability Scoring**: Points allocated across temperature match (0 to 30), root-zone soil moisture (0 to 25), rainfall accumulation (0 to 25), and crop rotation synergy (-20 to +20).
2. **Eight Supported Regional Crops**: Mustard, Lentil, Potato, Maize, Aman Paddy, Boro Rice, Jute, and Wheat.
3. **Four-Week Stage-Specific Irrigation Schedule**: Stage-by-stage water volume recommendations in millimetres derived from SMAP soil wetness and POWER solar radiation.
4. **Agro-Climatic Risk Alerts**: Early warnings for dry spells, surface water stress, excessive humidity, and heat spikes.
5. **Crop Rotation & Stubble Management**: Agronomic guidance on nutrient preservation and soil health without open field residue burning.
6. **Bilingual by Design**: Complete English and native Bengali translations with authentic agricultural terminology.
7. **Mobile-First & Resilient**: Accessible on low-end 360px mobile viewports, automatic offline fallback to ICAR/BCKV mock models, and full skeleton loaders.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, standalone output)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS (custom earth palette, 6px borders, zero gradients, zero shadows)
- **State & Data Fetching**: TanStack React Query v5
- **Form Management**: react-hook-form with Zod validation
- **Internationalisation**: next-intl (locale routing: `/en`, `/bn`)
- **Data Visualisation**: Recharts (with accessible data table toggles)
- **Iconography**: Phosphor Icons (regular weight only)
- **Typography**: Fraunces (headings), Source Sans 3 (body), Noto Sans Bengali (Bengali)
- **Backend Service**: FastAPI (Python 3.11+, repository: `AgriShift-AI`)

---

## Repository Map

```
NASA/
├── docs/
│   ├── API_CONTRACT.md         # Full backend API specification
│   ├── BACKEND_CHANGES.md      # FastAPI CORS, route, and adapter integration guide
│   ├── MERGE_CHECKLIST.md      # Co-developer merge and verification checklist
│   └── RULES_AUDIT.md          # 30-rule compliance audit (zero violations)
├── messages/
│   ├── bn.json                 # Native Bengali translations
│   └── en.json                 # English translations
├── public/
│   └── images/
│       ├── bullock-plough.png  # Land preparation in problem section
│       ├── harvest-machinery.png # Custom hiring centre stubble management
│       └── rice-transplanting.png # Transplanting seedlings hero image
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── advice/         # 4-step farmer intake wizard
│   │   │   ├── crops/[slug]/   # 8 static crop agronomic profiles
│   │   │   ├── demo/           # Standalone interactive demo
│   │   │   ├── design/         # UI design system showcase
│   │   │   ├── privacy/        # Privacy Policy (marked with DRAFT banner)
│   │   │   ├── results/        # Recommendation results and charts
│   │   │   ├── terms/          # Terms of Service (marked with DRAFT banner)
│   │   │   ├── layout.tsx      # Root localized layout
│   │   │   └── page.tsx        # Homepage assembling all sections
│   │   └── globals.css         # CSS custom properties and typography imports
│   ├── components/
│   │   ├── demo/               # Demo form, cards, charts, risk alerts, skeletons
│   │   ├── home/               # Hero, Problem, Data, Method, LiveDemo sections
│   │   ├── layout/             # Navbar, Footer, LanguageSwitcher
│   │   ├── providers/          # QueryProvider with devtools
│   │   └── ui/                 # Accessible primitives (Button, Input, Alert, etc.)
│   ├── hooks/
│   │   └── useRecommendations.ts # TanStack Query hook
│   ├── i18n/
│   │   ├── navigation.ts       # Localized Link and useRouter
│   │   ├── request.ts          # Server-side locale resolution
│   │   └── routing.ts          # Locale definitions (en, bn)
│   └── lib/
│       ├── api/                # Typed API client, schema mirrors, adapters
│       │   ├── adapters.ts     # Data adapters isolating backend response shapes
│       │   ├── client.ts       # Fetch wrapper with timeout and retries
│       │   ├── recommendations.ts # Candidate endpoint resolution
│       │   └── schema.d.ts     # Backend Pydantic types mirror
│       ├── crop-knowledge.ts   # ICAR and BCKV agronomic database
│       ├── mock-data.ts        # Validated agronomic fallback fixtures
│       └── types.ts            # Frontend domain type definitions
├── tests/                      # Playwright test suite
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # Frontend and backend container orchestration
├── next.config.mjs             # Next.js and next-intl configuration
├── playwright.config.ts        # Mobile and desktop Playwright configuration
└── tailwind.config.ts          # Strict brand colors and design tokens
```

---

## Environment Variables

Copy `.env.example` to `.env.local` to configure your environment:

```bash
cp .env.example .env.local
```

| Variable | Default Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Base URL of the FastAPI backend service |
| `NEXT_PUBLIC_USE_MOCKS` | `false` | When `true`, uses ICAR/BCKV mock data without network calls |

---

## Getting Started

### Prerequisites
- Node.js 18.17+ or 20.x
- npm 9+
- Python 3.11+ (to run the backend service)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

### 4. Run Linting and Typechecks
```bash
npx tsc --noEmit
npm run lint
```

---

## Swapping Between Mock and Live Backend

AgriShift AI features automatic resilience:

- **Live Backend Mode**: Set `NEXT_PUBLIC_USE_MOCKS=false` in `.env.local`. Start the backend with `uvicorn app.main:app --port 8000`. The frontend calls the primary endpoint `POST /api/v1/agriculture/recommendations`.
- **Automatic Fallback Mode**: If the live backend is unreachable or times out (10 seconds), the frontend automatically returns realistic agronomic data calibrated for Hooghly and flags `is_mock: true`.
- **Forced Mock Mode**: Set `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local`. All API functions bypass network requests and resolve immediately with local fixtures. Ideal for offline demonstrations, unit tests, and continuous integration.

---

## How to Add a New Backend Endpoint

To connect a new backend endpoint without breaking the separation of concerns:

1. **Update Pydantic Mirror (`src/lib/api/schema.d.ts`)**:
   Add the TypeScript interface matching the backend schema:
   ```typescript
   export interface BackendSoilTestResponse {
     ph: number;
     organic_carbon_percent: number;
     nitrogen_kg_ha: number;
   }
   ```

2. **Add Domain Type (`src/lib/types.ts`)**:
   Define the clean frontend type:
   ```typescript
   export interface SoilNutrientProfile {
     soilReaction: "Acidic" | "Neutral" | "Alkaline";
     organicMatterStatus: "Low" | "Medium" | "High";
   }
   ```

3. **Add Adapter in `src/lib/api/adapters.ts`**:
   Centralize all normalization here:
   ```typescript
   export function adaptSoilTest(raw: BackendSoilTestResponse): SoilNutrientProfile {
     return {
       soilReaction: raw.ph < 6.5 ? "Acidic" : raw.ph > 7.5 ? "Alkaline" : "Neutral",
       organicMatterStatus: raw.organic_carbon_percent < 0.5 ? "Low" : "Medium",
     };
   }
   ```

4. **Add Typed API Function (`src/lib/api/farmer.ts`)**:
   Use `apiFetch<T>`:
   ```typescript
   export async function getSoilProfile(village: string): Promise<SoilNutrientProfile> {
     const raw = await apiFetch<BackendSoilTestResponse>(`/api/v1/farmer/soil?village=${encodeURIComponent(village)}`);
     return adaptSoilTest(raw);
   }
   ```

5. **Consume with TanStack Query**:
   Wrap the API call in a hook in `src/hooks/` and use in components. UI components never touch raw backend response structures.

---

## Running Full Stack with Docker

A multi-container setup is pre-configured with `docker-compose.yml`:

```bash
# Build and run frontend and backend
docker compose up --build

# Run in background
docker compose up -d

# Stop services
docker compose down
```

Services exposed:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Backend Interactive Docs: `http://localhost:8000/docs`

---

## 30 Design Rules Summary

AgriShift AI is designed around smallholder utility, accessibility, and editorial restraint:
- **Zero Gradients & Shadows**: 1px borders (`#D8D2C4`) provide structure. Flat colors only.
- **Strict Agricultural Palette**: Deep field green (`#1E4D36`), soil brown (`#6B4A2F`), wheat (`#D9B26A`), ink (`#1B1F1C`), alert red (`#B3261E`), on warm off-white (`#F6F3EC`).
- **Phosphor Regular Icons**: Utilitarian agricultural symbols. Zero Lucide icons.
- **Zero Emojis & Zero Em Dashes**: Pure typographic discipline.
- **Asymmetric Editorial Layout**: Definition lists, 60/40 splits, and sequential numbered steps. Zero 3-card identical rows.
- **Consistent 6px Corner Radius**: Clean rectangular geometry. Zero pill buttons.
- **Skeleton Loaders**: Dedicated skeleton loaders across all asynchronous regions.
- **Accessible Touch Targets**: All interactive elements satisfy minimum 44px by 44px hit areas.
- **Legal Safeguards**: Terms of Service and Privacy Policy pages feature prominent DRAFT banners for legal review.

Full verification details: `docs/RULES_AUDIT.md`.

---

## Documentation Links

- [Backend Integration Guide](docs/BACKEND_CHANGES.md)
- [API Contract Specification](docs/API_CONTRACT.md)
- [Co-Developer Merge Checklist](docs/MERGE_CHECKLIST.md)
- [30 Design Rules Audit Report](docs/RULES_AUDIT.md)
- [Project Handoff Log](HANDOFF.md)
