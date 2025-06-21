<<<<<<< HEAD
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
- [postgres](https://www.postgresql.org/download/)

## environment variables
refer `.env.example`

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

once completed, run this:
```bash
psql -U your_user -d your_database -f src/db/stats.sql
```

## starting services

launch the server and dashboard:


```bash
bun run server
```


```bash
cd/dashboard
uv run python -m streamlit run src/main.py
```

or with pm2:

```bash
pm2 start ecosystem.config.cjs --only server,dashboard
```

## accessing the dashboard

the dashboard runs at:

```
http://localhost:8501
```

## try webui (experimental)

```bash
cd webui
bun run dev
```
=======
# HedgeTerminal
>>>>>>> 0d6d96c8cb478d7fdadbeb5230870c7a37461232
