import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { get as lodashGet, set as lodashSet } from "lodash-es";
import { PackingResults, RecipeManifest } from "../types";
import { getFirebaseRecipe, jsonToString } from "../utils/recipeLoader";
import { getPackingInputsDict } from "../utils/firebase";
import { EMPTY_PACKING_RESULTS } from "./constants";

export interface RecipeData {
    id: string;
    originalString: string;
    currentString: string;
    isModified: boolean;
}

export interface RecipeState {
    selectedRecipeId: string;
    inputOptions: Record<string, RecipeManifest>;
    recipes: Record<string, RecipeData>;
    packingResults: PackingResults;
}

export interface UIState {
    isLoading: boolean;
    isPacking: boolean;
}

type Actions = {
    loadInputOptions: () => Promise<void>;
    loadAllRecipes: () => Promise<void>;
    selectRecipe: (inputName: string) => Promise<void>;
    loadRecipe: (recipeId: string) => Promise<void>;
    updateRecipeString: (recipeId: string, newString: string) => void;
    updateRecipeObj: (
        recipeId: string,
        updates: Record<string, string | number>
    ) => void;
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
    setPackingResults: (results: PackingResults) => void;
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
    packingResults: { ...EMPTY_PACKING_RESULTS },
};

export const useRecipeStore = create<RecipeStore>()(
    subscribeWithSelector((set, get) => ({
        ...initialState,

        loadInputOptions: async () => {
            set({ isLoading: true });
            try {
                const inputOptions = await getPackingInputsDict();
                set({ inputOptions });
            } finally {
                set({ isLoading: false });
            }
        },

        loadRecipe: async (recipeId) => {
            if (get().recipes[recipeId]) return;
            const recJson = await getFirebaseRecipe(recipeId);
            const recStr = jsonToString(recJson);
            set((s) => ({
                recipes: {
                    ...s.recipes,
                    [recipeId]: {
                        id: recipeId,
                        originalString: recStr,
                        currentString: recStr,
                        isModified: false,
                    },
                },
            }));
        },

        loadAllRecipes: async () => {
            const { inputOptions, recipes, loadRecipe } = get();

            const ids = new Set<string>();
            Object.values(inputOptions).forEach((opt) => {
                if (opt?.recipe) ids.add(opt.recipe);
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
            get().setPackingResults({ ...EMPTY_PACKING_RESULTS });

            const sel = get().inputOptions[recipeId];
            if (!sel) return;

            set({
                selectedRecipeId: recipeId,
            });

            if (sel.recipe && !get().recipes[sel.recipe]) {
                await get().loadRecipe(sel.recipe);
            }
        },

        setPackingResults: (results: PackingResults) => {
            set({ packingResults: results });
        },

        setJobLogs: (logs: string) => {
            set({
                packingResults: {
                    ...get().packingResults,
                    jobLogs: logs,
                },
            });
        },

        setJobId: (jobId: string) => {
            set({
                packingResults: {
                    ...get().packingResults,
                    jobId: jobId,
                },
            });
        },

        updateRecipeString: (recipeId, newString) => {
            set((s) => {
                const rec = s.recipes[recipeId];
                if (!rec) return s;
                return {
                    recipes: {
                        ...s.recipes,
                        [recipeId]: {
                            ...rec,
                            currentString: newString,
                            isModified: newString !== rec.originalString,
                        },
                    },
                };
            });
        },

        updateRecipeObj: (recipeId, updates) => {
            const rec = get().recipes[recipeId];
            if (!rec) return;

            try {
                const obj = JSON.parse(rec.currentString);

                for (const [path, value] of Object.entries(updates)) {
                    lodashSet(obj, path, value);
                }
                get().updateRecipeString(
                    recipeId,
                    JSON.stringify(obj, null, 2)
                );
            } catch {
                // TODO: better error handling
                console.warn("Failed to update recipe object");
            }
        },

        restoreRecipeDefault: (recipeId) => {
            const rec = get().recipes[recipeId];
            if (rec) get().updateRecipeString(recipeId, rec.originalString);
        },

        getCurrentValue: (path) => {
            const { selectedRecipeId, recipes } = get();
            const str = recipes[selectedRecipeId]?.currentString;
            if (!str) return undefined;
            try {
                const obj = JSON.parse(str);
                const v = lodashGet(obj, path);
                return typeof v === "string" || typeof v === "number"
                    ? v
                    : undefined;
            } catch {
                console.warn("Failed to retrieve value.");
                return undefined;
            }
        },

        startPacking: async (callback) => {
            const s = get();
            const input = s.inputOptions[s.selectedRecipeId];
            const configId = input?.config ?? "";
            const recipeString =
                s.recipes[s.selectedRecipeId]?.currentString ?? "";
            set({ isPacking: true });
            try {
                await callback(s.selectedRecipeId, configId, recipeString);
            } finally {
                set({ isPacking: false });
            }
        },

        getOriginalValue: (path) => {
            const { selectedRecipeId, recipes } = get();
            const str = recipes[selectedRecipeId]?.originalString;
            if (!str) return undefined;
            try {
                const obj = JSON.parse(str);
                const v = lodashGet(obj, path);
                return typeof v === "string" || typeof v === "number"
                    ? v
                    : undefined;
            } catch {
                console.warn("Failed to retrieve default value.");
                return undefined;
            }
        },
    }))
);

// simple selectors
export const useSelectedRecipeId = () =>
    useRecipeStore((s) => s.selectedRecipeId);
export const useCurrentRecipeString = () =>
    useRecipeStore((s) => s.recipes[s.selectedRecipeId]?.currentString ?? "");
export const useInputOptions = () => useRecipeStore((s) => s.inputOptions);

export const useIsLoading = () => useRecipeStore((s) => s.isLoading);
export const useIsPacking = () => useRecipeStore((s) => s.isPacking);
export const useFieldsToDisplay = () =>
    useRecipeStore((s) => s.inputOptions[s.selectedRecipeId]?.editable_fields);
export const useIsCurrentRecipeModified = () =>
    useRecipeStore((s) => s.recipes[s.selectedRecipeId]?.isModified ?? false);
export const useGetOriginalValue = () =>
    useRecipeStore((s) => s.getOriginalValue);
const usePackingResults = () => useRecipeStore((s) => s.packingResults);

// compound selectors

const useCurrentRecipeManifest = () => {
    const selectedRecipeId = useSelectedRecipeId();
    const inputOptions = useInputOptions();
    if (!selectedRecipeId) return undefined;
    return inputOptions[selectedRecipeId];
};
const useDefaultResultPath = () => {
    const manifest = useCurrentRecipeManifest();
    return manifest?.defaultResultPath || "";
};

export const useRunTime = () => {
    const results = usePackingResults();
    return results.runTime;
};

export const useJobLogs = () => {
    const results = usePackingResults();
    return results.jobLogs;
};

export const useJobId = () => {
    const results = usePackingResults();
    return results.jobId;
};

export const useOutputsDirectory = () => {
    const results = usePackingResults();
    return results.outputDir;
};

export const useResultUrl = () => {
    const results = usePackingResults();
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

// action selectors (stable identities)
export const useLoadInputOptions = () =>
    useRecipeStore((s) => s.loadInputOptions);
export const useLoadAllRecipes = () => useRecipeStore((s) => s.loadAllRecipes);
export const useSelectRecipe = () => useRecipeStore((s) => s.selectRecipe);
export const useUpdateRecipeObj = () =>
    useRecipeStore((s) => s.updateRecipeObj);
export const useUpdateRecipeString = () =>
    useRecipeStore((s) => s.updateRecipeString);
export const useRestoreRecipeDefault = () =>
    useRecipeStore((s) => s.restoreRecipeDefault);
export const useStartPacking = () => useRecipeStore((s) => s.startPacking);
export const useGetCurrentValue = () =>
    useRecipeStore((s) => s.getCurrentValue);
export const useSetPackingResults = () =>
    useRecipeStore((s) => s.setPackingResults);
export const useSetJobLogs = () => useRecipeStore((s) => s.setJobLogs);
export const useSetJobId = () => useRecipeStore((s) => s.setJobId);
