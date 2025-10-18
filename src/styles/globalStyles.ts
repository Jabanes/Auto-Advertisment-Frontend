// src/styles/globalStyles.ts
export const applyGlobalStyles = () => {
  // --- Add Google Material Symbols font
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
  document.head.appendChild(link);

  // --- Force RTL direction at root level
  document.documentElement.setAttribute("dir", "rtl");
  document.documentElement.lang = "he";

  // --- Inject global CSS
  const style = document.createElement("style");
  style.innerHTML = `
    /* 🌍 Base resets */
    html, body, #root {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #f6f7f8;
      font-family: 'Heebo', 'Rubik', 'Assistant', 'Inter', sans-serif;
      direction: rtl;
      unicode-bidi: bidi-override;
      text-align: right;
    }

    /* 🧭 All elements respect RTL */
    * {
      box-sizing: border-box;
      direction: rtl;
    }

    /* 📝 Inputs, buttons, textareas align text correctly */
    input, textarea, button {
      direction: rtl;
      text-align: right;
      font-family: inherit;
    }

    /* 🎨 Material Symbols font (keep LTR for icons only) */
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr; /* ✅ icons must stay LTR */
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
      font-variation-settings:
        'FILL' 0,
        'wght' 400,
        'GRAD' 0,
        'opsz' 24;
    }
  `;
  document.head.appendChild(style);
};
