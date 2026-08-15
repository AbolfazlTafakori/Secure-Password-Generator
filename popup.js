// ========== Character Pools & Sets ==========
const charPools = {
    lower:   "abcdefghijklmnopqrstuvwxyz",
    upper:   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>/?~"
};

const similarChars   = "oO0iIlL1";
const ambiguousChars = "~;:.{}[]()<>\\/'\"`";

// ========== Storage Abstraction (chrome.storage.session with fallback) ==========
const storage = {
    get: function(defaultData, callback) {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.session) {
            try {
                chrome.storage.session.get(defaultData, (data) => {
                    if (chrome.runtime && chrome.runtime.lastError) {
                        console.warn("Storage warning:", chrome.runtime.lastError);
                        callback(this._getFallback(defaultData));
                    } else {
                        callback(data || defaultData);
                    }
                });
                return;
            } catch (e) {
                console.warn("chrome.storage.session exception:", e);
            }
        }
        callback(this._getFallback(defaultData));
    },

    set: function(items, callback) {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.session) {
            try {
                chrome.storage.session.set(items, () => {
                    if (callback) callback();
                });
                return;
            } catch (e) {
                console.warn("chrome.storage.session exception:", e);
            }
        }
        this._setFallback(items);
        if (callback) callback();
    },

    _getFallback: function(defaultData) {
        try {
            const raw = sessionStorage.getItem("spg_history");
            return raw ? { history: JSON.parse(raw) } : defaultData;
        } catch (e) {
            return defaultData;
        }
    },

    _setFallback: function(items) {
        try {
            if (items.history !== undefined) {
                sessionStorage.setItem("spg_history", JSON.stringify(items.history));
            }
        } catch (e) {}
    }
};

// ========== Cryptographically Secure Random Utilities ==========
function secureRandInt(max) {
    if (max <= 0) return 0;
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

// ========== Password Generation Logic ==========
function buildPools() {
    const useLower         = document.getElementById("lower")?.checked ?? true;
    const useUpper         = document.getElementById("upper")?.checked ?? true;
    const useNumbers       = document.getElementById("numbers")?.checked ?? true;
    const useSymbols       = document.getElementById("symbols")?.checked ?? true;
    const excludeSimilar   = document.getElementById("exclude-similar")?.checked ?? false;
    const excludeAmbiguous = document.getElementById("exclude-ambiguous")?.checked ?? false;

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
    const el = document.getElementById("length");
    let raw = parseInt(el.value, 10);
    if (isNaN(raw) || raw < 8) raw = 8;
    if (raw > 128) raw = 128;
    return raw;
}

function syncLengthControls(value) {
    let val = parseInt(value, 10);
    if (isNaN(val)) val = 16;
    val = Math.max(8, Math.min(128, val));

    const numInput = document.getElementById("length");
    const slider   = document.getElementById("length-slider");

    if (numInput && parseInt(numInput.value, 10) !== val) numInput.value = val;
    if (slider && parseInt(slider.value, 10) !== val) slider.value = val;

    return val;
}

function generatePassword() {
    const length = getValidLength();
    const pools  = buildPools();
    const keys   = Object.keys(pools);

    if (keys.length === 0) {
        document.getElementById("password").textContent = "Please select at least 1 option";
        document.getElementById("strength-fill").style.width = "0%";
        const label = document.getElementById("strength-label");
        if (label) label.textContent = "";
        showToast("Select at least one character type!", "error");
        return;
    }

    const fullPool = keys.map(k => pools[k]).join('').split('');
    const targetLength = Math.max(length, keys.length);

    // Guaranteed inclusion of each selected pool
    const mandatory = keys.map(k => {
        const chars = pools[k].split('');
        return chars[secureRandInt(chars.length)];
    });

    const rest = [];
    const remainingCount = targetLength - mandatory.length;
    for (let i = 0; i < remainingCount; i++) {
        rest.push(fullPool[secureRandInt(fullPool.length)]);
    }

    const password = secureShuffle([...mandatory, ...rest]).join('');

    document.getElementById("password").textContent = password;
    updateStrengthMeter(password, fullPool.length);
    pushToHistory(password);

    // Subtle animation on the generate button icon
    const genIcon = document.querySelector(".gen-icon");
    if (genIcon) {
        genIcon.classList.remove("spin");
        void genIcon.offsetWidth; // trigger reflow
        genIcon.classList.add("spin");
    }
}

function updateStrengthMeter(password, poolSize) {
    const strengthFill  = document.getElementById("strength-fill");
    const strengthLabel = document.getElementById("strength-label");

    if (!strengthFill) return;

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
        percentage = 15;  color = "#ef4444"; label = "Very Weak";
    }

    strengthFill.style.width      = percentage + "%";
    strengthFill.style.background = color;
    if (strengthLabel) {
        strengthLabel.textContent = label;
        strengthLabel.style.color = color;
    }
}

