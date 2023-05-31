import useLocalStorage from "use-local-storage";

export function useTheme() {
    const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');
    document.body.dataset.theme = theme;

    const switchTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    return { theme, switchTheme, setTheme }
}
