// ========================================
// PERFUME DETECTOR — APP LOGIC
// ========================================

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/ZHzo1MmMx/";

// Mapping from model labels to display info
const PERFUME_DATA = {
    "another 13": {
        fullName: "Another 13 by Le Labo",
        emoji: "🖤",
        notes: [
            "mysterious & magnetic... you're that person everyone wants to sit next to 😏",
            "giving \"I have a secret\" energy and honestly? we're intrigued 🕯️",
            "you walked in and the whole room just got darker (in a hot way) 🌑",
            "main character who doesn't even try… sickening 💀",
            "someone call the fire department because this scent is DANGEROUS 🔥",
            "you smell like expensive mistakes and zero regrets 😈"
        ],
        barClass: "bar-another13"
    },
    "cherry punk": {
        fullName: "Cherry Punk by Room 1015",
        emoji: "🍒",
        notes: [
            "feeling fun n flirty today huh 😏",
            "cherry on top of an already iconic outfit tbh 🍒",
            "you're giving rebel with great taste 🎸",
            "punk rock princess who also moisturizes — respect 💅",
            "this scent screams \"I do what I want\" and we love that for you 🤘",
            "sweet but make it spicy… a vibe honestly 🌶️"
        ],
        barClass: "bar-cherrypunk"
    },
    "nectarine + honey": {
        fullName: "Nectarine Blossom & Honey by Jo Malone",
        emoji: "🍑",
        notes: [
            "sweet, sunny, & absolutely golden — main character energy ☀️",
            "you literally smell like a perfect summer day 🌸",
            "cottagecore queen who somehow also has her life together 🐝",
            "if sunshine were a person it would steal YOUR perfume 🌞",
            "giving garden party but make it fashion 🦋",
            "you are the human version of golden hour 🍯"
        ],
        barClass: "bar-nectarine"
    },
    "you": {
        fullName: "You by Glossier",
        emoji: "💗",
        notes: [
            "clean girl aesthetic unlocked… we see you 🫧✨",
            "effortlessly cool and you KNOW it 💅",
            "smelling like you just left a really aesthetic café ☕",
            "\"I woke up like this\" personified tbh 🪞",
            "soft launch energy… mysterious but make it cozy 🌙",
            "you're the friend everyone wants to borrow perfume from 💕"
        ],
        barClass: "bar-you"
    }
};

// State
let model, webcam, maxPredictions;
let isPopupShowing = false;
let popupTimeout = null;

// DOM
const webcamCanvas = document.getElementById("webcam-canvas");
const webcamPlaceholder = document.getElementById("webcam-placeholder");
const predictionsContainer = document.getElementById("predictions-container");
const popup = document.getElementById("perfume-popup");
const popupName = document.getElementById("popup-name");
const popupNote = document.getElementById("popup-note");
const popupEmoji = document.getElementById("popup-emoji");
const loadingOverlay = document.getElementById("loading-overlay");

// Confidence threshold — triggers popup
const CONFIDENCE_THRESHOLD = 0.80;
// How many consecutive frames above threshold before triggering
const FRAMES_REQUIRED = 15;

let frameCounts = {};

// ── Initialization ──────────────────────────
async function init() {
    try {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Setup webcam
        const flip = true;
        webcam = new tmImage.Webcam(320, 320, flip);
        await webcam.setup();
        await webcam.play();

        // Attach webcam canvas
        const canvas = webcam.canvas;
        canvas.style.cssText = webcamCanvas.style.cssText +
            "position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:1;border-radius:20px;display:block;";
        webcamCanvas.parentNode.replaceChild(canvas, webcamCanvas);

        // Hide placeholder
        webcamPlaceholder.style.display = "none";

        // Build prediction bars
        buildPredictionBars();

        // Init frame counts
        for (const label of Object.keys(PERFUME_DATA)) {
            frameCounts[label] = 0;
        }

        // Hide loading
        loadingOverlay.classList.add("hidden");

        // Start loop
        window.requestAnimationFrame(loop);
    } catch (err) {
        console.error("Init error:", err);
        loadingOverlay.querySelector(".loading-text").textContent =
            "oops — couldn't access camera. please allow camera permissions and refresh!";
        loadingOverlay.querySelector(".loading-spinner").style.display = "none";
    }
}

function buildPredictionBars() {
    predictionsContainer.innerHTML = "";
    const labels = ["another 13", "cherry punk", "nectarine + honey", "you"];
    const displayNames = {
        "another 13": "Another 13",
        "cherry punk": "Cherry Punk",
        "nectarine + honey": "Nectarine + Honey",
        "you": "Glossier You"
    };

    labels.forEach(label => {
        const data = PERFUME_DATA[label];
        const row = document.createElement("div");
        row.className = "prediction-row";

        row.innerHTML = `
            <div class="prediction-label">${displayNames[label]}</div>
            <div class="prediction-bar-wrapper">
                <div class="prediction-bar-fill ${data.barClass}" id="bar-${label}" style="width: 0%"></div>
            </div>
            <div class="prediction-percent" id="pct-${label}">0%</div>
        `;
        predictionsContainer.appendChild(row);
    });
}

// ── Main Loop ──────────────────────────
async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const predictions = await model.predict(webcam.canvas);

    predictions.forEach(pred => {
        const label = pred.className;
        const prob = pred.probability;
        const pct = Math.round(prob * 100);

        // Update bar
        const bar = document.getElementById(`bar-${label}`);
        const pctEl = document.getElementById(`pct-${label}`);
        if (bar) bar.style.width = pct + "%";
        if (pctEl) pctEl.textContent = pct + "%";

        // Track confidence frames
        if (PERFUME_DATA[label]) {
            if (prob >= CONFIDENCE_THRESHOLD) {
                frameCounts[label]++;
            } else {
                frameCounts[label] = 0;
            }
        }
    });

    // Check if any perfume has enough consecutive frames
    if (!isPopupShowing) {
        for (const [label, count] of Object.entries(frameCounts)) {
            if (count >= FRAMES_REQUIRED) {
                showPopup(label);
                // Reset all counts
                for (const key of Object.keys(frameCounts)) frameCounts[key] = 0;
                break;
            }
        }
    }
}

// ── Popup ──────────────────────────
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function showPopup(label) {
    const data = PERFUME_DATA[label];
    if (!data) return;

    isPopupShowing = true;

    popupEmoji.textContent = data.emoji;
    popupName.textContent = data.fullName;
    popupNote.textContent = pickRandom(data.notes);

    popup.classList.add("visible");

    // Auto-dismiss after 5 seconds
    if (popupTimeout) clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => {
        popup.classList.remove("visible");
        isPopupShowing = false;
    }, 5000);
}

// Click to dismiss popup early
popup.addEventListener("click", () => {
    if (popupTimeout) clearTimeout(popupTimeout);
    popup.classList.remove("visible");
    isPopupShowing = false;
});

// ── Start ──────────────────────────
init();
