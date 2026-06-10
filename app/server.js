const express = require("express");
const path = require("path");

function createApp() {
  const app = express();
  const projectName = process.env.PROJECT_NAME || "p2-w9-lab";
  const environment = process.env.ENVIRONMENT || "lab";
  const nodePort = process.env.NODE_PORT || "30080";

  app.use((req, res, next) => {
    const startedAt = Date.now();

    res.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      console.log(
        `[request] method=${req.method} path=${req.path} status=${res.statusCode} duration_ms=${durationMs}`
      );
    });

    next();
  });

  app.use(express.static(path.join(__dirname, "public")));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/message", (_req, res) => {
    res.json({
      projectName,
      environment,
      nodePort,
      message: "Frontend talks to Express backend through same ALB endpoint.",
      requestPath: "Internet -> ALB -> EC2 host port -> Kubernetes Service -> Express Pod",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/log-demo", (_req, res) => {
    console.log(`[demo] project=${projectName} environment=${environment} node_port=${nodePort}`);
    res.json({
      status: "logged",
      detail: "Generated demo log line for CI/CD observability stage."
    });
  });

  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  return app;
}

function startServer() {
  const app = createApp();
  const port = Number(process.env.PORT || 3000);

  return app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  createApp,
  startServer
};
