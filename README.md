# Apps4Aahana

Educational and fun apps for an 8-year-old. Each app lives under `apps/` and is packaged for deployment as a Docker container on a Terramaster NAS via Portainer.

## Layout

- **`apps/`** — one subdirectory per app (each with its own `Dockerfile` and source).

## Deploying on Portainer

1. Build and push images from your dev machine, or build on the NAS if Docker is available there.
2. In Portainer: **Stacks** → **Add stack** → paste a compose file, or **Containers** → **Add container** from an image.
3. Map host ports to the container’s published port (one port per app unless you use a reverse proxy).

See `docker-compose.example.yml` for a pattern you can copy per stack or merge for multiple services.
