// ============================================================
// ตั้งค่าก่อนใช้งานจริง
// 1) Deploy Code.gs เป็น Web App
// 2) นำ Web App URL ที่ลงท้ายด้วย /exec มาใส่ใน API_URL
// 3) ตั้ง TOKEN ให้ตรงกับ TOKEN ใน Code.gs
// ============================================================
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbyofMEquMUwuDVjUm8u05eW_ug6lMWcTZZ3sxn4cNdK0-nBXSej31AwE7_66xKqRkW8Hg/exec",
  TOKEN: "change-this-token"
};

const STORAGE_KEY = "thai-expense-transactions-v6";
const META_KEY = "thai-expense-meta-v6";
const PREFS_KEY = "thai-expense-prefs-v6";
const MAX_RENDERED_MONTH_ITEMS = 250;
const API_TIMEOUT_MS = 20000;

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];
const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const CATEGORIES = {
  income: [
    { name: "เงินเดือน", icon: "💵", color: "#16a34a" },
    { name: "รายได้เสริม", icon: "⚡", color: "#22c55e" },
    { name: "ของขวัญ", icon: "🎁", color: "#84cc16" },
    { name: "อื่นๆ", icon: "●", color: "#64748b" }
  ],
  expense: [
    { name: "อาหาร", icon: "🍜", color: "#f97316" },
    { name: "เดินทาง", icon: "🚆", color: "#22c55e" },
    { name: "บิล", icon: "📄", color: "#3b82f6" },
    { name: "ซื้อของ", icon: "🛒", color: "#8b5cf6" },
    { name: "สุขภาพ", icon: "💗", color: "#ec4899" },
    { name: "งาน", icon: "💼", color: "#f59e0b" },
    { name: "อื่นๆ", icon: "…", color: "#94a3b8" }
  ]
};

const FILTER_TYPES = [
  { value: "all", label: "ทั้งหมด" },
  { value: "expense", label: "รายจ่าย" },
  { value: "income", label: "รายรับ" }
];

const app = document.getElementById("app");
const toastEl = document.getElementById("toast");
const prefs = readJson(PREFS_KEY, {});
const meta = readJson(META_KEY, {});

const state = {
  route: parseRouteFromHash() || "home",
  selectedMonth: getMonthKey(new Date()),
  transactions: [],
  loading: false,
  lastError: "",
  syncStatus: isApiConfigured() ? "idle" : "not_configured",
  lastSyncedAt: meta.lastSyncedAt || "",
  spreadsheetUrl: meta.spreadsheetUrl || "",
  pending: "",
  pendingMessage: "",
  editingId: null,
  form: makeDefaultForm(),
  formDirty: false,
  validationErrors: {},
  filters: {
    type: "all",
    category: "all",
    query: "",
    date: ""
  },
  modal: null,
  pendingRoute: "",
  deleteConfirmId: "",
  connectionTesting: false
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function isApiConfigured() {
  const url = String(CONFIG.API_URL || "").trim();
  return Boolean(url && !url.includes("PASTE_APPS_SCRIPT_WEB_APP_URL_HERE") && /^https?:\/\//i.test(url));
}

function isBlocking() {
  return Boolean(state.pending);
}

function isPending(action) {
  return state.pending === action;
}

async function withPending(action, message, task) {
  if (isBlocking()) return;
  state.pending = action;
  state.pendingMessage = message;
  render();
  try {
    return await task();
  } finally {
    state.pending = "";
    state.pendingMessage = "";
    render();
  }
}

function getDefaultCategory(type) {
  if (type === "income") return prefs.lastIncomeCategory || "เงินเดือน";
  return prefs.lastExpenseCategory || "อาหาร";
}

function rememberCategory(type, category) {
  if (!category) return;
  if (type === "income") prefs.lastIncomeCategory = category;
  else prefs.lastExpenseCategory = category;
  writeJson(PREFS_KEY, prefs);
}

function makeDefaultForm(type = "expense") {
  return {
    type,
    amount: "",
    category: getDefaultCategory(type),
    date: formatDateInput(new Date()),
    note: ""
  };
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  const [year, month, day] = String(value || "").split("-").map(Number);
  return new Date(year || new Date().getFullYear(), (month || 1) - 1, day || 1);
}

function monthTitle(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${THAI_MONTHS[month - 1]} ${year + 543}`;
}

function shortDateTitle(dateValue) {
  const date = parseDate(dateValue);
  const today = formatDateInput(new Date());
  if (dateValue === today) return "วันนี้";
  return `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]}`;
}

function formatThaiDateTime(iso) {
  if (!iso) return "ยังไม่เคยซิงก์";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "ยังไม่เคยซิงก์";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatMoney(value) {
  return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(Math.round(Number(value) || 0));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readLocalTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? normalizeTransactions(data) : [];
  } catch {
    return [];
  }
}

function writeLocalTransactions(transactions) {
  if (!writeJson(STORAGE_KEY, transactions)) {
    showToast("พื้นที่เก็บข้อมูลในเครื่องเต็มหรือถูกปิด", "error");
  }
}

function normalizeTransactions(items) {
  return items
    .filter(Boolean)
    .map(item => ({
      id: String(item.id || createId()),
      type: item.type === "income" ? "income" : "expense",
      amount: Number(item.amount) || 0,
      category: String(item.category || "อื่นๆ"),
      date: String(item.date || formatDateInput(new Date())).slice(0, 10),
      note: String(item.note || ""),
      createdAt: String(item.createdAt || new Date().toISOString()),
      updatedAt: String(item.updatedAt || item.createdAt || new Date().toISOString())
    }))
    .filter(item => item.amount > 0);
}

function monthTransactions() {
  return state.transactions.filter(tx => tx.date.startsWith(state.selectedMonth));
}

function sortTransactions(items) {
  return [...items].sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date);
    if (dateDiff !== 0) return dateDiff;
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
}

function summarize(items) {
  const income = items.filter(tx => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const expense = items.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
  return { income, expense, balance: income - expense };
}

function getCategoryMeta(category, type = "expense") {
  return CATEGORIES[type].find(item => item.name === category) || {
    name: category || "อื่นๆ",
    icon: type === "income" ? "💵" : "●",
    color: "#64748b"
  };
}

function allCategoriesForFilter() {
  const names = new Set();
  CATEGORIES.expense.forEach(item => names.add(item.name));
  CATEGORIES.income.forEach(item => names.add(item.name));
  state.transactions.forEach(tx => names.add(tx.category));
  return Array.from(names).filter(Boolean);
}

function transactionTitle(tx) {
  return tx.note.trim() || tx.category;
}

function transactionMeta(tx, includeDate = false) {
  const pieces = [];
  if (includeDate) pieces.push(shortDateTitle(tx.date));
  pieces.push(tx.category);
  if (tx.note.trim()) pieces.push(tx.note.trim());
  return pieces.join(" · ");
}

function signedAmount(tx) {
  const sign = tx.type === "income" ? "+" : "-";
  return `${sign}${formatMoney(tx.amount)}`;
}

function parseRouteFromHash() {
  const route = String(location.hash || "").replace(/^#\/?/, "").split("?")[0];
  return ["home", "list", "add", "summary", "settings"].includes(route) ? route : "";
}

function updateHash(route) {
  const target = `#/${route}`;
  if (location.hash !== target) history.pushState(null, "", target);
}

