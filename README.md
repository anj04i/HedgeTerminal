# secf

SECF is a 13F tracker that monitors institutional fund movements and provides a dashboard for visualization.

## setup

install dependencies:

```bash
bun install
```

## requirements

ensure you have:

- [bun](https://bun.sh)
- [uv](https://github.com/astral-sh/uv)
- [pm2](https://pm2.keymetrics.io/)

## database setup

initialize the database by creating the required table:

```bash
psql -U your_user -d your_database -f src/db/schema.sql
```

## syncing data

fetch and update fund data:

```bash
bun run sync-fund
```

or with pm2:

```bash
pm2 start ecosystem.config.cjs --only sync-funds
```

## starting services

launch the server and dashboard:

```bash
pm2 start ecosystem.config.cjs --only server,dashboard
```

## accessing the dashboard

the dashboard runs at:

```
http://localhost:8501
```
