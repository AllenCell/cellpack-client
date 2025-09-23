import { ConfigProvider } from "antd";
import { useState, useEffect, useMemo } from "react";
import { darkTheme, lightTheme } from "./theme";

export function ThemeRoot({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(
        () => window.matchMedia?.("(prefers-color-scheme: dark)").matches
    );
    useEffect(() => {
        const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
        const on = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mq?.addEventListener?.("change", on);
        return () => mq?.removeEventListener?.("change", on);
    }, []);
    const themeConfig = useMemo(
        () => (isDark ? darkTheme : lightTheme),
        [isDark]
    );
    return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
}