# Apps4Aahana

Educational and fun apps for an 8-year-old, built with **Phaser 3** (small HTML5 game framework) and **Vite**. Each app lives under `apps/` and ships as a static site in **nginx** inside Docker—good for colorful, touch-friendly games on an **iPad** (Safari on your home Wi‑Fi).

## Layout

- **`apps/<name>/`** — source, `Dockerfile`, and production build.
- **`docker-compose.yml`** — local or NAS stack (example: **math-quiz** on port **9080**).

## Math quiz (test app)

- **Folder:** `apps/math-quiz`
- **Run locally (dev):** `cd apps/math-quiz && npm install && npm run dev` — open the URL Vite prints.
- **Run locally (production build):** `npm run build && npm run preview`
- **Docker:** from repo root: `docker compose build math-quiz && docker compose up -d math-quiz` → `http://<host>:9080`

On the iPad, use **`http://<NAS-LAN-IP>:9080`** (same Wi‑Fi as the NAS). Large buttons and `viewport-fit=cover` help with touch and full-screen feel.

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
