const password = document.getElementById("password");
const bar = document.getElementById("bar");
const message = document.getElementById("message");
const eye = document.getElementById("eye");
const generate = document.getElementById("generate");
const copy = document.getElementById("copy");
const copyStatus = document.getElementById("copy-status");
const languageToggle = document.getElementById("language-toggle");
const strengthEstimator = typeof window.zxcvbn === "function" ? window.zxcvbn : null;
const translations = {
    fr: {
        title: "Créer un mot de passe",
        placeholder: "Entrez un mot de passe",
        showPassword: "Afficher le mot de passe",
        hidePassword: "Masquer le mot de passe",
        generate: "Créer un mot de passe fort",
        copy: "Copier le mot de passe",
        start: "Commencez à écrire...",
        unavailable: "Estimation indisponible",
        scores: ["Très faible", "Faible", "Moyen", "Fort", "Très fort"],
        copyEmpty: "Aucun mot de passe à copier.",
        copySuccess: "Mot de passe copié.",
        copyFailure: "Copie impossible dans ce navigateur.",
        switchLanguage: "Switch to English",
        security: "Sécurisé par InconnueOP",
        credit: "Créé par : InconnueOP"
    },
    en: {
        title: "Create a password",
        placeholder: "Enter a password",
        showPassword: "Show password",
        hidePassword: "Hide password",
        generate: "Generate a strong password",
        copy: "Copy password",
        start: "Start typing...",
        unavailable: "Strength estimate unavailable",
        scores: ["Very weak", "Weak", "Fair", "Strong", "Very strong"],
        copyEmpty: "There is no password to copy.",
        copySuccess: "Password copied.",
        copyFailure: "Could not copy in this browser.",
        switchLanguage: "Passer en français",
        security: "Secured by InconnueOP",
        credit: "Created by: InconnueOP"
    }
};

function updateStrength() {
    const strings = translations[currentLanguage];
    if (!password.value) {
        bar.style.width = "0";
        bar.style.background = "transparent";
        message.textContent = strings.start;
        return;
    }

    if (!strengthEstimator) {
        bar.style.width = "0";
        bar.style.background = "transparent";
        message.textContent = strings.unavailable;
        return;
    }

    const score = strengthEstimator(password.value).score;
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e"];
    bar.style.width = `${((score + 1) / 5) * 100}%`;
    bar.style.background = colors[score];
    message.textContent = strings.scores[score];
}

let currentLanguage = "fr";

function setLanguage(language) {
    currentLanguage = language;
    const strings = translations[language];
    document.documentElement.lang = language;
    document.title = strings.title;
    document.getElementById("heading").textContent = strings.title;
    password.placeholder = strings.placeholder;
    eye.setAttribute("aria-label", password.type === "password" ? strings.showPassword : strings.hidePassword);
    generate.textContent = strings.generate;
    copy.textContent = strings.copy;
    copyStatus.textContent = "";
    languageToggle.textContent = language === "fr" ? "EN" : "FR";
    languageToggle.setAttribute("aria-label", strings.switchLanguage);
    document.getElementById("footer-security").textContent = strings.security;
    document.getElementById("footer-credit").textContent = strings.credit;
    updateStrength();
}

function secureRandomIndex(max) {
    const randomByte = new Uint8Array(1);
    const limit = Math.floor(256 / max) * max;
    do {
        crypto.getRandomValues(randomByte);
    } while (randomByte[0] >= limit);
    return randomByte[0] % max;
}

generate.addEventListener("click", () => {
    const groups = [
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "abcdefghijklmnopqrstuvwxyz",
        "0123456789",
        "!@#$%^&*()-_=+[]{};:,.?"
    ];
    const characters = groups.map(group => group[secureRandomIndex(group.length)]);
    const alphabet = groups.join("");

    while (characters.length < 18) {
        characters.push(alphabet[secureRandomIndex(alphabet.length)]);
    }

    for (let index = characters.length - 1; index > 0; index--) {
        const swapIndex = secureRandomIndex(index + 1);
        [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
    }

    password.value = characters.join("");
    password.dispatchEvent(new Event("input", { bubbles: true }));
});

languageToggle.addEventListener("click", () => {
    setLanguage(currentLanguage === "fr" ? "en" : "fr");
});

copy.addEventListener("click", async () => {
    const strings = translations[currentLanguage];
    if (!password.value) {
        copyStatus.textContent = strings.copyEmpty;
        return;
    }

    try {
        await navigator.clipboard.writeText(password.value);
        copyStatus.textContent = translations[currentLanguage].copySuccess;
    } catch {
        copyStatus.textContent = translations[currentLanguage].copyFailure;
    }
});

password.addEventListener("input", () => {
    copyStatus.textContent = "";
    updateStrength();
});

eye.addEventListener("click", () => {
    password.type = password.type === "password" ? "text" : "password";
    const strings = translations[currentLanguage];
    eye.setAttribute("aria-label", password.type === "password" ? strings.showPassword : strings.hidePassword);
});

setLanguage(currentLanguage);