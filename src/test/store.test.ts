import { act, renderHook } from "@testing-library/react";
import { expect, test } from "vitest";
import { useRecipeStore, INITIAL_RECIPE_ID } from "../state/store";
import { EMPTY_PACKING_RESULT } from "../state/constants";


test("should load default state", () => {
    const { result } = renderHook(() => useRecipeStore());
    const store = result.current;

    expect(store.selectedRecipeId).toBe(INITIAL_RECIPE_ID);
    expect(store.isPacking).toBe(false);
    expect(store.recipes).toBeDefined();
    expect(store.inputOptions).toBeDefined();
    expect(store.packingResults).toBeDefined();
    expect(store.packingResults[INITIAL_RECIPE_ID]).toEqual(EMPTY_PACKING_RESULT);
});

test("should default to INITIAL_RECIPE_ID for invalid id", () => {
    const { result } = renderHook(() => useRecipeStore());
    const store = result.current;

    act(() => {
        store.selectRecipe("non-existent-recipe-id");
    });

    expect(store.selectedRecipeId).toBe(INITIAL_RECIPE_ID);
});

test("should load all recipes", async () => {
    const { result } = renderHook(() => useRecipeStore());

    await result.current.loadInputOptions();
    await result.current.loadAllRecipes();

    expect(Object.keys(result.current.inputOptions)).toHaveLength(5);

    for (const recipeId of Object.keys(result.current.inputOptions)) {
        await result.current.selectRecipe(recipeId);
        expect(result.current.recipes[recipeId]).toBeDefined();
        expect(result.current.recipes[recipeId].recipeId).toBe(recipeId);
        expect(result.current.selectedRecipeId).toBe(recipeId);
    }
    expect(Object.keys(result.current.recipes)).toHaveLength(5);
});

test("should update recipe object", async () => {
    const { result } = renderHook(() => useRecipeStore());

    const recipeId = INITIAL_RECIPE_ID;
    await result.current.selectRecipe(recipeId);

    const path = "composition.membrane.count";
    const initialValue = 1;
    expect(result.current.getCurrentValue(path)).toBe(initialValue);

    const newValue = 3;
    act(() => {
        result.current.editRecipe(recipeId, path, newValue);
    });
    expect(result.current.getCurrentValue(path)).toBe(newValue);
});

test("should restore recipe object to default", async () => {
    const { result } = renderHook(() => useRecipeStore());

    const recipeId = INITIAL_RECIPE_ID;
    await result.current.selectRecipe(recipeId);

    const path = "composition.membrane.count";
    const initialValue = 1;

    act(() => {
        result.current.editRecipe(recipeId, path, 6);
        result.current.restoreRecipeDefault(recipeId);
    });
    expect(result.current.getCurrentValue(path)).toBe(initialValue);
});
