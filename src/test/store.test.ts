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

test("setJobLogs updates job logs", async () => {
    const { result } = renderHook(() => useRecipeStore());

    const recipeId = INITIAL_RECIPE_ID;
    await result.current.selectRecipe(recipeId);

    const logs = "Some Error Message";

    act(() => {
        result.current.setJobLogs(logs);
    });

    expect(result.current.packingResults[recipeId].jobLogs).toBe(logs);
});

test("setJobId updates job ID", async () => {
    const { result } = renderHook(() => useRecipeStore());

    const recipeId = INITIAL_RECIPE_ID;
    await result.current.selectRecipe(recipeId);

    const jobId = "job-123";

    act(() => {
        result.current.setJobId(jobId);
    });

    expect(result.current.packingResults[recipeId].jobId).toBe(jobId);
});

test("setPackingResults updates packing results", async () => {
    const { result } = renderHook(() => useRecipeStore());

    const recipeId = INITIAL_RECIPE_ID;
    await result.current.selectRecipe(recipeId);

    const packingResult = {
        jobId: "job-456",
        jobLogs: "Packing completed successfully.",
        resultUrl: "http://example.com/result",
        runTime: 120,
        outputDir: "/output/dir",
    };

    act(() => {
        result.current.setPackingResults(packingResult);
    });

    expect(result.current.packingResults[recipeId]).toEqual(packingResult);
});
