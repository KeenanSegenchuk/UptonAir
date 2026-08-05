# Upton Air Quality Management

This repository contains the source code for [Upton Air](https://upton-air.com), a website built by Sustainable Upton to track air quality around town using [PurpleAir](https://www2.purpleair.com/) sensors. It provides:

- A live map with realtime sensor reading overlays
- Historical graphing with day/night gradient shading and configurable time ranges
- Configurable email alerts for air quality thresholds
- A ChatGPT-powered popup that can see and discuss the graphed data

This repo is designed to be reused: any town running its own PurpleAir sensors can fork it, point it at their sensors and boundary, and have their own version of the site running. This guide walks through that setup.

## Table of contents

- [Prerequisites](#prerequisites)
- [1. Configure your site](#1-configure-your-site)
  - [`.env`](#env)
  - [`sensor-info.json`](#sensor-infojson)
  - [`town.geojson`](#towngeojson)
  - [HTTPS certificates](#https-certificates)
- [2. Run it](#2-run-it)
  - [Production (Docker)](#production-docker)
  - [Development](#development)
- [Updating a running site](#updating-a-running-site)
- [Project structure](#project-structure)
- [Contact](#contact)

## Prerequisites

| Tool | Needed for |
|---|---|
| [Docker](https://docs.docker.com/get-docker/) + Docker Compose | Production deployment |
| [Node.js](https://nodejs.org/) (npm) | Client development, and building the client for production |
| [Python 3.9+](https://www.python.org/) | Server development |
| [pgAdmin](https://www.pgadmin.org/) (optional) | Inspecting the dev Postgres database |

## 1. Configure your site

Three files need to be filled in with your town's information before launching: `.env`, `sensor-info.json`, and `town.geojson`. You'll also need HTTPS certificates if you want to serve over `https://`.

### `.env`

Copy `.env.template` to `.env` and fill in the values:

| Variable | Description |
|---|---|
| `URL` | Your registered domain name (e.g. `your-town-air.com`) |
| `WEBPAGE_TITLE` | Shown as the page title in various places on the site |
| `LATITUDE` / `LONGITUDE` | Coordinates for the center of the map |
| `MAP_ZOOM` | Initial map zoom level — `13` is a good starting point |
| `HOMEPAGE` | `landing` or `dashboard` — which page loads at your bare domain |
| `CHATBOT_ENABLED` / `ALERTS_ENABLED` | `true`/`false` — disable either feature if you haven't set up the API keys it needs yet |
| `OPENAI_API_KEY` | Needed for the chatbot. Create an account at [platform.openai.com](https://platform.openai.com/) and generate a key (a few dollars of credit is enough to start) |
| `PURPLEAIR_API_KEY` | Needed to pull sensor data. Create an account at the [PurpleAir developer portal](https://develop.purpleair.com/) and generate a key |
| `EMAIL_PASSWORD` | Needed for email alerts. Create a Gmail account and generate an [app password](https://support.google.com/accounts/answer/185833) for it |
| `SECRET_KEY` | Signs CSRF tokens. Set this to your own long random string (e.g. output of `openssl rand -hex 32`). If left unset, the server generates a random one on every restart, which invalidates any CSRF tokens issued before that restart |

### `sensor-info.json`

Add one entry per sensor you want the site to monitor:

```json
{
    "id": "221881",
    "pAir_id": "222089",
    "name": "Memorial",
    "color": "green"
}
```

- **`id`** — the ID the server uses internally to track the sensor.
- **`pAir_id`** *(optional)* — the sensor's PurpleAir ID. Used to remap a location's history onto a new sensor when the physical unit is replaced. Defaults to `id` if omitted.
- **`name`** — display name for the sensor's location.
- **`color`** — color used for the sensor on the map and in the line graph.

`sensor-info-removed.json` holds entries for sensors that have been decommissioned but whose historical readings should still resolve to a name — move an entry there instead of deleting it outright if you retire a sensor.

### `town.geojson`

Provides your town's border for the map overlay. The easiest way to find one is [osm-boundaries.com](https://osm-boundaries.com/map) — their search only matches town names (not "town, state"), so you may need to scroll through results, and you'll need a free OpenStreetMap account to download the file.

### HTTPS certificates

The nginx container expects `certs/cert.pem` and `certs/key.pem`. For a real deployment, use a CA-issued certificate (e.g. via [Let's Encrypt](https://letsencrypt.org/)/certbot) for your domain. To generate a self-signed certificate for local testing:

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout certs/key.pem -out certs/cert.pem -days 365 \
  -subj "/CN=localhost"
```

Self-signed certs work, but browsers will warn visitors that the certificate isn't verified — fine for testing, not for a public launch.

## 2. Run it

### Production (Docker)

**Install (once):**
```bash
docker compose build
```

**Launch:**
```bash
docker compose up
# or, to rebuild and launch in one step:
docker compose up --build
```

> Make sure `flask-server/data` and the repo's `data/` directory (the Postgres volume) have write permissions, or Docker won't be able to persist data.

### Development

Open two terminals — one for the server, one for the client.

**`flask-server/`:**
```bash
pip install -r requirements.txt
```
Then run the server. If you have pgAdmin set up against the dev Postgres database:
```bash
python -m flask --app server run
```
Or, to run without a Postgres database:
```bash
python -m flask --app server_nopg run
```
Once the client is running, visit `localhost:3000/update` to pull fresh data.

**`client/`:**
```bash
npm install
npm start
```
> Any time you change `.env`, `town.geojson`, or `sensor-info.json`, run `npm run build` (or `node setup.js`) in `client/` to push those changes into the client build.

Then open `http://localhost:3000` in your browser.

## Updating a running site

```bash
./update
```

This takes the containers down, rebuilds the client, rebuilds the server image, and brings everything back up. Docker sometimes doesn't detect minor file changes on its own — if `./update` doesn't seem to pick up a change, rebuild without the cache (**take a database backup first**):

```bash
docker compose build --no-cache
```

## Project structure

```
├── client/            React frontend
├── flask-server/      Flask API + PurpleAir data pull/update tasks
├── nginx/             Reverse proxy config (TLS termination, static file serving)
├── certs/             HTTPS certs (gitignored — you generate these, see above)
├── data/              Postgres data volume
├── .env.template      Copy to .env and fill in
├── sensor-info.json   Sensors to monitor
├── town.geojson       Town border for the map
└── docker-compose.yml Production stack definition
```

## Contact

Want to contribute, or have questions launching your own site? Reach out at ksegenchuk@gmail.com.
