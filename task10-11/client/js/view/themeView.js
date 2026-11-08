import { el } from "./dom.js";

export const themeView = {
  apply(theme) {
    const dark = theme === "dark";
    document.body.classList.toggle("dark", dark);
    el.themeIconMoon.hidden = dark;
    el.themeIconSun.hidden = !dark;
  },
};
