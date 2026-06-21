const STORAGE_KEY = "thai-expense-transactions-v1";
const API_URL_KEY = "thai-expense-api-url-v1";
const API_TOKEN_KEY = "thai-expense-api-token-v1";

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

const state = {
  route: "home",
  selectedMonth: getMonthKey(new Date()),
  transactions: [],
  loading: false,
  lastError: "",
  editingId: null,
  apiUrl: localStorage.getItem(API_URL_KEY) || "",
  token: localStorage.getItem(API_TOKEN_KEY) || "",
  form: makeDefaultForm()
};

const app = document.getElementById("app");
const toastEl = document.getElementById("toast");
const settingsDialog = document.getElementById("settingsDialog");
const settingApiUrl = document.getElementById("settingApiUrl");
const settingToken = document.getElementById("settingToken");

function makeDefaultForm() {
  return {
    type: "expense",
    amount: "",
    category: "อื่นๆ",
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
  return new Date(year, (month || 1) - 1, day || 1);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
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

function createId() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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
  return CATEGORIES[type].find(item => item.name === category) || { name: category || "อื่นๆ", icon: type === "income" ? "💵" : "●", color: "#64748b" };
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

function setRoute(route) {
  state.route = route;
  state.lastError = "";
  if (route === "add" && !state.editingId) {
    state.form = makeDefaultForm();
  }
  render();
}

function changeMonth(offset) {
  const [year, month] = state.selectedMonth.split("-").map(Number);
  const next = new Date(year, month - 1 + offset, 1);
  state.selectedMonth = getMonthKey(next);
  render();
}

async function loadData() {
  state.loading = true;
  state.lastError = "";
  state.transactions = readLocalTransactions();
  render();

  if (!state.apiUrl) {
    state.loading = false;
    render();
    return;
  }

  try {
    const result = await apiRequest("list");
    const items = result.data || result.transactions || [];
    state.transactions = normalizeTransactions(items);
    writeLocalTransactions(state.transactions);
  } catch (error) {
    state.lastError = `เชื่อมต่อ Google Sheet ไม่สำเร็จ: ${error.message}`;
  } finally {
    state.loading = false;
    render();
  }
}

async function apiRequest(action, payload = {}) {
  if (!state.apiUrl) throw new Error("ยังไม่ได้ตั้งค่า URL");

  const params = new URLSearchParams();
  params.set("action", action);
  params.set("token", state.token);
  params.set("payload", JSON.stringify(payload));

  const response = await fetch(state.apiUrl, {
    method: "POST",
    body: params,
    redirect: "follow"
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("คำตอบจาก Apps Script ไม่ใช่ JSON โปรดตรวจสอบการ Deploy");
  }

  if (!response.ok || json.ok === false) {
    throw new Error(json.error || `HTTP ${response.status}`);
  }
  return json;
}

function render() {
  updateNav();
  if (state.route === "home") app.innerHTML = renderHome();
  if (state.route === "add") app.innerHTML = renderAdd();
  if (state.route === "list") app.innerHTML = renderList();
  if (state.route === "summary") app.innerHTML = renderSummary();
}

function updateNav() {
  document.querySelectorAll(".nav-button").forEach(button => {
    button.classList.toggle("active", button.dataset.route === state.route);
  });
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
        <div>
          <h1 class="page-title">หน้าแรก</h1>
          <button class="month-pill" type="button" data-action="go-list">${monthTitle(state.selectedMonth)}⌄</button>
        </div>
        <button class="icon-button" type="button" data-action="open-settings" aria-label="ตั้งค่า">⚙</button>
      </header>

      ${renderNotice()}

      <section class="card balance-card">
        <p class="balance-label">คงเหลือเดือนนี้</p>
        <div class="balance-value">
          <strong>${formatMoney(summary.balance)}</strong>
          <span>บาท</span>
        </div>
        <div class="balance-split">
          <div class="text-green">รับเข้า <strong>${formatMoney(summary.income)}</strong></div>
          <div class="divider"></div>
          <div class="text-red">ใช้ไป <strong>${formatMoney(summary.expense)}</strong></div>
        </div>
      </section>

      <section class="card quick-card">
        <div class="quick-left">
          <span class="quick-icon">💳</span>
          <div>
            <div class="quick-title">วันนี้ใช้ไป</div>
            <div class="quick-value">${formatMoney(todaySpent)} <span class="small text-blue">บาท</span></div>
          </div>
        </div>
        <span class="muted">›</span>
      </section>

      <button class="primary-button full-width" type="button" data-route="add">＋ เพิ่มรายการ</button>

      <div class="section-head">
        <h2 class="section-title">รายการล่าสุด</h2>
        <button class="link-button" type="button" data-route="list">ดูทั้งหมด</button>
      </div>
      ${latest.length ? `<div class="transaction-list">${latest.map(tx => renderTransactionCard(tx, true)).join("")}</div>` : renderEmpty("ยังไม่มีรายการ", "เริ่มจากการกดปุ่มเพิ่มรายการเพื่อบันทึกรายรับรายจ่ายแรกของคุณ", "🧾")}
    </section>
  `;
}

function renderNotice() {
  if (state.loading) return renderLoading("กำลังโหลดข้อมูล", "กำลังดึงรายการล่าสุด");
  if (state.lastError) return renderError(state.lastError);
  if (!state.apiUrl) {
    return `
      <section class="card quick-card">
        <div>
          <strong>กำลังใช้ข้อมูลในเครื่อง</strong>
          <div class="muted small">ตั้งค่า Apps Script เพื่อบันทึกลง Google Sheet</div>
        </div>
        <button class="secondary-button" type="button" data-action="open-settings">ตั้งค่า</button>
      </section>
    `;
  }
  return "";
}

function renderAdd() {
  const isEdit = Boolean(state.editingId);
  const form = state.form;
  const categories = CATEGORIES[form.type];

  return `
    <section class="screen">
      <header class="topbar center">
        <button class="link-button" type="button" data-action="cancel-form">ยกเลิก</button>
        <h1 class="page-title">${isEdit ? "แก้ไขรายการ" : "เพิ่มรายการ"}</h1>
        <span class="small muted">${isEdit ? "แก้ไข" : "ใหม่"}</span>
      </header>

      <div class="segmented" role="tablist" aria-label="ประเภท">
        <button type="button" class="${form.type === "expense" ? "active expense" : ""}" data-type="expense">รายจ่าย</button>
        <button type="button" class="${form.type === "income" ? "active income" : ""}" data-type="income">รายรับ</button>
      </div>

      <section class="card amount-card">
        <label for="amountInput">จำนวนเงิน</label>
        <div class="amount-input-wrap">
          <span class="currency-symbol">฿</span>
          <input id="amountInput" class="amount-input" data-form="amount" value="${escapeHtml(form.amount)}" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="จำนวนเงิน">
        </div>
      </section>

      <section class="form-section">
        <span class="form-label">หมวดหมู่</span>
        <div class="category-grid">
          ${categories.map(category => `
            <button class="category-card ${form.category === category.name ? `active ${form.type}` : ""}" type="button" data-category="${escapeHtml(category.name)}">
              <span class="category-icon">${category.icon}</span>
              <span>${category.name}</span>
            </button>
          `).join("")}
        </div>
      </section>

      <label class="field">
        <span>วันที่</span>
        <input type="date" data-form="date" value="${escapeHtml(form.date)}">
      </label>

      <label class="field">
        <span>บันทึกเพิ่มเติม</span>
        <textarea data-form="note" maxlength="120" placeholder="เช่น กาแฟ, ข้าวกลางวัน, เงินเดือน">${escapeHtml(form.note)}</textarea>
      </label>

      <div class="form-actions">
        <button class="primary-button" type="button" data-action="save-transaction">บันทึก</button>
        ${isEdit ? `<button class="danger-button" type="button" data-action="delete-transaction">ลบรายการนี้</button>` : ""}
        <button class="secondary-button" type="button" data-action="cancel-form">ยกเลิก</button>
      </div>
    </section>
  `;
}

function renderList() {
  const items = sortTransactions(monthTransactions());
  const summary = summarize(items);
  const groups = groupByDate(items);

  return `
    <section class="screen">
      <header class="topbar center">
        <span></span>
        <h1 class="page-title">รายการ</h1>
        <button class="icon-button" type="button" data-action="reload" aria-label="โหลดใหม่">↻</button>
      </header>

      ${renderMonthSwitcher()}
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

      ${items.length ? Object.entries(groups).map(([date, txs]) => renderDayGroup(date, txs)).join("") : renderEmpty("เดือนนี้ยังไม่มีรายการ", "เพิ่มรายการแรกของเดือนนี้เพื่อดูประวัติย้อนหลัง", "📭")}
    </section>
  `;
}

function renderSummary() {
  const items = monthTransactions();
  const summary = summarize(items);
  const expenseItems = items.filter(tx => tx.type === "expense");
  const byCategory = summarizeExpenseByCategory(expenseItems);
  const top = byCategory[0];

  return `
    <section class="screen">
      <header class="topbar center">
        <span></span>
        <h1 class="page-title">สรุป</h1>
        <button class="icon-button" type="button" data-action="reload" aria-label="โหลดใหม่">↻</button>
      </header>

      ${renderMonthSwitcher()}
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
            <div class="donut" style="background:${makeDonutGradient(byCategory)}"></div>
            <div class="legend-list">
              ${byCategory.map(row => renderLegendRow(row, summary.expense)).join("")}
            </div>
          </div>
        ` : renderEmpty("ยังไม่มีรายจ่าย", "เมื่อมีรายจ่าย ระบบจะแสดงกราฟแยกตามหมวดหมู่", "📊")}
      </section>

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

function renderMonthSwitcher() {
  return `
    <div class="month-switcher">
      <button class="month-nav-button" type="button" data-action="prev-month" aria-label="เดือนก่อนหน้า">‹</button>
      <strong>${monthTitle(state.selectedMonth)}</strong>
      <button class="month-nav-button" type="button" data-action="next-month" aria-label="เดือนถัดไป">›</button>
    </div>
  `;
}

function renderTransactionCard(tx, includeDate = false) {
  const meta = getCategoryMeta(tx.category, tx.type);
  return `
    <button class="transaction-card" type="button" data-edit-id="${escapeHtml(tx.id)}">
      <span class="tx-icon ${tx.type}">${meta.icon}</span>
      <span>
        <span class="tx-title">${escapeHtml(transactionTitle(tx))}</span>
        <span class="tx-meta">${escapeHtml(transactionMeta(tx, includeDate))}</span>
      </span>
      <span class="tx-amount ${tx.type === "income" ? "text-green" : "text-red"}">${signedAmount(tx)}</span>
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
        <span class="${totalClass}">${sign}${formatMoney(Math.abs(dayTotal))}</span>
      </div>
      <div class="transaction-list">
        ${txs.map(tx => renderTransactionCard(tx)).join("")}
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

function renderEmpty(title, detail, emoji) {
  return `
    <section class="empty-state">
      <span class="emoji">${emoji}</span>
      <strong>${escapeHtml(title)}</strong>
      <div class="muted small">${escapeHtml(detail)}</div>
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

function renderError(message) {
  return `
    <section class="error-state">
      <span class="emoji">⚠️</span>
      <strong>พบปัญหา</strong>
      <div class="muted small">${escapeHtml(message)}</div>
    </section>
  `;
}

function normalizeAmount(value) {
  const cleaned = String(value || "").replace(/,/g, "").trim();
  return Number(cleaned);
}

function startEdit(id) {
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
  state.route = "add";
  render();
}

function cancelForm() {
  state.editingId = null;
  state.form = makeDefaultForm();
  state.route = "home";
  render();
}

async function saveTransaction() {
  const amount = normalizeAmount(state.form.amount);
  if (!amount || amount <= 0) {
    showToast("กรุณาใส่จำนวนเงินให้ถูกต้อง", "error");
    return;
  }
  if (!state.form.date) {
    showToast("กรุณาเลือกวันที่", "error");
    return;
  }

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
    if (state.apiUrl) {
      await apiRequest(state.editingId ? "update" : "create", { transaction });
      await loadData();
    } else {
      if (state.editingId) {
        state.transactions = state.transactions.map(tx => tx.id === state.editingId ? transaction : tx);
      } else {
        state.transactions = [transaction, ...state.transactions];
      }
      writeLocalTransactions(state.transactions);
    }
    state.selectedMonth = transaction.date.slice(0, 7);
    state.editingId = null;
    state.form = makeDefaultForm();
    state.route = "home";
    showToast("บันทึกสำเร็จ", "success");
    render();
  } catch (error) {
    showToast(`บันทึกไม่สำเร็จ: ${error.message}`, "error");
  }
}

async function deleteTransaction() {
  if (!state.editingId) return;
  const confirmed = confirm("ต้องการลบรายการนี้ใช่ไหม?");
  if (!confirmed) return;

  try {
    if (state.apiUrl) {
      await apiRequest("delete", { id: state.editingId });
      await loadData();
    } else {
      state.transactions = state.transactions.filter(tx => tx.id !== state.editingId);
      writeLocalTransactions(state.transactions);
    }
    state.editingId = null;
    state.form = makeDefaultForm();
    state.route = "list";
    showToast("ลบรายการแล้ว", "success");
    render();
  } catch (error) {
    showToast(`ลบไม่สำเร็จ: ${error.message}`, "error");
  }
}

function openSettings() {
  settingApiUrl.value = state.apiUrl;
  settingToken.value = state.token;
  settingsDialog.hidden = false;
  setTimeout(() => settingApiUrl.focus(), 50);
}

function closeSettings() {
  settingsDialog.hidden = true;
}

async function saveSettings() {
  state.apiUrl = settingApiUrl.value.trim();
  state.token = settingToken.value.trim();
  localStorage.setItem(API_URL_KEY, state.apiUrl);
  localStorage.setItem(API_TOKEN_KEY, state.token);
  closeSettings();
  showToast("บันทึกการตั้งค่าแล้ว", "success");
  await loadData();
}

async function testApi() {
  state.apiUrl = settingApiUrl.value.trim();
  state.token = settingToken.value.trim();
  if (!state.apiUrl) {
    showToast("กรุณาใส่ Apps Script URL", "error");
    return;
  }
  try {
    await apiRequest("ping");
    showToast("เชื่อมต่อสำเร็จ", "success");
  } catch (error) {
    showToast(`ทดสอบไม่สำเร็จ: ${error.message}`, "error");
  }
}

function clearLocalData() {
  const confirmed = confirm("ต้องการล้างข้อมูลในเครื่องนี้ใช่ไหม? ข้อมูลใน Google Sheet จะไม่ถูกลบ");
  if (!confirmed) return;
  localStorage.removeItem(STORAGE_KEY);
  state.transactions = [];
  showToast("ล้างข้อมูลในเครื่องแล้ว", "success");
  render();
}

function showToast(message, type = "") {
  toastEl.textContent = message;
  toastEl.className = `toast ${type}`.trim();
  toastEl.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

document.addEventListener("click", async event => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    const route = routeButton.dataset.route;
    state.editingId = null;
    setRoute(route);
    return;
  }

  const typeButton = event.target.closest("[data-type]");
  if (typeButton) {
    const type = typeButton.dataset.type;
    state.form.type = type;
    state.form.category = "อื่นๆ";
    render();
    return;
  }

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.form.category = categoryButton.dataset.category;
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

  const action = actionButton.dataset.action;
  if (action === "open-settings") openSettings();
  if (action === "close-settings") closeSettings();
  if (action === "save-settings") await saveSettings();
  if (action === "test-api") await testApi();
  if (action === "clear-local") clearLocalData();
  if (action === "prev-month") changeMonth(-1);
  if (action === "next-month") changeMonth(1);
  if (action === "go-list") setRoute("list");
  if (action === "reload") await loadData();
  if (action === "cancel-form") cancelForm();
  if (action === "save-transaction") await saveTransaction();
  if (action === "delete-transaction") await deleteTransaction();
});

document.addEventListener("input", event => {
  const input = event.target.closest("[data-form]");
  if (!input) return;
  state.form[input.dataset.form] = input.value;
});

settingsDialog.addEventListener("keydown", event => {
  if (event.key === "Escape") closeSettings();
});

loadData();
