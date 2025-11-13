import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { isEqual, get as lodashGet } from "lodash-es";
import { PackingResult, RecipeData, RecipeManifest } from "../types";
import { jsonToString } from "../utils/recipeLoader";
import { getRecipeDataFromFirebase, getRecipesFromFirebase } from "../utils/firebase";
import { EMPTY_PACKING_RESULT } from "./constants";
import { applyChangesToNestedObject } from "./utils";

export interface RecipeState {
    selectedRecipeId: string;
    inputOptions: Record<string, RecipeManifest>;
    recipes: Record<string, RecipeData>;
    packingResults: Record<string, PackingResult>;
}

export interface UIState {
    isLoading: boolean;
    isPacking: boolean;
}

type Actions = {
    loadInputOptions: () => Promise<void>;
    loadRecipe: (recipeId: string) => Promise<void>;
    loadAllRecipes: () => Promise<void>;
    selectRecipe: (recipeId: string) => Promise<void>;
    editRecipe: (recipeID: string, path: string, value: string | number) => void;
    restoreRecipeDefault: (recipeId: string) => void;
    getCurrentValue: (path: string) => string | number | undefined;
    getOriginalValue: (path: string) => string | number | undefined;
    startPacking: (
        callback: (
            recipeId: string,
            configId: string,
            recipeString: string
        ) => Promise<void>
    ) => Promise<void>;
    setPackingResults: (results: PackingResult) => void;
    setJobLogs: (logs: string) => void;
    setJobId: (jobId: string) => void;
};

export type RecipeStore = RecipeState & UIState & Actions;

const INITIAL_RECIPE_ID = "peroxisome_v_gradient_packing";

const initialState: RecipeState & UIState = {
    selectedRecipeId: INITIAL_RECIPE_ID,
    inputOptions: {},
    recipes: {},
    isLoading: false,
    isPacking: false,
    packingResults: { [INITIAL_RECIPE_ID]: EMPTY_PACKING_RESULT },
};

export const useRecipeStore = create<RecipeStore>()(
    subscribeWithSelector((set, get) => ({
        ...initialState,

        loadInputOptions: async () => {
            set({ isLoading: true });
            try {
                const inputOptions = await getRecipesFromFirebase();
                set({ inputOptions });
            } finally {
                set({ isLoading: false });
            }
        },

        loadRecipe: async (recipeId) => {
            if (get().recipes[recipeId]) return;
            const rec = await getRecipeDataFromFirebase(recipeId);
            set((s) => ({
                recipes: {
                    ...s.recipes,
                    [recipeId]: rec
                },
            }));
        },

        loadAllRecipes: async () => {
            const { inputOptions, recipes, loadRecipe } = get();

            const ids = new Set<string>();
            Object.values(inputOptions).forEach((opt) => {
                if (opt?.recipeId) ids.add(opt.recipeId);
            });
            const recipesToLoad = [...ids].filter((id) => !recipes[id]);
            if (!recipesToLoad.length) return;
            set({ isLoading: true });
            try {
                await Promise.all(recipesToLoad.map((id) => loadRecipe(id)));
            } finally {
                set({ isLoading: false });
            }
            let recipeToLoad = INITIAL_RECIPE_ID;
            if (!get().recipes[INITIAL_RECIPE_ID]) {
                console.warn(
                    `Initial recipe ID ${INITIAL_RECIPE_ID} not found, selecting first available recipe.`
                );
                recipeToLoad = Object.keys(get().recipes)[0];
            }
            get().selectRecipe(recipeToLoad);
        },

        selectRecipe: async (recipeId) => {
            const sel = get().inputOptions[recipeId];
            if (!sel) return;

            set({
                selectedRecipeId: recipeId,
            });

            if (sel.recipeId && !get().recipes[sel.recipeId]) {
                await get().loadRecipe(sel.recipeId);
            }
        },

        setPackingResults: (results: PackingResult) => {
            const currentRecipeId = get().selectedRecipeId;
            set({
                packingResults: {
                    ...get().packingResults,
                    [currentRecipeId]: results,
                },
            });
        },

        setJobLogs: (logs: string) => {
            const currentRecipeId = get().selectedRecipeId;
            set({
                packingResults: {
                    ...get().packingResults,
                    [currentRecipeId]: {
                        ...get().packingResults[currentRecipeId],
                        jobLogs: logs,
                    },
                },
            });
        },

        setJobId: (jobId: string) => {
            const currentRecipeId = get().selectedRecipeId;
            set({
                packingResults: {
                    ...get().packingResults,
                    [currentRecipeId]: {
                        ...get().packingResults[currentRecipeId],
                        jobId: jobId,
                    },
                },
            });
        },


        editRecipe: (recipeId, path, value) => {
            const rec = get().recipes[recipeId];
            if (!rec) return;

            const newEdits = { ...rec.edits };

            const defaultValue = lodashGet(rec.defaultRecipeData, path);
            if (isEqual(defaultValue, value)) {
                delete newEdits[path]; // no longer different from default
            } else {
                newEdits[path] = value;
            }

            set((state) => ({
                recipes: {
                    ...state.recipes,
                    [recipeId]: {
                        ...rec,
                        edits: newEdits
                    },
                },
            }));
        },


        getCurrentValue: (path) => {
            const { selectedRecipeId, recipes } = get();
            const rec = recipes[selectedRecipeId];
            if (!rec) return undefined;

            // First check if an edited value exists at this path
            const editedValue = lodashGet(rec.edits, path);
            if (editedValue !== undefined) {
                if (typeof editedValue === "string" || typeof editedValue === "number") {
                    return editedValue;
                }
                return undefined;
            }

            // Otherwise, fall back to the default recipe
            const defaultValue = lodashGet(rec.defaultRecipeData, path);
            if (typeof defaultValue === "string" || typeof defaultValue === "number") {
                return defaultValue;
            }

            return undefined;
        },

        getOriginalValue: (path) => {
            const { selectedRecipeId, recipes } = get();
            const rec = recipes[selectedRecipeId]?.defaultRecipeData;
            if (!rec) return undefined;
            const v = lodashGet(rec, path);
            return (typeof v === "string" || typeof v === "number") ? v : undefined;
        },

        startPacking: async (callback) => {
            const s = get();
            const input = s.inputOptions[s.selectedRecipeId];
            const configId = input?.configId ?? "";
            const { defaultRecipeData, edits } = s.recipes[s.selectedRecipeId];
            const recipeObject = applyChangesToNestedObject(defaultRecipeData, edits);
            if (!recipeObject) return;
            const recipeString = jsonToString(recipeObject);
            set({ isPacking: true });
            try {
                await callback(s.selectedRecipeId, configId, recipeString);
            } finally {
                set({ isPacking: false });
            }
        },

        restoreRecipeDefault: (recipeId) => {
            set(state => {
                const rec = state.recipes[recipeId];
                if (!rec) return {};
                return {
                    recipes: {
                        ...state.recipes,
                        [recipeId]: {
                            ...rec,
                            edits: {},
                        },
                    },
                };
            });
        },

    }))
);


