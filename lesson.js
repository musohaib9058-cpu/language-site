// Makes the "Listen" buttons speak the word out loud,
// and puts the learner's own name into the "My name is..." example.
// Works on every lesson page (Urdu, Hindi, Chinese, Japanese, English).

const statusBox = document.getElementById("speech-status");
let voices = [];

// ---------- 1. The learner's own name ----------

// Every way the example name "Sohaib" is written in the lessons
// (longer forms first, so "Sohaibu" is replaced before "Sohaib").
const EXAMPLE_NAME_FORMS = [
  " (the name is written in katakana)",
  "Sohaibu", "so-hai-boo", "soh-HAYB",
  "سہیب", "सोहैब", "ソハイブ", "Sohaib"
];

function readName() {
  try {
    const saved = localStorage.getItem("learnerName");
    return saved ? saved.trim() : "";
  } catch (error) {
    return "";
  }
}

function personaliseLesson() {
  const table = document.querySelector(".lesson-table");
  if (!table) return;

  const name = readName();
  const tip = document.createElement("p");
  tip.className = "name-tip";

  if (name === "") {
    tip.innerHTML =
      'Tip: "Sohaib" in this lesson is an example name. You can use your own name ' +
      'by adding it on the <a href="settings.html">Settings page</a>.';
    table.before(tip);
    return;
  }

  tip.innerHTML =
    'This lesson uses your name: <strong></strong>. You can change it on the ' +
    '<a href="settings.html">Settings page</a>.';
  tip.querySelector("strong").textContent = name;
  table.before(tip);

  function swapName(text) {
    let result = text;
    EXAMPLE_NAME_FORMS.forEach(function (form) {
      const replacement = form.startsWith(" (") ? "" : name;
      result = result.split(form).join(replacement);
    });
    return result;
  }

  // Change the visible words inside the table
  const walker = document.createTreeWalker(table, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    node.nodeValue = swapName(node.nodeValue);
  }

  // Change what the Listen buttons say and what screen readers announce
  table.querySelectorAll(".listen").forEach(function (button) {
    button.dataset.say = swapName(button.dataset.say);
    button.dataset.roman = swapName(button.dataset.roman);
    button.setAttribute("aria-label", swapName(button.getAttribute("aria-label")));
  });
}

personaliseLesson();

// ---------- 2. The Listen buttons ----------

// Browsers load their voices a moment after the page opens,
// so we keep the list up to date when they arrive.
function loadVoices() {
  voices = speechSynthesis.getVoices();
}
if ("speechSynthesis" in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

function findVoice(langCode) {
  const short = langCode.slice(0, 2).toLowerCase();
  return voices.find(function (voice) {
    return voice.lang.toLowerCase().startsWith(short);
  });
}

function isEdge() {
  return navigator.userAgent.includes("Edg/");
}

document.querySelectorAll(".listen").forEach(function (button) {
  button.addEventListener("click", function () {
    statusBox.textContent = "";

    // Some old browsers cannot speak at all
    if (!("speechSynthesis" in window)) {
      statusBox.textContent =
        "Sorry, your browser cannot play sound. Please use the 'How to say it' column.";
      return;
    }

    speechSynthesis.cancel();
    if (voices.length === 0) {
      loadVoices();
    }

    const voice = findVoice(button.dataset.lang);
    let speech;

    if (voice) {
      // A voice for this language is installed: say the real word
      speech = new SpeechSynthesisUtterance(button.dataset.say);
      speech.voice = voice;
      speech.lang = button.dataset.lang;
    } else if (voices.length === 0) {
      // Voices have not loaded yet: let the browser choose a voice by itself
      speech = new SpeechSynthesisUtterance(button.dataset.say);
      speech.lang = button.dataset.lang;
    } else {
      // Voices loaded, but none for this language: read the "How to say it" spelling
      speech = new SpeechSynthesisUtterance(button.dataset.roman);
      let message =
        "Your browser has no voice for this language, so the accent may sound wrong. ";
      if (!isEdge()) {
        message += "For a better voice, please open this website in Microsoft Edge. ";
      }
      message += "You can also read the 'How to say it' column.";
      statusBox.textContent = message;
    }

    speech.rate = 0.8; // a little slower, easier for learners
    speechSynthesis.speak(speech);
  });
});