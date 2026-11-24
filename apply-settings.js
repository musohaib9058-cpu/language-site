// Applies the user's saved settings (text size and high contrast) on every page.

function readSetting(name) {
  try {
    return localStorage.getItem(name);
  } catch (error) {
    return null; // storage blocked: just use the normal look
  }
}

function applySettings() {
  const root = document.documentElement;
  root.classList.remove("text-large", "text-xlarge", "high-contrast");

  const size = readSetting("textSize");
  if (size === "large") root.classList.add("text-large");
  if (size === "xlarge") root.classList.add("text-xlarge");

  if (readSetting("highContrast") === "on") root.classList.add("high-contrast");
}

applySettings();