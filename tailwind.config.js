/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#FF8D8D",
				secondary: {
					100: "#F7F7F7",
					200: "#EDEDED",
					300: "#DFDFDF",
				},
			},
		},
	},
	plugins: [],
};
