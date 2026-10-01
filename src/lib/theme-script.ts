/**
 * Runs before paint: applies the saved or system theme so it never flashes,
 * and marks the intro as seen for this session (or skips it entirely under
 * reduced motion) so the splash only plays once.
 */
export const themeScript = `try{var d=document.documentElement,t=localStorage.getItem("meteo:theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))d.classList.add("dark");if(sessionStorage.getItem("meteo:intro")||matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("intro-seen");else sessionStorage.setItem("meteo:intro","1")}catch(e){}`;
