// ========== Character Pools ==========
const charPools = {
    lower:   "abcdefghijklmnopqrstuvwxyz",
    upper:   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>/?~"
};

const similarChars   = "oO0iIlL1";
const ambiguousChars = "~;:.{}[]()<>\\/'\"`";

function secureRandInt(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    let val;
    do {
        crypto.getRandomValues(buf);
        val = buf[0];
    } while (val >= limit);
    return val % max;
}

function secureShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = secureRandInt(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildPools() {
    const useLower         = document.getElementById("lower").checked;
    const useUpper         = document.getElementById("upper").checked;
    const useNumbers       = document.getElementById("numbers").checked;
    const useSymbols       = document.getElementById("symbols").checked;
    const excludeSimilar   = document.getElementById("exclude-similar").checked;
    const excludeAmbiguous = document.getElementById("exclude-ambiguous").checked;

    const selected = {};
    if (useLower)   selected.lower   = charPools.lower;
    if (useUpper)   selected.upper   = charPools.upper;
    if (useNumbers) selected.numbers = charPools.numbers;
    if (useSymbols) selected.symbols = charPools.symbols;

    for (const key in selected) {
        let chars = selected[key].split('');
        if (excludeSimilar)   chars = chars.filter(c => !similarChars.includes(c));
        if (excludeAmbiguous) chars = chars.filter(c => !ambiguousChars.includes(c));
        selected[key] = chars.join('');
    }

    for (const key in selected) {
        if (selected[key].length === 0) delete selected[key];
    }

    return selected;
}

function getValidLength() {
    const el  = document.getElementById("length");
    const raw = parseInt(el.value);
    if (isNaN(raw) || raw < 8)  { el.value = 8;   return 8;   }
    if (raw > 128)               { el.value = 128; return 128; }
    return raw;
}

function generatePassword() {
    const length = getValidLength();
    const pools  = buildPools();
    const keys   = Object.keys(pools);

    if (keys.length === 0) {
        showToast("Please select at least one character type!", "error");
        return;
    }

    const fullPool = keys.map(k => pools[k]).join('').split('');

    const mandatory = keys.map(k => {
        const chars = pools[k].split('');
        return chars[secureRandInt(chars.length)];
    });

    const rest = [];
    for (let i = 0; i < length - mandatory.length; i++) {
        rest.push(fullPool[secureRandInt(fullPool.length)]);
    }

    const password = secureShuffle([...mandatory, ...rest]).join('');

    document.getElementById("password").textContent = password;
    updateStrengthMeter(password, fullPool.length);
    pushToHistory(password);
}

function updateStrengthMeter(password, poolSize) {
    const strengthFill  = document.getElementById("strength-fill");
    const strengthLabel = document.getElementById("strength-label");

    const entropy = password.length * Math.log2(Math.max(poolSize, 2));

    let percentage, color, label;
    if (entropy >= 100) {
        percentage = 100; color = "#22c55e"; label = "Very Strong";
    } else if (entropy >= 72) {
        percentage = 80;  color = "#22c55e"; label = "Strong";
    } else if (entropy >= 50) {
        percentage = 55;  color = "#eab308"; label = "Medium";
    } else if (entropy >= 35) {
        percentage = 30;  color = "#f97316"; label = "Weak";
    } else {
        percentage = 10;  color = "#ef4444"; label = "Very Weak";
    }

    strengthFill.style.width      = percentage + "%";
    strengthFill.style.background = color;
    if (strengthLabel) {
        strengthLabel.textContent = label;
        strengthLabel.style.color = color;
    }
}

function copyPassword() {
    const passwordEl   = document.getElementById("password");
    const passwordText = passwordEl.textContent.trim();

    if (!passwordText || passwordText === "Password will appear here") {
        showToast("Generate a password first!", "error");
        return;
    }

    navigator.clipboard.writeText(passwordText)
        .then(() => showToast("Password copied to clipboard ✓"))
        .catch(() => showToast("Copy failed — try manually", "error"));
}

// ========== History (chrome.storage.session — survives popup close, clears on browser exit) ==========
function pushToHistory(password) {
    chrome.storage.session.get({ history: [] }, (data) => {
        const history = data.history;
        if (history[0] === password) return;
        history.unshift(password);
        if (history.length > 10) history.pop();
        chrome.storage.session.set({ history }, () => renderHistory(history));
    });
}

function renderHistory(history) {
    const list  = document.getElementById("history-list");
    const empty = document.getElementById("history-empty");

    list.querySelectorAll(".history-item").forEach(el => el.remove());

    if (!history || history.length === 0) {
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";
    history.forEach(pw => {
        const item = document.createElement("div");
        item.className = "history-item";

        const text = document.createElement("span");
        text.className = "history-pw";
        text.textContent = pw;

        const btn = document.createElement("button");
        btn.className = "history-copy-btn";
        btn.title = "Copy this password";
        btn.textContent = "⧉";
        btn.addEventListener("click", () => {
            navigator.clipboard.writeText(pw)
                .then(() => showToast("Copied from history ✓"))
                .catch(() => showToast("Copy failed", "error"));
        });

        item.appendChild(text);
        item.appendChild(btn);
        list.appendChild(item);
    });
}

function toggleHistory() {
    document.getElementById("history-panel").classList.toggle("open");
}

function clearPassword() {
    const placeholder = "Password will appear here";
    const pw = document.getElementById("password").textContent;
    if (pw === placeholder) return;

    document.getElementById("password").textContent = placeholder;
    document.getElementById("strength-fill").style.width = "0%";
    document.getElementById("strength-label").textContent = "";
}

// ========== Toast ==========
let _toastTimer = null;
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.background = type === "error" ? "#ef4444" : "#22c55e";
    toast.style.opacity = "1";

    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => { toast.style.opacity = "0"; }, 2200);
}

// ========== Event Listeners ==========
document.addEventListener("DOMContentLoaded", () => {
    generatePassword();

    // Load history from previous session on popup open
    chrome.storage.session.get({ history: [] }, (data) => renderHistory(data.history));

    document.getElementById("generate").addEventListener("click", generatePassword);
    document.getElementById("password").addEventListener("click", copyPassword);
    document.getElementById("btn-copy").addEventListener("click", copyPassword);
    document.getElementById("btn-history").addEventListener("click", toggleHistory);
    document.getElementById("btn-clear").addEventListener("click", clearPassword);

    let _lengthTimer = null;
    document.getElementById("length").addEventListener("input", () => {
        clearTimeout(_lengthTimer);
        _lengthTimer = setTimeout(() => {
            const pw = document.getElementById("password").textContent;
            if (pw && pw !== "Password will appear here") generatePassword();
        }, 300);
    });

    document.getElementById("password").addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            copyPassword();
        }
    });
});