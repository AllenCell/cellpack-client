import type { ThemeConfig } from "antd";
import { theme } from "antd";
import {
    ALICE_BLUE,
    BATTLESHIP_GRAY,
    BDAZZLED_BLUE,
    BEAU_BLUE,
    BLEU_DE_FRANCE,
    CAROLINA_BLUE,
    DAVYS_GREY,
    DELFT_BLUE,
    EERIE_BLACK,
    HAWKES_BLUE,
    LAPIS_LAZULI,
    PLATINUM,
    POWDER_BLUE,
    RAISIN_BLACK,
    STEEL_BLUE,
    TUFTS_BLUE,
    VISTA_BLUE,
} from "./colors";

const commonComponents = {
    Button: {
        controlHeight: 40,
        colorFillSecondary: POWDER_BLUE,
        colorFillTertiary: ALICE_BLUE,
        colorBgContainerDisabled: PLATINUM,
        colorTextDisabled: BATTLESHIP_GRAY,
    },
    Slider: {
        trackBg: VISTA_BLUE,
        trackHoverBg: STEEL_BLUE,
        handleColor: VISTA_BLUE,
        handleActiveColor: TUFTS_BLUE,
        handleColorDisabled: BEAU_BLUE,
        trackBgDisabled: BEAU_BLUE,
    },
    Tabs: {
        inkBarColor: BLEU_DE_FRANCE,
        itemHoverColor: CAROLINA_BLUE,
        titleFontSize: 18,
    },
    Tooltip: {
        colorTextLightSolid: '#000000',
        colorBgSpotlight: HAWKES_BLUE,
        boxShadowSecondary: `4px 3px 10px 0px ${EERIE_BLACK}CC`,
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
        defaultColor: ALICE_BLUE,
        colorFillTertiary: DELFT_BLUE,
        colorFillSecondary: BDAZZLED_BLUE,
        colorFill: LAPIS_LAZULI,
        colorBgContainerDisabled: RAISIN_BLACK,
        colorTextDisabled: DAVYS_GREY,
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
