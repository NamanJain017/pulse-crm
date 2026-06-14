# PULSE — AI-Native Mini CRM for KORA

> Built for the Xeno FDE Engineering Take-Home Assignment

PULSE is a Mini CRM for D2C and retail brands where AI is the operator, not the assistant.
The product is built for **KORA**, a fictional contemporary Indian fashion brand, with 500
synthetic customers and 1000+ orders spanning 18 months.

**Core thesis:** every shopper deserves a message written for them. PULSE's AI agent — **ARIA**
— takes a marketing goal in plain English, builds the audience, writes a unique message for
every single customer, picks the channel, and runs the campaign end to end.

---

## 1. What's in this repo

```
pulse-crm/
├── backend/        FastAPI CRM API — customers, segments, campaigns, ARIA, analytics
├── channel-stub/   Standalone simulated messaging channel (WhatsApp/SMS/Email/RCS)
├── frontend/       Next.js 14 dashboard — Mission Control themed UI
├── docker-compose.yml
└── .env.example
```

Two backend services are intentionally separate, mirroring how real messaging providers work:

```
┌─────────────┐   POST /send    ┌──────────────────┐
│  PULSE CRM  │ ───────────────▶│  Channel Stub    │
│  (FastAPI)  │                  │  (FastAPI)       │
│             │◀─────────────────│  Simulates       │
└─────────────┘  POST /receipts  │  delivery async  │
                  (callbacks)     └──────────────────┘
```

- The CRM never talks to a real messaging provider. It dispatches to the channel stub.
- The channel stub computes a realistic outcome (delivered/failed/opened/clicked/converted)
  per channel and customer tier, then asynchronously calls the CRM's `/receipts` webhook —
  exactly like Twilio, MSG91, etc. work in production.
- The CRM's receipt handler is **idempotent** and only advances message status forward.

---

