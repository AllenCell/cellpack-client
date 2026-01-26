import { act, renderHook } from "@testing-library/react";
import { expect, test } from "vitest";
import { useRecipeStore, INITIAL_RECIPE_ID  } from "../state/store";
import { EMPTY_PACKING_RESULT } from "../state/constants";


test("recipeStore loads default state", () => {
    const { result } = renderHook(() => useRecipeStore());
    const store = result.current;

    expect(store.selectedRecipeId).toBe(INITIAL_RECIPE_ID);
    expect(store.isPacking).toBe(false);
    expect(store.recipes).toBeDefined();
    expect(store.inputOptions).toBeDefined();
    expect(store.packingResults).toBeDefined();
    expect(store.packingResults[INITIAL_RECIPE_ID]).toEqual(EMPTY_PACKING_RESULT);
});

test("selectedRecipeId defaults to INITIAL_RECIPE_ID when invalid id selected", () => {
    const { result } = renderHook(() => useRecipeStore());
    const store = result.current;

    act(() => {
        store.selectRecipe("non-existent-recipe-id");
    });

    expect(store.selectedRecipeId).toBe(INITIAL_RECIPE_ID);
});

test("recipeStore loads all recipes", async () => {
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

test("editRecipe updates recipe object", async () => {
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

test("restoreRecipeDefault resets recipe to initial state", async () => {
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

test("editing one recipe does not affect others", async () => {
    const { result } = renderHook(() => useRecipeStore());

    const recipeId1 = INITIAL_RECIPE_ID;

    // Select a different recipe ID for recipeId2
    const recipeId2 = Object.keys(result.current.inputOptions)[1];

    await result.current.selectRecipe(recipeId1);
    const path = "composition.membrane.count";
    const initialCount = 1;
    expect(result.current.getCurrentValue(path)).toBe(initialCount);

    await result.current.selectRecipe(recipeId2);
    expect(result.current.getCurrentValue(path)).toBe(initialCount);

    const newValue1 = 5;
    await result.current.selectRecipe(recipeId1);
    act(() => {
        result.current.editRecipe(recipeId1, path, newValue1);
    });
    expect(result.current.getCurrentValue(path)).toBe(newValue1);

    // Switch back to recipeId2 and verify its value is unchanged
    await result.current.selectRecipe(recipeId2);
    expect(result.current.getCurrentValue(path)).toBe(initialCount);

    // Switch back to recipeId1 and verify its value is the edited one
    await result.current.selectRecipe(recipeId1);
    expect(result.current.getCurrentValue(path)).toBe(newValue1);
});

test("setJobId updates job ID for current recipe", async () => {
    const { result } = renderHook(() => useRecipeStore());

    const recipeId = INITIAL_RECIPE_ID;
    await result.current.selectRecipe(recipeId);

    const jobId = "job-123";

    act(() => {
        result.current.setJobId(jobId);
    });

    expect(result.current.packingResults[recipeId].jobId).toBe(jobId);

    for (const recipeId of Object.keys(result.current.inputOptions)) {
        if (recipeId !== INITIAL_RECIPE_ID) {
            // No other job ids should have been updated to `jobId`
            expect(result.current.packingResults[recipeId]?.jobId).not.toBe(jobId);
        }
    }
});

test("setPackingResults updates packing results for current recipe", async () => {
    const { result } = renderHook(() => useRecipeStore());

    const recipeId = INITIAL_RECIPE_ID;
    await result.current.selectRecipe(recipeId);

    const packingResult = {
        jobId: "job-456",
        jobLogs: "Packing completed successfully.",
        resultUrl: "http://example.com/result",
        runTime: 120,
        outputDir: "/output/dir",
        edits: {}
    };

    act(() => {
        result.current.setPackingResults(packingResult);
    });

    expect(result.current.packingResults[recipeId]).toEqual(packingResult);

    for (const recipeId of Object.keys(result.current.inputOptions)) {
        if (recipeId !== INITIAL_RECIPE_ID) {
            // No other packing results should have been updated to `packingResult`
            expect(result.current.packingResults[recipeId]).not.toEqual(packingResult);
        }
    }
});
