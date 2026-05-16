// ========== Character Pools ==========
const charPools = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>/?"
};

// Similar & Ambiguous characters
const similarChars = "oO0iIlL1";
const ambiguousChars = "~;:.{}[]()<>\\/'\"`";

// ========== Generate Random Password ==========
function generatePassword() {
    const length = parseInt(document.getElementById("length").value) || 16;

    const useLower = document.getElementById("lower").checked;
    const useUpper = document.getElementById("upper").checked;
    const useNumbers = document.getElementById("numbers").checked;
    const useSymbols = document.getElementById("symbols").checked;
    const excludeSimilar = document.getElementById("exclude-similar").checked;
    const excludeAmbiguous = document.getElementById("exclude-ambiguous").checked;

    let pool = "";
    if (useLower) pool += charPools.lower;
    if (useUpper) pool += charPools.upper;
    if (useNumbers) pool += charPools.numbers;
    if (useSymbols) pool += charPools.symbols;

    if (excludeSimilar) {
        pool = pool.split('').filter(c => !similarChars.includes(c)).join('');
    }
    if (excludeAmbiguous) {
        pool = pool.split('').filter(c => !ambiguousChars.includes(c)).join('');
    }

    if (pool.length === 0) {
        showToast("Please select at least one character type!", "error");
        return "";
    }

    const randomArray = new Uint32Array(length);
    crypto.getRandomValues(randomArray);

    let password = "";
    for (let i = 0; i < length; i++) {
        password += pool[randomArray[i] % pool.length];
    }

    const passwordEl = document.getElementById("password");
    passwordEl.textContent = password;

    updateStrengthMeter(password);
    return password;
}

// ========== Strength Meter ==========
function updateStrengthMeter(password) {
    const strengthFill = document.getElementById("strength-fill");
    let strength = 0;

    if (password.length >= 12) strength += 25;
    if (password.length >= 16) strength += 15;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 10;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;

    const percentage = Math.min(strength, 100);
    strengthFill.style.width = percentage + "%";

    if (percentage > 75) strengthFill.style.background = "#22c55e";
    else if (percentage > 50) strengthFill.style.background = "#eab308";
    else strengthFill.style.background = "#ef4444";
}

// ========== Copy Password ==========
function copyPassword() {
    const passwordText = document.getElementById("password").textContent;

    if (!passwordText || passwordText.length < 4 || passwordText === "Password will appear here") {
        showToast("Generate a password first", "error");
        return;
    }

    navigator.clipboard.writeText(passwordText).then(() => {
        showToast("Password copied to clipboard ✓");
    });
}

// ========== Toast Notification ==========
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.background = type === "error" ? "#ef4444" : "#22c55e";
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
    }, 2200);
}

// ========== Event Listeners ==========
document.addEventListener("DOMContentLoaded", () => {
    generatePassword();

    // Generate button
    document.getElementById("generate").addEventListener("click", generatePassword);

    // Click on password area to copy
    document.getElementById("password").addEventListener("click", copyPassword);
});