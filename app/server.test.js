const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createApp } = require("./server");

async function startTestServer() {
  const app = createApp();

  return await new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      resolve(server);
    });

    server.on("error", reject);
  });
}

async function request(server, requestPath) {
  const address = server.address();

  return await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: address.port,
        path: requestPath,
        method: "GET"
      },
      (res) => {
        let body = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

test("GET /api/health returns ok payload", async () => {
  const server = await startTestServer();

  try {
    const response = await request(server, "/api/health");
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), { status: "ok" });
  } finally {
    server.close();
  }
});

test("GET /api/message returns CI/CD demo fields", async () => {
  process.env.PROJECT_NAME = "ci-cd-lab";
  process.env.ENVIRONMENT = "demo";
  process.env.NODE_PORT = "30080";

  const server = await startTestServer();

  try {
    const response = await request(server, "/api/message");
    const payload = JSON.parse(response.body);

    assert.equal(response.statusCode, 200);
    assert.equal(payload.projectName, "ci-cd-lab");
    assert.equal(payload.environment, "demo");
    assert.equal(payload.nodePort, "30080");
    assert.match(payload.message, /Express backend/);
    assert.match(payload.requestPath, /ALB/);
    assert.ok(payload.timestamp);
  } finally {
    server.close();
    delete process.env.PROJECT_NAME;
    delete process.env.ENVIRONMENT;
    delete process.env.NODE_PORT;
  }
});

test("GET / falls back to frontend html", async () => {
  const server = await startTestServer();

  try {
    const response = await request(server, "/");

    assert.equal(response.statusCode, 200);
    assert.match(response.headers["content-type"], /text\/html/);
    assert.match(response.body, /Simple frontend \+ Express backend/);
  } finally {
    server.close();
  }
});
