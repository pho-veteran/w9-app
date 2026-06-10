const express = require("express");
const path = require("path");

function createNoteStore() {
  const notes = [
    {
      id: "seed-welcome",
      text: "Welcome, scribe. Your notes live on this backend until the server restarts.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return {
    list() {
      return [...notes].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    },
    create(text) {
      const now = new Date().toISOString();
      const note = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        createdAt: now,
        updatedAt: now
      };

      notes.push(note);
      return note;
    },
    delete(id) {
      const index = notes.findIndex((note) => note.id === id);

      if (index === -1) {
        return false;
      }

      notes.splice(index, 1);
      return true;
    }
  };
}

function createApp(options = {}) {
  const app = express();
  const projectName = process.env.PROJECT_NAME || "p2-w9-lab";
  const environment = process.env.ENVIRONMENT || "lab";
  const nodePort = process.env.NODE_PORT || "30080";
  const noteStore = options.noteStore || createNoteStore();

  app.use(express.json({ limit: "32kb" }));

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

  app.get("/api/notes", (_req, res) => {
    res.json({ notes: noteStore.list() });
  });

  app.post("/api/notes", (req, res) => {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

    if (!text) {
      res.status(400).json({ error: "Note text is required." });
      return;
    }

    const note = noteStore.create(text.slice(0, 1000));
    console.log(`[note] action=create id=${note.id}`);
    res.status(201).json({ note });
  });

  app.delete("/api/notes/:id", (req, res) => {
    const deleted = noteStore.delete(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "Note not found." });
      return;
    }

    console.log(`[note] action=delete id=${req.params.id}`);
    res.status(204).end();
  });

  app.get("/api/debug/infra", (_req, res) => {
    res.json({
      projectName,
      environment,
      nodePort,
      requestPath: "Internet -> ALB -> EC2 host port -> Kubernetes Service -> Express Pod",
      timestamp: new Date().toISOString()
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
  createNoteStore,
  startServer
};
