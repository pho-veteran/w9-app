async function loadMessage() {
  const statusEl = document.getElementById("status");
  const requestPathEl = document.getElementById("request-path");
  const projectNameEl = document.getElementById("project-name");
  const environmentEl = document.getElementById("environment");
  const nodePortEl = document.getElementById("node-port");
  const timestampEl = document.getElementById("timestamp");

  try {
    const response = await fetch("/api/message");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();

    statusEl.textContent = payload.message;
    requestPathEl.textContent = payload.requestPath;
    projectNameEl.textContent = payload.projectName;
    environmentEl.textContent = payload.environment;
    nodePortEl.textContent = payload.nodePort;
    timestampEl.textContent = payload.timestamp;
  } catch (error) {
    statusEl.textContent = `Backend request failed: ${error.message}`;
    requestPathEl.textContent = "Check Express container logs and ALB target health.";
  }
}

async function triggerLogDemo() {
  const statusEl = document.getElementById("log-demo-status");

  statusEl.textContent = "Calling /api/log-demo...";

  try {
    const response = await fetch("/api/log-demo");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    statusEl.textContent = `${payload.detail} Status: ${payload.status}.`;
  } catch (error) {
    statusEl.textContent = `Log demo failed: ${error.message}`;
  }
}

document
  .getElementById("log-demo-button")
  .addEventListener("click", triggerLogDemo);

loadMessage();
