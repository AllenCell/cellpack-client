import type { ThemeConfig } from "antd";
import { theme } from "antd";

const commonComponents = {
    Button: {
        controlHeight: 40,
        colorFillSecondary: '#b5cffe',
        colorFillTertiary: '#e6f4ff',
        colorBgContainerDisabled: '#dcdde5',
        colorTextDisabled: '#989898',
    },
    Slider: {
        trackBg: '#7AA4D7',
        trackHoverBg: '#5F92CE',
        handleColor: '#7AA4D7',
        handleActiveColor: '#3378C4',
        handleColorDisabled: '#C6D2DE',
        trackBgDisabled: '#C6D2DE',
    },
    Tabs: {
        inkBarColor: '#468ADE',
        itemHoverColor: '#6BA0E5',
        titleFontSize: 18,
    },
    Tooltip: {
        colorTextLightSolid: '#000000',
        colorBgSpotlight: '#cbe3ff',
        boxShadowSecondary: '4px 3px 10px 0px #1F1F1FCC',
    }
};

const lightComponents = {
    ...commonComponents,
    Tabs: {
        ...commonComponents.Tabs,
        colorPrimary: '#000000',
    },
};

const darkComponents = {
    ...commonComponents,
    Button: {
        ...commonComponents.Button,
        defaultColor: '#e6f4ff',
        colorFillTertiary: '#1f3a5a',
        colorFillSecondary: '#2a4a6e',
        colorFill: '#365a82',
        colorBgContainerDisabled: '#1a1a1a',
        colorTextDisabled: '#595959',
    },
    Tabs: {
        ...commonComponents.Tabs,
        colorPrimary: '#ffffff',
    },
};

export const lightTheme: ThemeConfig = {
    algorithm: theme.defaultAlgorithm,
    token: {
        colorPrimary: "#646cff",
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
        borderRadius: 8,
        colorBgBase: "#ffffff",
        colorTextBase: "#213547",
    },
    components: {
        ...lightComponents,
        Layout: {
            headerBg: "#ffffff",
            bodyBg: "#ffffff",
        },
    },
};

export const darkTheme: ThemeConfig = {
    algorithm: theme.darkAlgorithm,
    token: {
        colorPrimary: "#8b91ff",
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
        borderRadius: 8,
        colorBgBase: "#0f1115",
        colorTextBase: "rgba(255,255,255,0.87)",
    },
    components: {
        ...darkComponents,
        Layout: {
            headerBg: "#0f1115",
            bodyBg: "#0f1115",
        },
    },
};
