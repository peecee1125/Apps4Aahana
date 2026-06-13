# Apps4Aahana

Educational and fun apps for an 8-year-old, built with **React**, **Vite**, and **Tailwind CSS**. The main quiz app targets **readiness for 3rd grade** (Tennessee-friendly math and ELA), **STEM** habits and content, **geography**, **planets and space**, **dinosaurs as science**, and **high-interest facts** so practice stays curious—not drill-only. Each app lives under `apps/` and ships as a static site in **nginx** inside Docker—good for colorful, touch-friendly UIs on an **iPad** (Safari on your home Wi‑Fi).

## Layout

- **`apps/<name>/`** — source, `Dockerfile`, and production build.
- **`docker-compose.yml`** — local or NAS stack (example: **math-quiz** on port **9080**).

## Math quiz (test app)

- **Folder:** `apps/math-quiz`
- **Run locally (dev):** `cd apps/math-quiz && npm install && npm run dev` — open the URL Vite prints.
- **Run locally (dev, specific port):** `cd apps/math-quiz && npm run dev -- --port 4545`
- **Run locally (production build):** `npm run build && npm run preview`
- **Lint / tests:** `npm run lint` and `npm test` (from `apps/math-quiz`).
- **Docker:** from repo root: `docker compose build math-quiz && docker compose up -d math-quiz` → `http://<host>:9080`

On the iPad, use **`http://<NAS-LAN-IP>:9080`** (same Wi‑Fi as the NAS). Large buttons and `viewport-fit=cover` help with touch and full-screen feel.

### Subjects (topics for 3rd-grade readiness + curiosity)

Same eight **subject keys** for saved scores. Labels and **test names** now spell out what to learn: core math/ELA, **STEM science** (including a new data & design round), **geography** (maps, Tennessee, world wonders), **planets & space tech**, **dinosaurs as science** (fossils & evidence), and **WOW STEM facts**.

| Subject | Focus | New or renamed rounds (examples) |
| ------- | ----- | -------------------------------- |
| Math · 3rd-grade ready | Operations → grade-3 topics | Adds **STEM math: charts, time & patterns** |
| Reading & writing | Comprehension, vocabulary | Tennessee-themed **summer reading boost** |
| STEM · life, Earth & physical | NGSS-style content | Adds **STEM curiosity: data, design & Earth** |
| Geography | Maps, landforms, civics | Adds **Explorers & world wonders** |
| Planets & space science | Solar system through deep space | Adds **Planet mysteries & NASA tech** |
| Dinosaurs · prehistoric STEM | Mesozoic life | Adds **Fossils, evidence & birds link** |
| WOW facts | Records + science surprises | Adds **Mind-blowing science & tech** |
| Extra challenge | Stretch quizzes | Math / science / reading / world labs |

### Features

- **10 randomised questions** per test drawn from the subject's question bank.
- **Scoring:** 10 pts per correct answer; 1–3 ⭐ stars awarded (1 star ≥ 0, 2 stars ≥ 70, 3 stars ≥ 90).
- **Best score** per test is saved and shown on the subject menu so Aahana can see her personal best.
- **Star history:** recent attempts are recorded in `localStorage` (capped so storage stays healthy). Tap **⭐ My Stars** on the home screen to see history (score, stars, subject, date) and a running total of stars earned.
- **Streak tracking:** best consecutive correct answer streak is tracked per session and shown at results.
- **Sound effects & confetti** on results for 2–3 star scores.

### Refreshing questions (without losing scores or stars)

High scores and **⭐ My Stars** history are keyed by **subject** and **test** identifiers in the browser’s `localStorage`, not by individual question text. You can safely:

1. **In the app (home → 🔄 Questions):** Use **Question bank tools** with an OpenAI API key to generate or **Refresh** AI question sets per test, or **Reset** to go back to the built-in banks. None of that touches the saved best scores or star history.
2. **In the repo:** Edit the built-in question files under `apps/math-quiz/src/data/` and redeploy, as long as you **do not rename** subject keys in `registry.js` or each test’s `key` field—renaming would orphan old progress under the old keys.

**Caveat:** Progress is **per browser / device**. Clearing site data, a private tab that gets discarded, or a new iPad will not carry scores over unless you add your own export/backup later.

## Private GitHub repo → Portainer on the NAS

You are not missing much: you need **either** the NAS to **build** the image from the repo **or** a place that already has a **built image** (recommended).

### Option A — Build on the NAS (Git + compose in Portainer)

1. Push this repo to **https://github.com/peecee1125/Apps4Aahana** (or keep using it as remote).
2. In Portainer: **Stacks** → **Add stack** → **Repository** (or “Build from Git” depending on version).
3. Paste the repo URL, set the **compose path** to `docker-compose.yml` at the repo root.
4. For a **private** repo, add credentials: **Personal Access Token** (HTTPS) or **deploy key** (SSH). Portainer stores them for pulls.
5. Deploy. The NAS **Docker engine** must be able to run `docker build` for `./apps/math-quiz` (normal on Terramaster with Docker/Portainer).

If the Git integration is flaky, clone on the NAS or paste the compose file manually.

### Option B — GitHub Actions builds the image (often simpler)

1. Workflow **`.github/workflows/math-quiz-ghcr.yml`** builds and pushes to **GitHub Container Registry** (`ghcr.io`):  
   `ghcr.io/peecee1125/apps4aahana-math-quiz:latest` (adjust owner if different).
2. First time: in GitHub → **Packages** → package → **Package settings** → set visibility or grant access.
3. On the NAS, use a stack that **only pulls the image** (no build on NAS):

```yaml
services:
  math-quiz:
    image: ghcr.io/peecee1125/apps4aahana-math-quiz:latest
    restart: unless-stopped
    ports:
      - "9080:80"
```

4. If the package is **private**, in Portainer **Registries** add **ghcr.io** with a GitHub **PAT** (`read:packages`). Then deploy the stack.

A ready-made compose file for this image is **`docker-compose.ghcr.yml`** (adjust the image name if your GitHub username differs).

**What people sometimes miss:** Portainer does not replace Git—**you still push code to GitHub**; Portainer either **pulls** that repo to build or **pulls an image** that CI built. HTTPS to the NAS IP is fine on LAN; no extra domain required for family use.

## See also

- `docker-compose.example.yml` — commented template if you prefer copy-paste stacks.
