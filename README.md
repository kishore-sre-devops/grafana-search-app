# Grafana Dashboard Search by IP

This application allows you to search for Grafana dashboards by entering an IP address. It queries the Grafana Search API and provides direct links to the matching dashboards.

## Prerequisites

- Docker and Docker Compose
- A Grafana instance
- A Grafana API Key or Service Account Token

## Setup

1.  Open the `.env` file in the root directory.
2.  Set `GRAFANA_URL` to your Grafana instance URL (used by the backend).
3.  Set `GRAFANA_API_KEY` to your Grafana API key.
4.  Set `GRAFANA_BROWSER_URL` to the URL you use to access Grafana in your browser.

## How to Run

From the `grafana-search-app` directory, run:

```bash
docker-compose up --build
```

The application will be available at `http://localhost`.

## How it works

- The **Frontend** (React) takes the IP address input.
- The **Backend** (Node.js) receives the IP and calls Grafana's `/api/search?query=IP_ADDRESS` endpoint.
- Dashboards containing the IP in their title, description, or tags will be returned.
- Clicking on a result will open the dashboard in a new tab using the `GRAFANA_BROWSER_URL`.
