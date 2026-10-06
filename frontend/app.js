// =============================================================================
// Glycē frontend logic
// Talks to the Spring Boot backend at API_BASE. No build step required —
// open index.html directly or serve the /frontend folder with any static
// file server.
// =============================================================================

const API_BASE = "http://localhost:8080/api";

const state = {
  user: JSON.parse(localStorage.getItem("glyce_user") || "null"),
};

// -----------------------------------------------------------------------------
// Navigation
// -----------------------------------------------------------------------------
const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll("[data-nav]");

function showView(name) {
  views.forEach((v) => v.classList.toggle("is-active", v.id === `view-${name}`));
  document.querySelectorAll(".tab").forEach((t) =>
    t.classList.toggle("is-active", t.dataset.nav === name)
  );

  if (name === "login" || name === "register") {
    showView.lastAuthTab = name;
    document.getElementById("view-auth").classList.add("is-active");
    setAuthTab(name);
    return;
  }

  if (name === "history") renderHistory();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const target = btn.dataset.nav;
    if ((target === "dashboard" || target === "history") && !state.user) {
      showView("login");
      flashMessage("loginMsg", "Sign in first to run or view assessments.", false);
      return;
    }
    showView(target);
  });
});

// -----------------------------------------------------------------------------
// Auth tabs (login / register toggle within the auth card)
// -----------------------------------------------------------------------------
const authTabs = document.querySelectorAll(".auth-tab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

function setAuthTab(which) {
  authTabs.forEach((t) => t.classList.toggle("is-active", t.dataset.authtab === which));
  loginForm.hidden = which !== "login";
  registerForm.hidden = which !== "register";
}

authTabs.forEach((t) =>
  t.addEventListener("click", () => setAuthTab(t.dataset.authtab))
);

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function flashMessage(elId, text, success) {
  const el = document.getElementById(elId);
  el.textContent = text;
  el.classList.toggle("is-success", !!success);
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = { success: false, message: "Unexpected server response." };
  }
  if (!res.ok || payload.success === false) {
    const detail =
      payload && payload.data && typeof payload.data === "object"
        ? Object.values(payload.data).join(" · ")
        : null;
    throw new Error(detail || (payload && payload.message) || "Request failed.");
  }
  return payload.data;
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const payload = await res.json();
  if (!res.ok || payload.success === false) {
    throw new Error((payload && payload.message) || "Request failed.");
  }
  return payload.data;
}

function updateAuthArea() {
  const authArea = document.getElementById("authArea");
  const signedInAs = document.getElementById("signedInAs");
  const signedInEmail = document.getElementById("signedInEmail");

  if (state.user) {
    authArea.innerHTML = `<span class="signed-in-as">Hi, <strong>${escapeHtml(
      state.user.name || state.user.email
    )}</strong></span> <button class="btn btn--ghost" id="topSignOut">Sign out</button>`;
    document.getElementById("topSignOut").addEventListener("click", signOut);
    signedInAs.hidden = false;
    signedInEmail.textContent = state.user.email;
  } else {
    authArea.innerHTML = `
      <button class="btn btn--ghost" data-nav="login">Sign in</button>
      <button class="btn btn--solid" data-nav="register">Create account</button>`;
    authArea.querySelectorAll("[data-nav]").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        showView(btn.dataset.nav);
      })
    );
    signedInAs.hidden = true;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function signOut() {
  state.user = null;
  localStorage.removeItem("glyce_user");
  updateAuthArea();
  showView("landing");
}

document.getElementById("signOutBtn").addEventListener("click", signOut);

// -----------------------------------------------------------------------------
// Register
// -----------------------------------------------------------------------------
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(registerForm);
  const body = {
    name: fd.get("name"),
    email: fd.get("email"),
    password: fd.get("password"),
    age: Number(fd.get("age")),
    gender: fd.get("gender"),
    phone: fd.get("phone") || null,
  };
  flashMessage("registerMsg", "Creating your account…", false);
  try {
    const user = await apiPost("/users/register", body);
    state.user = user;
    localStorage.setItem("glyce_user", JSON.stringify(user));
    flashMessage("registerMsg", "Account created. Welcome!", true);
    updateAuthArea();
    setTimeout(() => showView("dashboard"), 400);
  } catch (err) {
    flashMessage("registerMsg", err.message, false);
  }
});

// -----------------------------------------------------------------------------
// Login
// -----------------------------------------------------------------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(loginForm);
  const body = { email: fd.get("email"), password: fd.get("password") };
  flashMessage("loginMsg", "Signing in…", false);
  try {
    const user = await apiPost("/users/login", body);
    state.user = user;
    localStorage.setItem("glyce_user", JSON.stringify(user));
    flashMessage("loginMsg", "Signed in.", true);
    updateAuthArea();
    setTimeout(() => showView("dashboard"), 300);
  } catch (err) {
    flashMessage("loginMsg", err.message, false);
  }
});

// -----------------------------------------------------------------------------
// Prediction
// -----------------------------------------------------------------------------
const predictForm = document.getElementById("predictForm");

predictForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(predictForm);
  const body = {
    userEmail: state.user ? state.user.email : null,
    glucose: Number(fd.get("glucose")),
    bloodPressure: Number(fd.get("bloodPressure")),
    bmi: Number(fd.get("bmi")),
    age: Number(fd.get("age")),
    insulin: fd.get("insulin") ? Number(fd.get("insulin")) : 0,
    skinThickness: fd.get("skinThickness") ? Number(fd.get("skinThickness")) : 0,
    pregnancies: fd.get("pregnancies") ? Number(fd.get("pregnancies")) : 0,
    diabetesPedigreeFunction: fd.get("diabetesPedigreeFunction")
      ? Number(fd.get("diabetesPedigreeFunction"))
      : 0,
  };
  flashMessage("predictMsg", "Running assessment…", false);
  try {
    const record = await apiPost("/predictions", body);
    flashMessage("predictMsg", "", true);
    renderResult(record);
    showView("result");
  } catch (err) {
    flashMessage("predictMsg", err.message, false);
  }
});

function riskClass(level) {
  return level === "High" ? "high" : level === "Moderate" ? "moderate" : "low";
}

function needlePosition(score) {
  // 6% to 94% across the strip, proportional to score 0-100
  const pct = 6 + (Math.min(100, Math.max(0, score)) / 100) * 88;
  return `${pct}%`;
}

function buildFactorNotes(record) {
  const notes = [];
  if (record.glucose >= 126) notes.push(`Glucose of ${record.glucose} mg/dL is in the diabetic range (≥126).`);
  else if (record.glucose >= 100) notes.push(`Glucose of ${record.glucose} mg/dL is in the prediabetic range (100–125).`);
  else notes.push(`Glucose of ${record.glucose} mg/dL is within the typical range.`);

  if (record.bmi >= 30) notes.push(`BMI of ${record.bmi} falls in the obese range (≥30).`);
  else if (record.bmi >= 25) notes.push(`BMI of ${record.bmi} falls in the overweight range (25–29.9).`);

  if (record.age >= 45) notes.push(`Age (${record.age}) is a contributing risk factor past 45.`);

  if (record.bloodPressure >= 80) notes.push(`Blood pressure of ${record.bloodPressure} mm Hg is elevated.`);

  if (record.insulin > 100) notes.push(`Insulin level of ${record.insulin} mu U/ml is above the typical resting range.`);

  return notes;
}

function renderResult(record) {
  const cls = riskClass(record.riskLevel);
  document.getElementById("resultScore").textContent = Math.round(record.riskScore);
  document.getElementById("resultNeedle").style.left = needlePosition(record.riskScore);

  const chip = document.getElementById("resultLevelChip");
  chip.textContent = `${record.riskLevel} risk`;
  chip.className = `chip is-${cls}`;

  const headline = document.getElementById("resultHeadline");
  const body = document.getElementById("resultBody");

  if (cls === "high") {
    headline.textContent = "Your markers suggest elevated risk.";
    body.textContent = "Several values line up with patterns clinicians associate with type 2 diabetes. This isn't a diagnosis — book a fasting glucose or A1C test with a doctor to confirm.";
  } else if (cls === "moderate") {
    headline.textContent = "Your markers suggest moderate risk.";
    body.textContent = "A few values are trending outside the typical range. Small changes in diet and activity now can meaningfully lower future risk — a check-in with a doctor is still worthwhile.";
  } else {
    headline.textContent = "Your markers look within typical range.";
    body.textContent = "Nothing here stands out against standard risk factors. Keep an eye on it — screening again in six to twelve months is good practice.";
  }

  const factorsEl = document.getElementById("resultFactors");
  factorsEl.innerHTML = "";
  buildFactorNotes(record).forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note;
    factorsEl.appendChild(li);
  });
}

// -----------------------------------------------------------------------------
// History
// -----------------------------------------------------------------------------
async function renderHistory() {
  const emptyMsg = document.getElementById("historyEmptyMsg");
  const table = document.getElementById("historyTable");
  const body = document.getElementById("historyBody");

  if (!state.user) {
    emptyMsg.textContent = "Sign in to see your saved assessments.";
    table.hidden = true;
    return;
  }

  emptyMsg.textContent = "Loading…";
  try {
    const records = await apiGet(`/predictions/history/${encodeURIComponent(state.user.email)}`);
    if (!records || records.length === 0) {
      emptyMsg.textContent = "No assessments yet — run one from the Assessment tab.";
      table.hidden = true;
      return;
    }
    emptyMsg.textContent = "";
    body.innerHTML = "";
    records.forEach((r) => {
      const tr = document.createElement("tr");
      const date = new Date(r.createdAt);
      const cls = riskClass(r.riskLevel);
      tr.innerHTML = `
        <td>${date.toLocaleDateString()}</td>
        <td>${r.glucose}</td>
        <td>${r.bmi}</td>
        <td>${r.bloodPressure}</td>
        <td>${r.age}</td>
        <td>${Math.round(r.riskScore)}</td>
        <td><span class="risk-pill is-${cls}">${r.riskLevel}</span></td>
      `;
      body.appendChild(tr);
    });
    table.hidden = false;
  } catch (err) {
    emptyMsg.textContent = `Couldn't load history: ${err.message}`;
    table.hidden = true;
  }
}

// -----------------------------------------------------------------------------
// Hero readout mini-animation (purely decorative, sample number)
// -----------------------------------------------------------------------------
function animateHeroReadout() {
  const el = document.getElementById("heroReadout");
  const needle = document.getElementById("heroNeedle");
  const target = 104; // sample "typical" glucose value
  let current = 0;
  const step = () => {
    current += Math.max(1, Math.round((target - current) / 6));
    if (current >= target) current = target;
    el.textContent = current;
    if (current < target) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  needle.style.left = needlePosition(24); // sits in the "low" band for the sample
}

// -----------------------------------------------------------------------------
// Init
// -----------------------------------------------------------------------------
updateAuthArea();
showView("landing");
animateHeroReadout();
