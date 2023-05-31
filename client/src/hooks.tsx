import useLocalStorage from "use-local-storage";

export function useTheme() {
    const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');
    document.body.dataset.theme = theme;

    const switchTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    return { theme, switchTheme, setTheme }
}

export function usePhaseColors() {
    const element = document.documentElement;
    const l1Color = getComputedStyle(element).getPropertyValue('--l1-color');
    const l2Color = getComputedStyle(element).getPropertyValue('--l2-color');
    const l3Color = getComputedStyle(element).getPropertyValue('--l3-color');
    return {
        l1Color, l2Color, l3Color
    }
}