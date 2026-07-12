# LRA Dashboard

Static dashboard for LRA validator progress across the `lra-volume-*` repositories.

The dashboard reads `public/data/dashboard-data.json`, which is generated from GitHub issues labeled `lra-validator`. If that file is absent, local development falls back to `public/data/dashboard-data.sample.json`.

## Data Model

Nightly volume workflows run the governance validator and sync each finding into GitHub Issues with stable metadata comments. This dashboard workflow queries those issues through `lra-governance/tools/governance/export_validator_issue_dashboard.py` and publishes the static site with GitHub Pages.

If the volume repositories are private, add an `LRA_DASHBOARD_PAT` repository secret with read access to those repos. Public repos can use the default `GITHUB_TOKEN`.

## Local Use

Open `public/index.html` in a browser, or serve the `public` directory with any static server.
