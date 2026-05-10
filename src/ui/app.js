const API_BASE = "http://localhost:3000/api";

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".card[data-panel]");

const setActivePanel = (target) => {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === target));
  panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === target));
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActivePanel(tab.dataset.tab));
});

const setOutput = (form, payload) => {
  const output = form.querySelector(".output");
  output.textContent = JSON.stringify(payload, null, 2);
};

const handleSubmit = (form, endpoint, method = "POST", withToken = false) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const headers = { "Content-Type": "application/json" };

    if (withToken && payload.token) {
      headers.Authorization = `Bearer ${payload.token}`;
      delete payload.token;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      setOutput(form, result);
    } catch (error) {
      setOutput(form, { message: "Request failed", error: String(error) });
    }
  });
};

handleSubmit(document.querySelector('[data-panel="register"]'), "/auth/register");
handleSubmit(document.querySelector('[data-panel="verify"]'), "/auth/verify-otp");
handleSubmit(document.querySelector('[data-panel="login"]'), "/auth/login");
handleSubmit(document.querySelector('[data-panel="forgot"]'), "/auth/forgot-password");
handleSubmit(document.querySelector('[data-panel="reset"]'), "/auth/reset-password");
handleSubmit(document.querySelector('[data-panel="profile"]'), "/users/profile", "PUT", true);
