/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*!(test.|spec.).{html,ts,tsx,js,jsx}"],
  theme: {
    extend: {
      spacing: {
        DEFAULT: "1rem",
      },
      colors: {
        highlight: {
          DEFAULT: "#0F97A6",
          100: "#021517",
          200: "#05353A",
          300: "#09555D",
          400: "#0C7580",
          500: "#0F97A6",
          600: "#15D0E4",
          700: "#52DFEF",
          800: "#93EBF5",
          900: "#D4F7FB",
          contrast: "#fff",
        },
        secondary: {
          DEFAULT: "#F2BB16",
          100: "#241B02",
          200: "#5A4405",
          300: "#8F6D08",
          400: "#C5970B",
          500: "#F2BB16",
          600: "#F4CA49",
          700: "#F7D87B",
          800: "#FAE7AC",
          900: "#FDF5DE",
        },
        primary: {
          DEFAULT: "#D96690",
          100: "#250913",
          200: "#5C1730",
          300: "#93254D",
          400: "#CA326A",
          500: "#D96690",
          600: "#E188A9",
          700: "#E9A9C0",
          800: "#F2C9D8",
          900: "#FAE9EF",
        },
      },
    },
    borderRadius: {
      DEFAULT: ".5rem",
      full: "100%",
      4: "1rem",
      5: "1.25rem",
      6: "1.5rem",
    },
    borderWidth: {
      DEFAULT: "2px",
      thick: "4px",
    },
  },
  plugins: [],
};
