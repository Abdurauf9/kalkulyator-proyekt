// Kalkulyator holati
const state = {
  current: "0",     // ekrandagi joriy son
  previous: null,    // oldingi son
  operator: null,    // tanlangan amal
  overwrite: false,  // keyingi raqam ekranni almashtiradimi
};

const currentEl = document.getElementById("current");
const historyEl = document.getElementById("history");

const OP_SYMBOL = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// Ekranni yangilash
function render() {
  currentEl.textContent = formatNumber(state.current);
  if (state.previous !== null && state.operator) {
    historyEl.textContent = `${formatNumber(state.previous)} ${OP_SYMBOL[state.operator]}`;
  } else {
    historyEl.textContent = "";
  }
}

// Sonni chiroyli ko'rsatish (1000 -> 1 000, vergul bilan)
function formatNumber(value) {
  if (value === "Xatolik") return value;
  const [intPart, decPart] = value.split(".");
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart !== undefined ? `${withSpaces},${decPart}` : withSpaces;
}

function inputNumber(digit) {
  if (state.overwrite) {
    state.current = digit;
    state.overwrite = false;
  } else {
    state.current = state.current === "0" ? digit : state.current + digit;
  }
}

function inputDecimal() {
  if (state.overwrite) {
    state.current = "0.";
    state.overwrite = false;
    return;
  }
  if (!state.current.includes(".")) {
    state.current += ".";
  }
}

function chooseOperator(op) {
  if (state.operator && !state.overwrite) {
    compute();
  }
  state.previous = state.current;
  state.operator = op;
  state.overwrite = true;
}

function compute() {
  const a = parseFloat(state.previous);
  const b = parseFloat(state.current);
  if (isNaN(a) || isNaN(b)) return;

  let result;
  switch (state.operator) {
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "*": result = a * b; break;
    case "/":
      result = b === 0 ? "Xatolik" : a / b;
      break;
    default: return;
  }

  state.current = typeof result === "number"
    ? String(Math.round(result * 1e10) / 1e10)
    : result;
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
}

function percent() {
  state.current = String(parseFloat(state.current) / 100);
  state.overwrite = true;
}

function clearAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.overwrite = false;
}

function deleteLast() {
  if (state.overwrite || state.current.length === 1) {
    state.current = "0";
    state.overwrite = false;
  } else {
    state.current = state.current.slice(0, -1);
  }
}

// Tugmalar bilan bog'lash
document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const { action, value } = btn.dataset;

  if (state.current === "Xatolik" && action !== "clear") return;

  switch (action) {
    case "number": inputNumber(value); break;
    case "decimal": inputDecimal(); break;
    case "operator": chooseOperator(value); break;
    case "equals": compute(); break;
    case "percent": percent(); break;
    case "clear": clearAll(); break;
    case "delete": deleteLast(); break;
  }
  render();
});

// Klaviatura qo'llab-quvvatlash
window.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") inputNumber(e.key);
  else if (e.key === ".") inputDecimal();
  else if (["+", "-", "*", "/"].includes(e.key)) chooseOperator(e.key);
  else if (e.key === "Enter" || e.key === "=") compute();
  else if (e.key === "Backspace") deleteLast();
  else if (e.key === "Escape") clearAll();
  else if (e.key === "%") percent();
  else return;
  render();
});

render();
