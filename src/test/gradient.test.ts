import { expect, test } from "vitest";
import fs from "fs";
import { round2, getSelectedGradient, deriveGradientStrength } from "../utils/gradient";
import { GradientOption } from "../types";

test("round2 rounds numbers to 2 decimal places", () => {
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.235)).toBe(1.24);
    expect(round2(1.999)).toBe(2.0);
    expect(round2(0.001)).toBe(0.0);
    expect(round2(5)).toBe(5.0);
});

test("getSelectedGradient returns default when no options provided", () => {
    const getCurrentValue = () => undefined;
    const result = getSelectedGradient([], "default_value", getCurrentValue);
    
    expect(result.currentGradient).toBe("default_value");
    expect(result.selectedOption.value).toBe("default_value");
    expect(result.selectedOption.display_name).toBe("default_value");
});

test("getSelectedGradient selects first valid option when current value not found", () => {
    const gradientOptions: GradientOption[] = [
        {
            display_name: "Gradient A",
            value: "gradient_a",
            path: "objects.test.gradient",
            packing_mode: "gradient",
        },
        {
            display_name: "Gradient B",
            value: "gradient_b",
            path: "objects.test.gradient",
            packing_mode: "gradient",
        },
    ];
    const getCurrentValue = () => undefined;
    const result = getSelectedGradient(gradientOptions, "default", getCurrentValue);
    
    expect(result.currentGradient).toBe("gradient_a");
    expect(result.selectedOption.value).toBe("gradient_a");
    expect(result.selectedOption.display_name).toBe("Gradient A");
});

test("getSelectedGradient returns matching option when found in store", () => {
    const gradientOptions: GradientOption[] = [
        {
            display_name: "Gradient A",
            value: "gradient_a",
            path: "objects.test.gradient",
            packing_mode: "gradient",
        },
        {
            display_name: "Gradient B",
            value: "gradient_b",
            path: "objects.test.gradient",
            packing_mode: "gradient",
        },
    ];
    const getCurrentValue = (path: string) => {
        if (path === "objects.test.gradient") return "gradient_b";
        return undefined;
    };
    const result = getSelectedGradient(gradientOptions, "default", getCurrentValue);
    
    expect(result.currentGradient).toBe("gradient_b");
    expect(result.selectedOption.value).toBe("gradient_b");
    expect(result.selectedOption.display_name).toBe("Gradient B");
});

test("getSelectedGradient filters by packing mode", () => {
    const gradientOptions: GradientOption[] = [
        {
            display_name: "Random",
            value: "none",
            path: "objects.test.gradient",
            packing_mode: "random",
            packing_mode_path: "objects.test.packing_mode",
        },
        {
            display_name: "Gradient A",
            value: "gradient_a",
            path: "objects.test.gradient",
            packing_mode: "gradient",
            packing_mode_path: "objects.test.packing_mode",
        },
    ];
    const getCurrentValue = (path: string) => {
        if (path === "objects.test.packing_mode") return "random";
        return undefined;
    };
    const result = getSelectedGradient(gradientOptions, "default", getCurrentValue);
    
    expect(result.currentGradient).toBe("none");
    expect(result.selectedOption.display_name).toBe("Random");
});

test("deriveGradientStrength returns undefined when no strength path", () => {
    const option: GradientOption = {
        display_name: "Test Gradient",
        value: "test",
        path: "test.path",
    };
    const getCurrentValue = () => undefined;
    const result = deriveGradientStrength(option, getCurrentValue);
    
    expect(result).toBeUndefined();
});

test("deriveGradientStrength returns undefined when option is undefined", () => {
    const getCurrentValue = () => undefined;
    const result = deriveGradientStrength(undefined, getCurrentValue);
    
    expect(result).toBeUndefined();
});

test("deriveGradientStrength calculates strength with default values", () => {
    const option: GradientOption = {
        display_name: "Test Gradient",
        value: "test",
        path: "test.path",
        strength_path: "gradients.test.decay",
        strength_min: 0,
        strength_max: 10,
        strength_default: 5,
    };
    const getCurrentValue = () => undefined;
    const result = deriveGradientStrength(option, getCurrentValue);
    
    expect(result).toBeDefined();
    expect(result?.displayName).toBe("Decay Length");
    expect(result?.path).toBe("gradients.test.decay");
    expect(result?.uiValue).toBe(5.0);
    expect(result?.min).toBe(0);
    expect(result?.max).toBe(10);
});