function requestRoute(route, options = {}) {
  if (!route || isBlocking()) return;
  if (state.route === "add" && state.formDirty && !options.force && route !== "add") {
    state.modal = "unsaved";
    state.pendingRoute = route;
    render();
    return;
  }
  setRoute(route, options);
}

function setRoute(route, options = {}) {
  state.route = route;
  state.lastError = options.keepError ? state.lastError : "";
  state.modal = null;
  state.pendingRoute = "";

  if (route === "add" && !state.editingId && !options.keepForm) {
    state.form = makeDefaultForm();
    state.formDirty = false;
    state.validationErrors = {};
  }

  if (route !== "add") {
    state.editingId = null;
    state.validationErrors = {};
  }

  if (!options.silentHash) updateHash(route);
  render();
}

function changeMonth(offset) {
  if (isBlocking()) return;
  const [year, month] = state.selectedMonth.split("-").map(Number);
  const next = new Date(year, month - 1 + offset, 1);
  state.selectedMonth = getMonthKey(next);
  render();
}

function markSynced(metaPayload = {}) {
  state.syncStatus = "synced";
  state.lastSyncedAt = new Date().toISOString();
  if (metaPayload.spreadsheetUrl) state.spreadsheetUrl = metaPayload.spreadsheetUrl;
  if (metaPayload.spreadsheetId) state.spreadsheetId = metaPayload.spreadsheetId;
  writeJson(META_KEY, {
    lastSyncedAt: state.lastSyncedAt,
    spreadsheetUrl: state.spreadsheetUrl || "",
    spreadsheetId: state.spreadsheetId || ""
  });
}

async function loadData() {
  state.loading = true;
  state.lastError = "";
  state.transactions = readLocalTransactions();
  state.syncStatus = isApiConfigured() ? "syncing" : "not_configured";
  render();

  if (!isApiConfigured()) {
    state.loading = false;
    render();
    return;
  }

  try {
    const result = await apiRequest("list");
    const items = result.data || result.transactions || [];
    state.transactions = normalizeTransactions(items);
    writeLocalTransactions(state.transactions);
    markSynced(result.meta || {});
  } catch (error) {
    state.lastError = `เชื่อมต่อ Google Sheet ไม่สำเร็จ: ${error.message}`;
    state.syncStatus = "error";
  } finally {
    state.loading = false;
    render();
  }
}

