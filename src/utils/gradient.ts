import { GradientOption } from "../types";

interface GradientStrength {
    displayName: string;
    description: string;
    path: string;
    uiValue: number;
    min: number;
    max: number;
}

export const round2 = (n: number) => Number(n.toFixed(2));


/**
 * Derive the currently-selected gradient option from the store.
 *
 * Why this exists:
 * - All gradient options share the same recipe path (selectorPath).
 * - The recipe JSON in the store is the source of truth, so we must read
 *   the *current* value at that path every render (not just defaultValue).
 * - We then match that value against gradientOptions to get the full
 *   option object, which contains strength settings, etc.
 */
export function getSelectedGradient(
    gradientOptions: GradientOption[],
    defaultValue: string,
    getCurrentValue: (path: string) => unknown
): {

    currentGradient: string;
    selectedOption: GradientOption;
} {
    if (!gradientOptions.length) {
        return { currentGradient: defaultValue, selectedOption: { value: defaultValue, display_name: defaultValue, path: "" } as GradientOption };
    }

    // Determine current packing mode and filter options accorrdingly
    const modePath = gradientOptions[0].packing_mode_path ?? "";
    const rawMode = modePath ? getCurrentValue(modePath) : undefined;
    const currentMode = typeof rawMode === "string" ? rawMode : "gradient";
    const validOptions =
        gradientOptions.filter(o => o.packing_mode === currentMode);

    if (!validOptions.length) {
        // Fallback to default if no valid options
        return { currentGradient: defaultValue, selectedOption: { value: defaultValue, display_name: defaultValue, path: "" } as GradientOption };
    }

    // Shared selector path (all options for this control share it)
    const selectorPath = gradientOptions[0].path ?? "";

    // Current gradient string from store, or fallback to default
    const raw = selectorPath ? getCurrentValue(selectorPath) : undefined;
    const currentGradient = (typeof raw === "string" ? raw : defaultValue) ?? defaultValue;

    // The full option object for that value, or first as fallback
    const selectedOption =
        validOptions.find(o => o.value === currentGradient) ?? validOptions[0];

    return { currentGradient: selectedOption.value, selectedOption };
}


export function deriveGradientStrength(
    opt: GradientOption | undefined,
    getCurrentValue: (path: string) => unknown
): GradientStrength | undefined {
    if (!opt?.strength_path) return undefined;

    const storeMin = opt.strength_min ?? 0;
    const storeMax = opt.strength_max ?? 5;

    const uiMin = storeMin;
    const uiMax = storeMax;

    const clampUi = (v: number) => Math.min(uiMax, Math.max(uiMin, v));
    const storeRaw = getCurrentValue(opt.strength_path);
    const storeNum =
        typeof storeRaw === "number"
            ? storeRaw
            : opt.strength_default ?? storeMin;
    const uiValue = round2(clampUi(storeNum));
    const strengthDescription = opt.strength_description || "Smaller decay length indicates stronger bias"

    return {
        displayName: `Decay Length`,
        description: strengthDescription,
        path: opt.strength_path,
        uiValue,
        min: uiMin,
        max: uiMax,
    };
}