test("deriveGradientStrength uses value from store", () => {
    const option: GradientOption = {
        display_name: "Test Gradient",
        value: "test",
        path: "test.path",
        strength_path: "gradients.test.decay",
        strength_min: 0,
        strength_max: 10,
        strength_default: 5,
    };
    const getCurrentValue = (path: string) => {
        if (path === "gradients.test.decay") return 7.5;
        return undefined;
    };
    const result = deriveGradientStrength(option, getCurrentValue);
    
    expect(result?.uiValue).toBe(7.5);
});

test("deriveGradientStrength clamps values to min/max", () => {
    const option: GradientOption = {
        display_name: "Test Gradient",
        value: "test",
        path: "test.path",
        strength_path: "gradients.test.decay",
        strength_min: 0,
        strength_max: 10,
    };
    const getCurrentValue = (path: string) => {
        if (path === "gradients.test.decay") return 15;
        return undefined;
    };
    const result = deriveGradientStrength(option, getCurrentValue);
    
    expect(result?.uiValue).toBe(10.0);
});

test("deriveGradientStrength uses custom description when provided", () => {
    const option: GradientOption = {
        display_name: "Test Gradient",
        value: "test",
        path: "test.path",
        strength_path: "gradients.test.decay",
        strength_description: "Custom description text",
    };
    const getCurrentValue = () => undefined;
    const result = deriveGradientStrength(option, getCurrentValue);
    
    expect(result?.description).toBe("Custom description text");
});

test("gradients recipe has correct structure", () => {
    const recipe = JSON.parse(fs.readFileSync("src/test/test-files/gradients.json", "utf8"));
    
    expect(recipe.name).toBe("gradients");
    expect(recipe.version).toBe("default");
    expect(recipe.format_version).toBe("2.0");
    expect(recipe.bounding_box).toEqual([
        [-100, -100, 0],
        [100, 100, 1]
    ]);
});

test("gradients recipe contains radial gradient with correct settings", () => {
    const recipe = JSON.parse(fs.readFileSync("src/test/test-files/gradients.json", "utf8"));
    
    expect(recipe.gradients?.radial_gradient).toBeDefined();
    expect(recipe.gradients?.radial_gradient.mode).toBe("radial");
    expect(recipe.gradients?.radial_gradient.weight_mode).toBe("cube");
    expect(recipe.gradients?.radial_gradient.pick_mode).toBe("rnd");
    expect(recipe.gradients?.radial_gradient.description).toBe("Radial gradient from the center");
    expect(recipe.gradients?.radial_gradient.mode_settings.radius).toBe(100);
    expect(recipe.gradients?.radial_gradient.mode_settings.center).toEqual([0, 0, 0]);
});

test("gradients recipe contains vector gradient with correct settings", () => {
    const recipe = JSON.parse(fs.readFileSync("src/test/test-files/gradients.json", "utf8"));
    
    expect(recipe.gradients?.vector_gradient).toBeDefined();
    expect(recipe.gradients?.vector_gradient.mode).toBe("vector");
    expect(recipe.gradients?.vector_gradient.weight_mode).toBe("cube");
    expect(recipe.gradients?.vector_gradient.pick_mode).toBe("rnd");
    expect(recipe.gradients?.vector_gradient.description).toBe("Gradient away from the plane formed by center and vector");
    expect(recipe.gradients?.vector_gradient.mode_settings.direction).toEqual([1, 1, 0]);
});

test("gradients recipe object uses gradient packing mode", () => {
    const recipe = JSON.parse(fs.readFileSync("src/test/test-files/gradients.json", "utf8"));
    
    expect(recipe.objects?.sphere).toBeDefined();
    expect(recipe.objects?.sphere.gradient).toBe("vector_gradient");
    expect(recipe.objects?.sphere.type).toBe("single_sphere");
    expect(recipe.objects?.sphere.radius).toBe(5);
    expect(recipe.objects?.base?.packing_mode).toBe("gradient");
});