function apiRequest(action, payload = {}) {
  if (!isApiConfigured()) {
    return Promise.reject(new Error("ยังไม่ได้ใส่ Apps Script URL ใน script.js"));
  }

  return new Promise((resolve, reject) => {
    const callbackName = `thaiExpenseCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const url = new URL(CONFIG.API_URL.trim());
    url.searchParams.set("action", action);
    url.searchParams.set("token", CONFIG.TOKEN || "");
    url.searchParams.set("payload", JSON.stringify(payload));
    url.searchParams.set("callback", callbackName);
    url.searchParams.set("_", String(Date.now()));

    const script = document.createElement("script");
    let settled = false;

    const cleanup = () => {
      delete window[callbackName];
      script.remove();
      clearTimeout(timer);
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("หมดเวลาการเชื่อมต่อ Apps Script"));
    }, API_TIMEOUT_MS);

    window[callbackName] = json => {
      if (settled) return;
      settled = true;
      cleanup();
      if (!json || json.ok === false) {
        reject(new Error(json?.error || "Apps Script ส่งคำตอบไม่สำเร็จ"));
        return;
      }
      resolve(json);
    };

    script.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("โหลด Apps Script ไม่สำเร็จ โปรดตรวจสอบ Web App URL"));
    };

    script.src = url.toString();
    document.body.appendChild(script);
  });
}

function render() {
  updateNav();
  if (state.route === "home") app.innerHTML = renderHome();
  if (state.route === "list") app.innerHTML = renderList();
  if (state.route === "add") app.innerHTML = renderAdd();
  if (state.route === "summary") app.innerHTML = renderSummary();
  if (state.route === "settings") app.innerHTML = renderSettings();

  if (state.pending) app.insertAdjacentHTML("beforeend", renderBusyBanner());
  if (state.modal) app.insertAdjacentHTML("beforeend", renderModal());
}

function updateNav() {
  document.querySelectorAll(".nav-button").forEach(button => {
    const active = button.dataset.route === state.route;
    button.classList.toggle("active", active);
    button.disabled = isBlocking() && button.dataset.route !== state.route;
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

function disabledAttr() {
  return isBlocking() ? "disabled" : "";
}

function loadingClass(action) {
  return isPending(action) ? "is-loading" : "";
}

function syncText() {
  if (!isApiConfigured()) return "ใช้ข้อมูลในเครื่อง";
  if (state.syncStatus === "syncing") return "กำลังซิงก์";
  if (state.syncStatus === "error") return "ซิงก์ไม่สำเร็จ";
  if (state.syncStatus === "synced") return `ซิงก์แล้ว ${formatThaiDateTime(state.lastSyncedAt)}`;
  return state.lastSyncedAt ? `ซิงก์ล่าสุด ${formatThaiDateTime(state.lastSyncedAt)}` : "รอซิงก์";
}

function renderSyncBadge() {
  const statusClass = state.syncStatus === "error" ? "error" : state.syncStatus === "synced" ? "success" : "";
  return `<button class="sync-badge ${statusClass}" type="button" data-action="reload" ${isBlocking() ? "disabled" : ""}>${state.loading ? "กำลังโหลด" : escapeHtml(syncText())}</button>`;
}

function renderBusyBanner() {
  return `
    <div class="busy-banner" role="status" aria-live="assertive">
      <span class="busy-spinner"></span>
      <span>${escapeHtml(state.pendingMessage || "กำลังทำงาน")}</span>
    </div>
  `;
}

function renderHome() {
  const items = monthTransactions();
  const summary = summarize(items);
  const today = formatDateInput(new Date());
  const todaySpent = state.transactions
    .filter(tx => tx.type === "expense" && tx.date === today)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const latest = sortTransactions(state.transactions).slice(0, 5);

  return `
    <section class="screen">
      <header class="topbar">
        <div class="topbar-title-wrap">
          <h1 class="page-title">หน้าแรก</h1>
          <button class="month-pill" type="button" data-action="go-list" ${disabledAttr()}>${monthTitle(state.selectedMonth)}⌄</button>
          ${renderSyncBadge()}
        </div>
        <button class="icon-button ${state.loading ? "is-loading" : ""}" type="button" data-action="reload" aria-label="โหลดใหม่" ${isBlocking() ? "disabled" : ""}>↻</button>
      </header>

      ${renderNotice()}

      <section class="card balance-card">
        <p class="balance-label">คงเหลือเดือนนี้</p>
        <div class="balance-value ${summary.balance < 0 ? "negative" : ""}">
          <strong>${formatMoney(summary.balance)}</strong>
          <span>บาท</span>
        </div>
        <div class="balance-split">
          <div class="text-green">รับเข้า <strong>${formatMoney(summary.income)}</strong></div>
          <div class="divider"></div>
          <div class="text-red">ใช้ไป <strong>${formatMoney(summary.expense)}</strong></div>
        </div>
      </section>

      <button class="card quick-card" type="button" data-action="filter-today" ${disabledAttr()}>
        <span class="quick-left">
          <span class="quick-icon">💳</span>
          <span>
            <span class="quick-title">วันนี้ใช้ไป</span>
            <span class="quick-value">${formatMoney(todaySpent)} <span class="small text-blue">บาท</span></span>
          </span>
        </span>
        <span class="muted">ดูรายการวันนี้ ›</span>
      </button>

      <button class="primary-button full-width" type="button" data-route="add" ${disabledAttr()}>＋ เพิ่มรายการ</button>

      <div class="section-head">
        <h2 class="section-title">รายการล่าสุด</h2>
        <button class="link-button" type="button" data-route="list" ${disabledAttr()}>ดูทั้งหมด</button>
      </div>
      ${latest.length ? `<div class="transaction-list">${latest.map(tx => renderTransactionCard(tx, true)).join("")}</div>` : renderEmpty("ยังไม่มีรายการ", "เริ่มจากการกดปุ่มเพิ่มรายการเพื่อบันทึกรายรับรายจ่ายแรกของคุณ", "🧾", true)}
    </section>
  `;
}

function renderNotice() {
  if (state.loading) return renderLoading("กำลังโหลดข้อมูล", "กำลังดึงรายการล่าสุดจาก Google Sheet");

  if (state.lastError) {
    return `
      <section class="card notice-card error">
        <div>
          <strong>พบปัญหาการเชื่อมต่อ</strong>
          <div class="muted small">${escapeHtml(state.lastError)}</div>
          <div class="muted small">ตอนนี้ระบบแสดงข้อมูลสำรองในเครื่องนี้ก่อน</div>
          <button class="mini-button" type="button" data-action="reload">ลองโหลดใหม่</button>
        </div>
      </section>
    `;
  }

  if (!isApiConfigured()) {
    return `
      <section class="card notice-card">
        <div>
          <strong>ยังไม่ได้ฝัง Apps Script URL</strong>
          <div class="muted small">แก้ค่า CONFIG.API_URL และ CONFIG.TOKEN ในไฟล์ script.js แล้ว push ขึ้น GitHub</div>
          <div class="muted small">ระหว่างนี้ระบบจะเก็บข้อมูลในเครื่องนี้ก่อน</div>
          <button class="mini-button" type="button" data-route="settings">ดูสถานะการเชื่อมต่อ</button>
        </div>
      </section>
    `;
  }

  return "";
}

function renderAdd() {
  const isEdit = Boolean(state.editingId);
  const form = state.form;
  const categories = CATEGORIES[form.type];
  const amount = normalizeAmount(form.amount);
  const canSave = amount > 0 && Boolean(form.date) && !isBlocking();

  return `
    <section class="screen add-screen">
      <header class="topbar center">
        <button class="link-button" type="button" data-action="cancel-form" ${disabledAttr()}>ยกเลิก</button>
        <h1 class="page-title">${isEdit ? "แก้ไขรายการ" : "เพิ่มรายการ"}</h1>
        <button class="link-button muted" type="button" data-action="reset-form" ${isEdit || isBlocking() ? "disabled" : ""}>ล้าง</button>
      </header>

      <div class="segmented" role="group" aria-label="ประเภท">
        <button type="button" class="${form.type === "expense" ? "active expense" : ""}" data-type="expense" aria-pressed="${form.type === "expense"}" ${disabledAttr()}>รายจ่าย</button>
        <button type="button" class="${form.type === "income" ? "active income" : ""}" data-type="income" aria-pressed="${form.type === "income"}" ${disabledAttr()}>รายรับ</button>
      </div>

      <section class="card amount-card">
        <label for="amountInput">จำนวนเงิน</label>
        <div class="amount-input-wrap ${state.validationErrors.amount ? "invalid" : ""}">
          <span class="currency-symbol" aria-hidden="true">฿</span>
          <input id="amountInput" class="amount-input" data-form="amount" value="${escapeHtml(form.amount)}" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="จำนวนเงิน บาท" aria-describedby="amountHelp" aria-invalid="${state.validationErrors.amount ? "true" : "false"}" ${disabledAttr()}>
        </div>
        <div id="amountHelp" class="field-help ${state.validationErrors.amount ? "error" : ""}">${escapeHtml(state.validationErrors.amount || "ใส่เฉพาะตัวเลข เช่น 120 หรือ 120.50")}</div>
      </section>

      <section class="form-section">
        <span class="form-label">หมวดหมู่</span>
        <div class="category-grid">
          ${categories.map(category => `
            <button class="category-card ${form.category === category.name ? `active ${form.type}` : ""}" type="button" data-category="${escapeHtml(category.name)}" aria-pressed="${form.category === category.name}" ${disabledAttr()}>
              <span class="category-icon">${category.icon}</span>
              <span>${category.name}</span>
            </button>
          `).join("")}
        </div>
      </section>

      <label class="field">
        <span>วันที่</span>
        <input type="date" data-form="date" value="${escapeHtml(form.date)}" aria-describedby="dateHelp" aria-invalid="${state.validationErrors.date ? "true" : "false"}" ${disabledAttr()}>
        <small id="dateHelp" class="field-help ${state.validationErrors.date ? "error" : ""}">${escapeHtml(state.validationErrors.date || "ใช้รูปแบบวันที่ตามเครื่องของคุณ")}</small>
      </label>

      <label class="field">
        <span>บันทึกเพิ่มเติม <span class="optional">ไม่บังคับ</span></span>
        <textarea data-form="note" maxlength="120" placeholder="เช่น กาแฟ, ข้าวกลางวัน, เงินเดือน" ${disabledAttr()}>${escapeHtml(form.note)}</textarea>
      </label>

      <div class="form-actions form-actions-inline">
        <button class="primary-button ${loadingClass("save")}" type="button" data-action="save-transaction" ${!canSave ? "disabled" : ""}>${isPending("save") ? "กำลังบันทึก" : "บันทึก"}</button>
        ${isEdit ? `<button class="danger-button" type="button" data-action="request-delete" ${disabledAttr()}>ลบรายการนี้</button>` : ""}
      </div>

      <div class="sticky-save-bar">
        <button class="primary-button sticky-save ${loadingClass("save")}" type="button" data-action="save-transaction" ${!canSave ? "disabled" : ""}>${isPending("save") ? "กำลังบันทึก" : amount > 0 ? `บันทึก ฿${formatMoney(amount)}` : "ใส่จำนวนเงินก่อนบันทึก"}</button>
      </div>
    </section>
  `;
}

function renderList() {
  const allMonthItems = sortTransactions(monthTransactions());
  const filtered = applyFilters(allMonthItems);
  const items = filtered.slice(0, MAX_RENDERED_MONTH_ITEMS);
  const hasHiddenItems = filtered.length > items.length;
  const summary = summarize(allMonthItems);
  const filteredSummary = summarize(filtered);
  const groups = groupByDate(items);

  return `
    <section class="screen">
      <header class="topbar center">
        <span></span>
        <h1 class="page-title">รายการ</h1>
        <button class="icon-button ${state.loading ? "is-loading" : ""}" type="button" data-action="reload" aria-label="โหลดใหม่" ${isBlocking() ? "disabled" : ""}>↻</button>
      </header>

      ${renderMonthSwitcher()}
      ${renderSyncLine()}
      ${renderNotice()}

      <section class="card month-summary-card">
        <div class="summary-item">
          <span>รับเข้า</span>
          <strong class="text-green">${formatMoney(summary.income)}</strong>
        </div>
        <div class="v-divider"></div>
        <div class="summary-item">
          <span>ใช้ไป</span>
          <strong class="text-red">${formatMoney(summary.expense)}</strong>
        </div>
      </section>

      ${renderFilters()}

      ${filtered.length !== allMonthItems.length ? `
        <section class="filter-summary">
          <span>ผลลัพธ์ ${formatMoney(filtered.length)} รายการ</span>
          <strong class="${filteredSummary.balance >= 0 ? "text-green" : "text-red"}">สุทธิ ${filteredSummary.balance >= 0 ? "+" : "-"}${formatMoney(Math.abs(filteredSummary.balance))}</strong>
        </section>
      ` : ""}

      ${items.length ? Object.entries(groups).map(([date, txs]) => renderDayGroup(date, txs)).join("") : renderEmpty("ไม่พบรายการ", "ลองเปลี่ยนตัวกรอง หรือเพิ่มรายการแรกของเดือนนี้", "🔎", true)}
      ${hasHiddenItems ? renderListLimitNotice(filtered.length, items.length) : ""}
    </section>
  `;
}

function renderSummary() {
  const items = monthTransactions();
  const summary = summarize(items);
  const expenseItems = items.filter(tx => tx.type === "expense");
  const byCategory = summarizeExpenseByCategory(expenseItems);
  const top = byCategory[0];
  const insights = buildInsights(items, summary, byCategory);

  return `
    <section class="screen">
      <header class="topbar center">
        <span></span>
        <h1 class="page-title">สรุป</h1>
        <button class="icon-button ${state.loading ? "is-loading" : ""}" type="button" data-action="reload" aria-label="โหลดใหม่" ${isBlocking() ? "disabled" : ""}>↻</button>
      </header>

      ${renderMonthSwitcher()}
      ${renderSyncLine()}
      ${renderNotice()}

      <div class="summary-grid">
        <section class="card stat-card">
          <span>รายรับรวม</span>
          <strong class="text-green">${formatMoney(summary.income)}</strong>
        </section>
        <section class="card stat-card">
          <span>รายจ่ายรวม</span>
          <strong class="text-red">${formatMoney(summary.expense)}</strong>
        </section>
        <section class="card stat-card">
          <span>คงเหลือ</span>
          <strong class="text-blue">${formatMoney(summary.balance)}</strong>
        </section>
      </div>

      <section class="card big-spent-card">
        <div class="muted">ใช้ไปทั้งหมด</div>
        <strong class="big-number">${formatMoney(summary.expense)}</strong>
        <div class="text-red">บาท</div>
      </section>

      <section class="card chart-card">
        <h2 class="section-title">รายจ่ายตามหมวดหมู่</h2>
        ${byCategory.length ? `
          <div class="chart-layout">
            <div class="donut" style="background:${makeDonutGradient(byCategory)}" aria-label="กราฟรายจ่ายตามหมวดหมู่"></div>
            <div class="legend-list">
              ${byCategory.map(row => renderLegendRow(row, summary.expense)).join("")}
            </div>
          </div>
        ` : renderEmpty("ยังไม่มีรายจ่าย", "เมื่อมีรายจ่าย ระบบจะแสดงกราฟแยกตามหมวดหมู่", "📊")}
      </section>

      ${insights.length ? `
        <section class="card insight-card">
          <h2 class="section-title">ข้อสังเกตเดือนนี้</h2>
          <div class="insight-list">${insights.map(item => `<div class="insight-item">${escapeHtml(item)}</div>`).join("")}</div>
        </section>
      ` : ""}

      ${top ? `
        <section class="card top-category-card">
          <span class="star">★</span>
          <strong>หมวดที่ใช้เยอะสุด:</strong>
          <span>${escapeHtml(top.category)}</span>
        </section>
      ` : ""}
    </section>
  `;
}

function renderSettings() {
  const configured = isApiConfigured();
  const localCount = state.transactions.length;
  return `
    <section class="screen">
      <header class="topbar center">
        <span></span>
        <h1 class="page-title">ตั้งค่า</h1>
        <span></span>
      </header>

      <section class="card settings-card">
        <h2 class="section-title">สถานะการเชื่อมต่อ</h2>
        <div class="settings-row">
          <span>Apps Script URL</span>
          <strong class="${configured ? "text-green" : "text-red"}">${configured ? "ตั้งค่าแล้ว" : "ยังไม่ได้ตั้งค่า"}</strong>
        </div>
        <div class="settings-row">
          <span>Token</span>
          <strong>${CONFIG.TOKEN && CONFIG.TOKEN !== "change-this-token" ? "ตั้งค่าแล้ว" : "ยังเป็นค่าเริ่มต้น"}</strong>
        </div>
        <div class="settings-row">
          <span>ซิงก์ล่าสุด</span>
          <strong>${escapeHtml(formatThaiDateTime(state.lastSyncedAt))}</strong>
        </div>
        <div class="settings-row">
          <span>ข้อมูลในเครื่อง</span>
          <strong>${formatMoney(localCount)} รายการ</strong>
        </div>
        ${state.spreadsheetUrl ? `<a class="secondary-button settings-link" href="${escapeHtml(state.spreadsheetUrl)}" target="_blank" rel="noopener">เปิด Google Sheet</a>` : ""}
        <button class="primary-button ${state.connectionTesting ? "is-loading" : ""}" type="button" data-action="test-connection" ${!configured || state.connectionTesting ? "disabled" : ""}>ทดสอบการเชื่อมต่อ</button>
        <button class="secondary-button" type="button" data-action="reload" ${isBlocking() ? "disabled" : ""}>ซิงก์ข้อมูลใหม่</button>
      </section>

      <section class="card settings-card">
        <h2 class="section-title">เกี่ยวกับแอป</h2>
        <p class="muted small">เวอร์ชันนี้ไม่มี OCR/AI และไม่ใช้ API Key ภายนอก ข้อมูลหลักเก็บใน Google Sheet ผ่าน Apps Script ส่วน localStorage ใช้เป็นข้อมูลสำรองในเครื่อง</p>
        <div class="settings-row">
          <span>Storage key</span>
          <strong>${escapeHtml(STORAGE_KEY)}</strong>
        </div>
        <div class="settings-row">
          <span>รายการต่อเดือนที่แสดงสูงสุด</span>
          <strong>${formatMoney(MAX_RENDERED_MONTH_ITEMS)}</strong>
        </div>
      </section>
    </section>
  `;
}

function renderMonthSwitcher() {
  return `
    <div class="month-switcher">
      <button class="month-nav-button" type="button" data-action="prev-month" aria-label="เดือนก่อนหน้า" ${disabledAttr()}>‹</button>
      <strong>${monthTitle(state.selectedMonth)}</strong>
      <button class="month-nav-button" type="button" data-action="next-month" aria-label="เดือนถัดไป" ${disabledAttr()}>›</button>
    </div>
  `;
}

function renderSyncLine() {
  return `<div class="sync-line">${renderSyncBadge()}</div>`;
}

function renderFilters() {
  const active = hasActiveFilters();
  return `
    <section class="filter-panel" aria-label="ตัวกรองรายการ">
      <div class="filter-chips">
        ${FILTER_TYPES.map(item => `<button class="filter-chip ${state.filters.type === item.value ? "active" : ""}" type="button" data-filter-type="${item.value}" aria-pressed="${state.filters.type === item.value}">${item.label}</button>`).join("")}
      </div>
      <label class="search-field">
        <span class="sr-only">ค้นหารายการ</span>
        <input type="search" value="${escapeHtml(state.filters.query)}" data-filter="query" placeholder="ค้นหาโน้ตหรือหมวดหมู่">
      </label>
      <div class="filter-row">
        <select data-filter="category" aria-label="กรองตามหมวดหมู่">
          <option value="all">ทุกหมวดหมู่</option>
          ${allCategoriesForFilter().map(category => `<option value="${escapeHtml(category)}" ${state.filters.category === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
        </select>
        <input type="date" data-filter="date" value="${escapeHtml(state.filters.date)}" aria-label="กรองตามวันที่">
      </div>
      ${active ? `<button class="link-button clear-filter" type="button" data-action="clear-filters">ล้างตัวกรอง</button>` : ""}
    </section>
  `;
}

function hasActiveFilters() {
  return state.filters.type !== "all" || state.filters.category !== "all" || Boolean(state.filters.query.trim()) || Boolean(state.filters.date);
}

function applyFilters(items) {
  const query = state.filters.query.trim().toLowerCase();
  return items.filter(tx => {
    if (state.filters.type !== "all" && tx.type !== state.filters.type) return false;
    if (state.filters.category !== "all" && tx.category !== state.filters.category) return false;
    if (state.filters.date && tx.date !== state.filters.date) return false;
    if (query) {
      const haystack = `${tx.category} ${tx.note} ${tx.amount} ${tx.date}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function renderTransactionCard(tx, includeDate = false) {
  const meta = getCategoryMeta(tx.category, tx.type);
  const label = `${tx.type === "income" ? "รายรับ" : "รายจ่าย"} ${transactionTitle(tx)} ${signedAmount(tx)} บาท แตะเพื่อแก้ไข`;
  return `
    <button class="transaction-card" type="button" data-edit-id="${escapeHtml(tx.id)}" aria-label="${escapeHtml(label)}" ${disabledAttr()}>
      <span class="tx-icon ${tx.type}">${meta.icon}</span>
      <span class="tx-main">
        <span class="tx-title">${escapeHtml(transactionTitle(tx))}</span>
        <span class="tx-meta">${escapeHtml(transactionMeta(tx, includeDate))}</span>
      </span>
      <span class="tx-right">
        <span class="tx-amount ${tx.type === "income" ? "text-green" : "text-red"}">${signedAmount(tx)}</span>
        <span class="tx-chevron" aria-hidden="true">›</span>
      </span>
    </button>
  `;
}

function renderDayGroup(date, txs) {
  const daySummary = summarize(txs);
  const dayTotal = daySummary.income - daySummary.expense;
  const totalClass = dayTotal >= 0 ? "text-green" : "text-red";
  const sign = dayTotal >= 0 ? "+" : "-";
  return `
    <section class="day-group">
      <div class="day-head">
        <span>${shortDateTitle(date)}</span>
        <span class="${totalClass}">สุทธิ ${sign}${formatMoney(Math.abs(dayTotal))}</span>
      </div>
      <div class="transaction-list">
        ${txs.map(tx => renderTransactionCard(tx)).join("")}
      </div>
    </section>
  `;
}

function renderListLimitNotice(total, shown) {
  return `
    <section class="card notice-card compact">
      <div>
        <strong>แสดง ${formatMoney(shown)} จาก ${formatMoney(total)} รายการ</strong>
        <div class="muted small">ระบบจำกัดจำนวนรายการที่แสดงพร้อมกันเพื่อให้มือถือทำงานลื่นขึ้น ยอดสรุปยังคำนวณจากรายการทั้งหมด</div>
      </div>
    </section>
  `;
}

function groupByDate(items) {
  return items.reduce((groups, tx) => {
    groups[tx.date] = groups[tx.date] || [];
    groups[tx.date].push(tx);
    return groups;
  }, {});
}

function summarizeExpenseByCategory(expenseItems) {
  const map = new Map();
  expenseItems.forEach(tx => {
    map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
  });
  return Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      color: getCategoryMeta(category, "expense").color
    }))
    .sort((a, b) => b.amount - a.amount);
}

function makeDonutGradient(rows) {
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  if (!total) return "#e2e8f0";
  let current = 0;
  const parts = rows.map(row => {
    const start = current;
    const end = current + (row.amount / total) * 100;
    current = end;
    return `${row.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });
  return `conic-gradient(${parts.join(", ")})`;
}

function renderLegendRow(row, total) {
  const percent = total ? Math.round((row.amount / total) * 100) : 0;
  return `
    <div class="legend-row">
      <span class="legend-dot" style="background:${row.color}"></span>
      <span class="legend-name">${escapeHtml(row.category)}</span>
      <span>${formatMoney(row.amount)} บาท · ${percent}%</span>
    </div>
  `;
}

function buildInsights(items, summary, byCategory) {
  const insights = [];
  const top = byCategory[0];
  if (top && summary.expense) {
    const percent = Math.round((top.amount / summary.expense) * 100);
    insights.push(`${top.category} เป็นหมวดที่ใช้เยอะสุด คิดเป็น ${percent}% ของรายจ่ายเดือนนี้`);
  }
  const today = formatDateInput(new Date());
  const todaySpent = items.filter(tx => tx.type === "expense" && tx.date === today).reduce((sum, tx) => sum + tx.amount, 0);
  if (todaySpent) insights.push(`วันนี้ใช้ไป ${formatMoney(todaySpent)} บาท`);
  if (summary.balance < 0) insights.push("เดือนนี้รายจ่ายมากกว่ารายรับ ควรตรวจรายการใหญ่เป็นพิเศษ");
  if (!insights.length && items.length) insights.push("เดือนนี้ยังมีข้อมูลไม่มากพอสำหรับข้อสังเกตเพิ่มเติม");
  return insights.slice(0, 3);
}

function renderEmpty(title, detail, emoji, showAction = false) {
  return `
    <section class="empty-state">
      <span class="emoji">${emoji}</span>
      <strong>${escapeHtml(title)}</strong>
      <div class="muted small">${escapeHtml(detail)}</div>
      ${showAction ? `<button class="secondary-button empty-action" type="button" data-route="add">เพิ่มรายการ</button>` : ""}
    </section>
  `;
}

function renderLoading(title, detail) {
  return `
    <section class="loading-state">
      <span class="emoji">⏳</span>
      <strong>${escapeHtml(title)}</strong>
      <div class="muted small">${escapeHtml(detail)}</div>
    </section>
  `;
}

function renderModal() {
  if (state.modal === "delete") return renderDeleteModal();
  if (state.modal === "unsaved") return renderUnsavedModal();
  return "";
}

function renderDeleteModal() {
  const tx = state.transactions.find(item => item.id === state.deleteConfirmId);
  if (!tx) return "";
  return `
    <div class="modal-backdrop" role="presentation" data-action="close-modal">
      <section class="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="deleteTitle" data-modal-panel>
        <div class="sheet-handle"></div>
        <h2 id="deleteTitle">ลบรายการนี้?</h2>
        <p class="muted">${escapeHtml(transactionTitle(tx))} · ${formatMoney(tx.amount)} บาท · ${shortDateTitle(tx.date)}</p>
        <div class="sheet-actions">
          <button class="secondary-button" type="button" data-action="close-modal">ยกเลิก</button>
          <button class="danger-button ${loadingClass("delete")}" type="button" data-action="confirm-delete" ${disabledAttr()}>ลบรายการ</button>
        </div>
      </section>
    </div>
  `;
}

function renderUnsavedModal() {
  return `
    <div class="modal-backdrop" role="presentation" data-action="close-modal">
      <section class="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="unsavedTitle" data-modal-panel>
        <div class="sheet-handle"></div>
        <h2 id="unsavedTitle">ยังไม่ได้บันทึก</h2>
        <p class="muted">คุณมีข้อมูลที่กรอกค้างไว้ ต้องการออกจากหน้านี้โดยไม่บันทึกไหม?</p>
        <div class="sheet-actions">
          <button class="secondary-button" type="button" data-action="close-modal">กลับไปแก้ต่อ</button>
          <button class="danger-button" type="button" data-action="discard-form">ออกโดยไม่บันทึก</button>
        </div>
      </section>
    </div>
  `;
}

function normalizeAmount(value) {
  const cleaned = String(value || "").replace(/,/g, "").trim();
  return Number(cleaned);
}

function validateForm() {
  const errors = {};
  const amount = normalizeAmount(state.form.amount);
  if (!amount || amount <= 0) errors.amount = "กรุณาใส่จำนวนเงินมากกว่า 0";
  if (!state.form.date) errors.date = "กรุณาเลือกวันที่";
  state.validationErrors = errors;
  return Object.keys(errors).length === 0;
}

function startEdit(id) {
  if (isBlocking()) return;
  const tx = state.transactions.find(item => item.id === id);
  if (!tx) return;
  state.editingId = id;
  state.form = {
    type: tx.type,
    amount: String(tx.amount),
    category: tx.category,
    date: tx.date,
    note: tx.note
  };
  state.formDirty = false;
  state.validationErrors = {};
  setRoute("add", { keepForm: true });
}

function cancelForm() {
  if (isBlocking()) return;
  if (state.formDirty) {
    state.modal = "unsaved";
    state.pendingRoute = "home";
    render();
    return;
  }
  discardFormAndRoute("home");
}

function discardFormAndRoute(route) {
  state.editingId = null;
  state.form = makeDefaultForm();
  state.formDirty = false;
  state.validationErrors = {};
  setRoute(route || "home", { force: true });
}

async function saveTransaction() {
  if (isBlocking()) return;
  const valid = validateForm();
  if (!valid) {
    render();
    showToast("กรุณาตรวจข้อมูลที่กรอก", "error");
    return;
  }

  await withPending("save", "กำลังบันทึกรายการ", async () => {
    const amount = normalizeAmount(state.form.amount);
    const now = new Date().toISOString();
    const current = state.transactions.find(tx => tx.id === state.editingId);
    const transaction = {
      id: state.editingId || createId(),
      type: state.form.type,
      amount,
      category: state.form.category || "อื่นๆ",
      date: state.form.date,
      note: state.form.note.trim(),
      createdAt: current?.createdAt || now,
      updatedAt: now
    };

    try {
      if (isApiConfigured()) {
        const result = await apiRequest(state.editingId ? "update" : "create", { transaction });
        const saved = normalizeTransactions([result.data || transaction])[0] || transaction;
        if (state.editingId) {
          state.transactions = state.transactions.map(tx => tx.id === state.editingId ? saved : tx);
        } else {
          state.transactions = [saved, ...state.transactions];
        }
        markSynced(result.meta || {});
      } else {
        if (state.editingId) {
          state.transactions = state.transactions.map(tx => tx.id === state.editingId ? transaction : tx);
        } else {
          state.transactions = [transaction, ...state.transactions];
        }
        state.syncStatus = "not_configured";
      }

      writeLocalTransactions(state.transactions);
      rememberCategory(transaction.type, transaction.category);
      state.selectedMonth = transaction.date.slice(0, 7);
      state.editingId = null;
      state.form = makeDefaultForm(transaction.type);
      state.formDirty = false;
      state.validationErrors = {};
      state.route = "home";
      updateHash("home");
      showToast("บันทึกสำเร็จ", "success");
    } catch (error) {
      showToast(`บันทึกไม่สำเร็จ: ${error.message}`, "error");
    }
  });
}

async function deleteTransaction() {
  if (isBlocking() || !state.deleteConfirmId) return;

  await withPending("delete", "กำลังลบรายการ", async () => {
    try {
      const deletingId = state.deleteConfirmId;
      if (isApiConfigured()) {
        const result = await apiRequest("delete", { id: deletingId });
        markSynced(result.meta || {});
      } else {
        state.syncStatus = "not_configured";
      }
      state.transactions = state.transactions.filter(tx => tx.id !== deletingId);
      writeLocalTransactions(state.transactions);
      state.editingId = null;
      state.deleteConfirmId = "";
      state.modal = null;
      state.form = makeDefaultForm();
      state.formDirty = false;
      state.validationErrors = {};
      state.route = "list";
      updateHash("list");
      showToast("ลบรายการแล้ว", "success");
    } catch (error) {
      showToast(`ลบไม่สำเร็จ: ${error.message}`, "error");
    }
  });
}

async function testConnection() {
  if (!isApiConfigured() || state.connectionTesting) return;
  state.connectionTesting = true;
  render();
  try {
    const result = await apiRequest("ping");
    markSynced(result.meta || result);
    showToast("เชื่อมต่อ Google Sheet สำเร็จ", "success");
  } catch (error) {
    state.syncStatus = "error";
    state.lastError = `ทดสอบการเชื่อมต่อไม่สำเร็จ: ${error.message}`;
    showToast(state.lastError, "error");
  } finally {
    state.connectionTesting = false;
    render();
  }
}

function showToast(message, type = "") {
  toastEl.textContent = message;
  toastEl.className = `toast ${type}`.trim();
  toastEl.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toastEl.hidden = true;
  }, 3200);
}

function clearFilters() {
  state.filters = { type: "all", category: "all", query: "", date: "" };
}

function applyTodayFilter() {
  const today = formatDateInput(new Date());
  state.selectedMonth = today.slice(0, 7);
  state.filters.type = "expense";
  state.filters.date = today;
  state.filters.category = "all";
  state.filters.query = "";
  requestRoute("list", { force: true });
}

let filterRenderTimer = 0;
function scheduleFilterRender() {
  clearTimeout(filterRenderTimer);
  filterRenderTimer = setTimeout(render, 160);
}

function handleFilterInput(input) {
  const key = input.dataset.filter;
  if (!key) return;
  state.filters[key] = input.value;
  if (key === "query") scheduleFilterRender();
  else render();
}

function updateSaveButtons() {
  if (state.route !== "add") return;
  const amount = normalizeAmount(state.form.amount);
  const canSave = amount > 0 && Boolean(state.form.date) && !isBlocking();
  document.querySelectorAll('[data-action="save-transaction"]').forEach(button => {
    button.disabled = !canSave;
    if (button.classList.contains("sticky-save")) {
      button.textContent = amount > 0 ? `บันทึก ฿${formatMoney(amount)}` : "ใส่จำนวนเงินก่อนบันทึก";
    }
  });
}

function handleFormInput(input) {
  const key = input.dataset.form;
  if (!key || isBlocking()) return;
  state.form[key] = input.value;
  state.formDirty = true;
  if (state.validationErrors[key]) {
    validateForm();
    render();
    return;
  }
  updateSaveButtons();
}

function handleTypeChange(type) {
  if (isBlocking()) return;
  state.form.type = type;
  state.form.category = getDefaultCategory(type);
  state.formDirty = true;
  render();
}

function handleCategoryChange(category) {
  if (isBlocking()) return;
  state.form.category = category;
  state.formDirty = true;
  render();
}

function closeModal() {
  state.modal = null;
  state.deleteConfirmId = "";
  state.pendingRoute = "";
  render();
}

function handleAction(action) {
  if (action === "prev-month") changeMonth(-1);
  if (action === "next-month") changeMonth(1);
  if (action === "go-list") requestRoute("list");
  if (action === "reload") loadData();
  if (action === "cancel-form") cancelForm();
  if (action === "reset-form") {
    state.form = makeDefaultForm(state.form.type);
    state.formDirty = false;
    state.validationErrors = {};
    render();
  }
  if (action === "save-transaction") saveTransaction();
  if (action === "request-delete") {
    if (state.editingId) {
      state.deleteConfirmId = state.editingId;
      state.modal = "delete";
      render();
    }
  }
  if (action === "confirm-delete") deleteTransaction();
  if (action === "close-modal") closeModal();
  if (action === "discard-form") {
    const route = state.pendingRoute || "home";
    discardFormAndRoute(route);
  }
  if (action === "clear-filters") {
    clearFilters();
    render();
  }
  if (action === "filter-today") applyTodayFilter();
  if (action === "test-connection") testConnection();
}

function bootstrapHashRoute() {
  const route = parseRouteFromHash();
  if (route) state.route = route;
  else history.replaceState(null, "", `#/${state.route}`);
}

document.addEventListener("click", event => {
  const modalPanel = event.target.closest("[data-modal-panel]");
  const modalBackdrop = event.target.closest(".modal-backdrop");
  if (modalBackdrop && !modalPanel && event.target === modalBackdrop) {
    closeModal();
    return;
  }

  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    requestRoute(routeButton.dataset.route);
    return;
  }

  const typeButton = event.target.closest("[data-type]");
  if (typeButton) {
    handleTypeChange(typeButton.dataset.type);
    return;
  }

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    handleCategoryChange(categoryButton.dataset.category);
    return;
  }

  const filterChip = event.target.closest("[data-filter-type]");
  if (filterChip) {
    state.filters.type = filterChip.dataset.filterType;
    render();
    return;
  }

  const editButton = event.target.closest("[data-edit-id]");
  if (editButton) {
    startEdit(editButton.dataset.editId);
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  handleAction(actionButton.dataset.action);
});

document.addEventListener("input", event => {
  const filterInput = event.target.closest("[data-filter]");
  if (filterInput) {
    handleFilterInput(filterInput);
    return;
  }

  const formInput = event.target.closest("[data-form]");
  if (formInput) handleFormInput(formInput);
});

document.addEventListener("change", event => {
  const filterInput = event.target.closest("[data-filter]");
  if (filterInput) handleFilterInput(filterInput);
});

window.addEventListener("hashchange", () => {
  const route = parseRouteFromHash();
  if (route && route !== state.route) requestRoute(route, { silentHash: true });
});

bootstrapHashRoute();
loadData();
