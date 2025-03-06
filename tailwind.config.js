/** @type {import('tailwindcss').Config} */
import nativewind from "nativewind/preset";

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [nativewind],
  theme: {
    extend: {},
  },
  plugins: [],
};
