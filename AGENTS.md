# Repository Instructions

This repository hosts the LRA validation dashboard.

- Keep the dashboard static and dependency-light unless a build step becomes necessary.
- Generated dashboard data belongs under `public/data/dashboard-data.json`.
- Shared issue export logic lives in sibling `lra-governance`; do not duplicate GitHub issue parsing here.
