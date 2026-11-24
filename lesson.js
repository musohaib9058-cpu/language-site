// Makes the "Listen" buttons speak the word out loud.
// Works on every lesson page (Urdu, Hindi, Chinese, Japanese, English).

const statusBox = document.getElementById("speech-status");
let voices = [];

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