// ========== Robust Copy to Clipboard ==========
async function copyToClipboard(text, successMsg = "Password copied to clipboard ✓") {
    if (!text || text === "Password will appear here" || text === "Please select at least 1 option") {
        showToast("Generate a password first!", "error");
        return;
    }

    let copied = false;

    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            copied = true;
        } catch (err) {
            console.warn("navigator.clipboard failed, attempting fallback:", err);
        }
    }

    if (!copied) {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            textArea.setAttribute("readonly", "");
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            copied = document.execCommand("copy");
            document.body.removeChild(textArea);
        } catch (err) {
            console.error("DOM copy fallback failed:", err);
        }
    }

    if (copied) {
        showToast(successMsg);
    } else {
        showToast("Copy failed — please copy manually", "error");
    }
}

function copyCurrentPassword() {
    const passwordEl   = document.getElementById("password");
    const passwordText = passwordEl ? passwordEl.textContent.trim() : "";
    copyToClipboard(passwordText, "Password copied to clipboard ✓");
}

// ========== History Handling ==========
function pushToHistory(password) {
    if (!password || password.startsWith("Please select")) return;

    storage.get({ history: [] }, (data) => {
        const history = Array.isArray(data.history) ? [...data.history] : [];
        if (history[0] === password) return;
        history.unshift(password);
        if (history.length > 10) history.pop();
        storage.set({ history }, () => renderHistory(history));
    });
}

function renderHistory(history) {
    const list  = document.getElementById("history-list");
    const empty = document.getElementById("history-empty");
    if (!list) return;

    list.querySelectorAll(".history-item").forEach(el => el.remove());

    if (!history || history.length === 0) {
        if (empty) empty.style.display = "block";
        return;
    }

    if (empty) empty.style.display = "none";
    history.forEach(pw => {
        const item = document.createElement("div");
        item.className = "history-item";

        const text = document.createElement("span");
        text.className = "history-pw";
        text.textContent = pw;
        text.title = pw;

        const btn = document.createElement("button");
        btn.className = "history-copy-btn";
        btn.title = "Copy this password";
        btn.innerHTML = "&#x2398;";
        btn.setAttribute("aria-label", "Copy password from history");
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            copyToClipboard(pw, "Copied from history ✓");
        });

        item.appendChild(text);
        item.appendChild(btn);
        list.appendChild(item);
    });
}

function clearAllHistory() {
    storage.set({ history: [] }, () => {
        renderHistory([]);
        showToast("History cleared ✓");
    });
}

function toggleHistory() {
    const panel = document.getElementById("history-panel");
    if (panel) {
        panel.classList.toggle("open");
    }
}

function clearPassword() {
    const placeholder = "Password will appear here";
    const pwEl = document.getElementById("password");
    if (!pwEl || pwEl.textContent === placeholder) return;

    pwEl.textContent = placeholder;
    const strengthFill = document.getElementById("strength-fill");
    const strengthLabel = document.getElementById("strength-label");
    if (strengthFill) strengthFill.style.width = "0%";
    if (strengthLabel) strengthLabel.textContent = "";
}

// ========== Toast Notification ==========
let _toastTimer = null;
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.style.background = type === "error" ? "#ef4444" : "#22c55e";
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";

    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(6px)";
    }, 2200);
}

// ========== Event Listeners Initialization ==========
document.addEventListener("DOMContentLoaded", () => {
    // Initial generation
    generatePassword();

    // Load initial history safely
    storage.get({ history: [] }, (data) => renderHistory(data.history));

    // Button interactions
    document.getElementById("generate")?.addEventListener("click", generatePassword);
    document.getElementById("password")?.addEventListener("click", copyCurrentPassword);
    document.getElementById("btn-copy")?.addEventListener("click", copyCurrentPassword);
    document.getElementById("btn-history")?.addEventListener("click", toggleHistory);
    document.getElementById("btn-clear")?.addEventListener("click", clearPassword);
    document.getElementById("btn-clear-history")?.addEventListener("click", clearAllHistory);

    // Number input & Range slider sync
    const lengthInput  = document.getElementById("length");
    const lengthSlider = document.getElementById("length-slider");

    let _debounceTimer = null;
    function handleLengthChange(val) {
        const validVal = syncLengthControls(val);
        clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(() => {
            const pw = document.getElementById("password")?.textContent;
            if (pw && pw !== "Password will appear here") {
                generatePassword();
            }
        }, 120);
    }

    if (lengthSlider) {
        lengthSlider.addEventListener("input", (e) => handleLengthChange(e.target.value));
    }

    if (lengthInput) {
        lengthInput.addEventListener("input", (e) => {
            const raw = parseInt(e.target.value, 10);
            if (!isNaN(raw) && raw >= 8 && raw <= 128) {
                handleLengthChange(raw);
            }
        });
        lengthInput.addEventListener("change", (e) => {
            handleLengthChange(e.target.value);
        });
    }

    // Auto-regenerate on option checkboxes toggle
    const optionIds = ["lower", "upper", "numbers", "symbols", "exclude-similar", "exclude-ambiguous"];
    optionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("change", () => {
                generatePassword();
            });
        }
    });

    // Keyboard support for password box
    document.getElementById("password")?.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            copyCurrentPassword();
        }
    });
});