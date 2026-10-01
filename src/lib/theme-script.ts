/** Runs before paint so the saved or system theme never flashes. */
export const themeScript = `try{var t=localStorage.getItem("meteo:theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;