// Basic selectors
export const useSelectedRecipeId = () => useRecipeStore(s => s.selectedRecipeId);
export const useInputOptions = () => useRecipeStore((s) => s.inputOptions);
export const useIsLoading = () => useRecipeStore(s => s.isLoading);
export const useIsPacking = () => useRecipeStore(s => s.isPacking);
export const useFieldsToDisplay = () =>
    useRecipeStore((s) => s.inputOptions[s.selectedRecipeId]?.editableFields);
export const useRecipes = () => useRecipeStore(s => s.recipes)
export const usePackingResults = () => useRecipeStore(s => s.packingResults);

export const useCurrentRecipeObject = () => {
    const recipe = useCurrentRecipeData();
    return recipe ? applyChangesToNestedObject(recipe.defaultRecipeData, recipe.edits) : undefined;
}

const useCurrentRecipeManifest = () => {
    const selectedRecipeId = useSelectedRecipeId();
    const inputOptions = useInputOptions();
    if (!selectedRecipeId) return undefined;
    return inputOptions[selectedRecipeId];
};

export const useCurrentRecipeData = () => {
    const selectedRecipeId = useSelectedRecipeId();
    const recipes = useRecipes();
    return recipes[selectedRecipeId] || undefined;
}

const useCurrentPackingResult = () => {
    const selectedRecipeId = useSelectedRecipeId();
    const packingResults = usePackingResults();
    return (
        packingResults[selectedRecipeId] || EMPTY_PACKING_RESULT
    );
};

const useDefaultResultPath = () => {
    const manifest = useCurrentRecipeManifest();
    return manifest?.defaultResultPath || "";
};

export const useRunTime = () => {
    const results = useCurrentPackingResult();
    return results.runTime;
};

export const useJobLogs = () => {
    const results = useCurrentPackingResult();
    return results.jobLogs;
};

export const useJobId = () => {
    const results = useCurrentPackingResult();
    return results.jobId;
};

export const useOutputsDirectory = () => {
    const results = useCurrentPackingResult();
    return results.outputDir;
};

export const useResultUrl = () => {
    const results = useCurrentPackingResult();
    const currentRecipeId = useSelectedRecipeId();
    const defaultResultPath = useDefaultResultPath();
    let path = "";
    if (results.resultUrl) {
        path = results.resultUrl;
    } else if (currentRecipeId) {
        path = defaultResultPath;
    }
    return path;
};

// Action selectors
export const useLoadInputOptions = () =>
    useRecipeStore((s) => s.loadInputOptions);
export const useLoadAllRecipes = () => useRecipeStore((s) => s.loadAllRecipes);
export const useSelectRecipe = () => useRecipeStore((s) => s.selectRecipe);
export const useEditRecipe = () => useRecipeStore(s => s.editRecipe);
export const useRestoreRecipeDefault = () =>
    useRecipeStore((s) => s.restoreRecipeDefault);
export const useStartPacking = () => useRecipeStore((s) => s.startPacking);
export const useGetCurrentValue = () =>
    useRecipeStore((s) => s.getCurrentValue);
export const useGetOriginalValue = () =>
    useRecipeStore((s) => s.getOriginalValue);
export const useSetPackingResults = () =>
    useRecipeStore((s) => s.setPackingResults);
export const useSetJobLogs = () => useRecipeStore((s) => s.setJobLogs);
export const useSetJobId = () => useRecipeStore((s) => s.setJobId);