## 2. Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (via Docker, or use the SQLite fallback for quick testing)
- An OpenRouter API key (free) — get one at [openrouter.ai](https://openrouter.ai)

### Option A — Docker Compose (recommended)

```bash
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

docker-compose up --build
```

This starts:
- PostgreSQL on `:5432`
- Backend on `:8000`
- Channel stub on `:8001`

Then run migrations and seed data:

```bash
docker-compose exec backend alembic upgrade head
curl -X POST http://localhost:8000/api/v1/data/seed
```

### Option B — Run services individually

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp ../.env.example .env
# Set DATABASE_URL to your Postgres instance, add OPENROUTER_API_KEY

alembic upgrade head
uvicorn main:app --reload --port 8000
```

**Channel Stub:**
```bash
cd channel-stub
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# CRM_RECEIPT_URL defaults to http://localhost:8000/api/v1/receipts
uvicorn main:app --reload --port 8001
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Then seed the database:
```bash
curl -X POST http://localhost:8000/api/v1/data/seed
```

Open [http://localhost:3000](http://localhost:3000).

---

## 3. The Product

### Dashboard
KPIs (customers, active campaigns, messages sent, revenue attributed), a 30-day reach chart,
channel performance radar, recent campaigns, and an AI-generated insight of the day.

### ARIA — Campaign Intelligence Agent
The signature feature. Type a goal like:

> "Win back customers who spent over ₹4000 but haven't bought in 60 days. Diwali sale vibe."

ARIA responds with a full plan:
- The audience it identified, with a plain-English rationale
- The recommended channel and why
- Recommended send timing
- Sample personalized messages for real customers in the segment
- An estimated revenue range

One click — **Approve & Launch** — creates the segment, generates a unique message for
every matched customer (batched 20 at a time through the AI), and dispatches the campaign.

### Segments
Reusable audience definitions. Create them manually (no AI needed) or describe them in plain
English and let AI translate the brief into filter rules — with a live customer count preview.

### Campaigns
Every campaign shows a delivery funnel (Sent → Delivered → Opened → Clicked → Converted),
a **live delivery stream** (Server-Sent Events) that ticks in real time as the channel stub
fires callbacks, and a per-customer message table.

### Customers
Searchable, sortable table of all 500 KORA shoppers with tier, spend, category preferences,
and full order history in a slide-out detail panel. CSV export included.

---

## 4. AI Provider

PULSE uses **OpenRouter** with free models (`meta-llama/llama-3.3-70b-instruct:free` primary,
`google/gemma-2-9b-it:free` fallback) — zero cost to run. Swap models or add Anthropic/OpenAI
keys by editing `backend/app/config.py`.

AI is used for:
1. **Segment parsing** — natural language → structured filter rules
2. **Per-customer message generation** — batched, personalized by name, category, tier, city
3. **ARIA orchestration** — full campaign plans with rationale and revenue estimates
4. **Campaign & dashboard insights** — plain-English performance summaries

---

## 5. Channel Simulation Details

Each channel has independently tuned delivery/open/click rates based on real-world Indian
D2C messaging benchmarks:

| Channel  | Delivery | Open | Click |
|----------|----------|------|-------|
| WhatsApp | 95%      | 52%  | 18%   |
| SMS      | 90%      | 28%  | 8%    |
| Email    | 83%      | 21%  | 5%    |
| RCS      | 88%      | 44%  | 22%   |

Customer tier multiplies engagement (Platinum customers engage ~35% more than Silver).
Failure reasons are realistic and channel-specific (invalid_number, dnd_registered, bounced,
spam_filtered, rcs_not_supported, etc.).

**Time compression**: `TIME_COMPRESSION_FACTOR` (default 60) divides all real-world delays
so a 30-minute open delay becomes 30 seconds — useful for demos. Set to `1` for realistic
timing.

---

## 6. System Design Notes & Tradeoffs

These are the explicit tradeoffs made for this assignment scope. See the walkthrough video
for the full discussion.

| Decision | Rationale | At scale, we'd... |
|---|---|---|
| No auth | Out of scope for demonstrating CRM logic | Add Supabase Auth + JWT |
| No webhook verification | Standalone channel stub runs locally / demo-oriented | Add HMAC-SHA256 signature headers with a shared signing secret to verify callbacks |
| APScheduler-free, synchronous launch | Simplicity for demo | Move to Celery + Redis queue for 10k+ customer campaigns |
| In-memory ARIA plan cache | 30-min TTL, single-instance only | Redis with TTL for multi-instance deploys |
| No scheduled sends | `scheduled_at` column exists in schema, unused | Add APScheduler cron job |
| Single brand (KORA) | Keeps demo focused and realistic | Add `organization_id` for multi-tenancy |
| Revenue attribution via simulated conversion event | Channel stub fabricates an order amount on conversion | Real systems use UTM + time-windowed order matching |

### Idempotency & Ordering
The `/receipts` endpoint is the most carefully designed part of this system:
- Every callback carries a unique `idempotency_key`; duplicates are detected and ignored
- Message status only **advances forward** (`pending → dispatched → delivered → opened →
  clicked → converted`), so an out-of-order or duplicate "delivered" event after "opened"
  is silently dropped
- Campaign aggregate stats are incremented atomically via raw SQL `UPDATE ... SET x = x + 1`
  to avoid race conditions under concurrent callbacks

### Retry Logic
The channel stub retries failed callbacks to the CRM up to 3 times with exponential backoff
(1s, 2s, 4s) before giving up and logging the failure.

---

## 7. API Reference

Full interactive docs at `http://localhost:8000/docs` (Swagger UI) once the backend is running.

Key endpoints:
- `POST /api/v1/data/seed` — seed KORA synthetic data
- `GET /api/v1/customers` — paginated customer list with filters
- `POST /api/v1/segments/from-brief` — AI-powered segment creation
- `POST /api/v1/aria/brief` — get ARIA's campaign plan
- `POST /api/v1/aria/approve/{plan_id}` — launch the approved plan
- `GET /api/v1/campaigns/{id}/analytics` — full campaign metrics + AI insight
- `GET /api/v1/campaigns/stream/{id}` — SSE live delivery feed
- `POST /api/v1/receipts` — channel stub → CRM callback (idempotent)

---

## 8. Deployment

- **Frontend** → Vercel (auto-deploy from `frontend/`)
- **Backend** → Render/Railway (`backend/Dockerfile`)
- **Channel Stub** → Render/Railway, second service (`channel-stub/Dockerfile`)
- **Database** → Supabase (Postgres, free tier)

Set environment variables per `.env.example` on each service. Make sure:
- Backend's `CHANNEL_STUB_URL` points to the deployed channel stub
- Channel stub's `CRM_RECEIPT_URL` points to the deployed backend's `/api/v1/receipts`
- Backend's `ALLOWED_ORIGINS` includes the deployed frontend URL
- Frontend's `NEXT_PUBLIC_API_URL` points to the deployed backend

---

## 9. AI-Native Development Workflow

This project was built with AI assistance throughout — from data model design, to the
idempotent receipt-handler pattern, to the channel simulation parameters, to the seed data
generator. Every AI-suggested pattern was reviewed and is understood by the author.

Meta point: PULSE itself uses AI to power its core product loop (ARIA). The same
AI-native philosophy that powers the product was used to build it.
