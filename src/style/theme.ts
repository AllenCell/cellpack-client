// theme.ts
import type { ThemeConfig } from "antd";
import { theme } from "antd"; // algorithms

export const lightTheme: ThemeConfig = {
    algorithm: theme.defaultAlgorithm,
    token: {
        // Brand + base
        colorPrimary: "#646cff",
        colorInfo: "#646cff",
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
        borderRadius: 8,

        // Surface & text to match your CSS defaults
        colorBgBase: "#ffffff",
        colorTextBase: "#213547",

        // Subtle tweaks
        controlHeight: 36,
        wireframe: false,
    },
    components: {
        Button: {
            // match your button rounding & subtle borders
            borderRadius: 8,
            controlHeight: 40,
        },
        Layout: {
            headerBg: "#ffffff",
            bodyBg: "#ffffff",
            footerBg: "#ffffff",
        },
        Card: {
            borderRadiusLG: 12,
        },
        Modal: {
            borderRadiusLG: 12,
        },
        Input: {
            borderRadius: 8,
        },
        Select: {
            borderRadius: 8,
        },
        Slider: {
            handleSize: 12,
            trackBg: "#646cff",
        },
    },
};

export const darkTheme: ThemeConfig = {
    algorithm: theme.darkAlgorithm,
    token: {
        colorPrimary: "#8b91ff",
        colorInfo: "#8b91ff",
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
        borderRadius: 8,

        // Dark surfaces & readable text
        colorBgBase: "#0f1115",
        colorTextBase: "rgba(255,255,255,0.87)",

        controlHeight: 36,
        wireframe: false,
    },
    components: {
        Layout: {
            headerBg: "#0f1115",
            bodyBg: "#0f1115",
            footerBg: "#0f1115",
        },
        Card: {
            borderRadiusLG: 12,
        },
        Modal: {
            borderRadiusLG: 12,
        },
        Slider: {
            handleSize: 12,
        },
    },
};
