module.exports = {
  apps: [
    {
      name: "server",
      script: "bun",
      args: "run server",
      cwd: "./",
    },
    {
      name: "sync-funds",
      script: "bun",
      args: "run jobs",
      cwd: "./",
    },
    {
      name: "dashboard",
      script: "uv",
      args: "run python -m streamlit run src/main.py",
      cwd: "./dashboard",
    },
  ],
};
