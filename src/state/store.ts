import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { get as lodashGet, set as lodashSet, isEqual } from 'lodash-es';
import { PackingInputs, ViewableRecipe } from "../types";
import { getFirebaseRecipe, jsonToString } from "../utils/recipeLoader";
import { getPackingInputsDict } from "../utils/firebase";

export interface RecipeData {
    id: string;
    originalObj: ViewableRecipe;
    currentObj: ViewableRecipe;
    isModified: boolean;
}

export interface RecipeState {
    selectedInputName: string;
    selectedRecipeId: string;
    inputOptions: Record<string, PackingInputs>;
    recipes: Record<string, RecipeData>;
}

export interface UIState {
    isLoading: boolean;
    isPacking: boolean;
}

type Actions = {
    loadInputOptions: () => Promise<void>;
    loadAllRecipes: () => Promise<void>;
    selectInput: (inputName: string) => Promise<void>;
    loadRecipe: (recipeId: string) => Promise<void>;
    updateRecipeObj: (recipeId: string, updates: Record<string, string | number>) => void;
    restoreRecipeDefault: (recipeId: string) => void;
    getCurrentValue: (path: string) => string | number | undefined;
    getOriginalValue: (path: string) => string | number | undefined;
    startPacking: (
        callback: (recipeId: string, configId: string, recipeString: string) => Promise<void>
    ) => Promise<void>;
    reset: () => void
};

export type RecipeStore = RecipeState & UIState & Actions;

const initialState: RecipeState & UIState = {
    selectedInputName: "",
    selectedRecipeId: "",
    inputOptions: {},
    recipes: {},
    isLoading: false,
    isPacking: false,
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
            const originalObj = structuredClone(recJson);
            const currentObj = structuredClone(recJson);
            set(s => ({
                recipes: {
                    ...s.recipes,
                    [recipeId]: {
                        id: recipeId,
                        originalObj,
                        currentObj,
                        isModified: false,
                    },
                },
            }));

        },

        loadAllRecipes: async () => {
            const { inputOptions, recipes, loadRecipe } = get();

            const ids = new Set<string>();
            Object.values(inputOptions).forEach(opt => { if (opt?.recipe) ids.add(opt.recipe); });
            const missing = [...ids].filter(id => !recipes[id]);
            if (!missing.length) return;

            set({ isLoading: true });
            try {
                await Promise.all(missing.map(id => loadRecipe(id)));
            } finally {
                set({ isLoading: false });
            }
        },

        selectInput: async (inputName) => {
            const sel = get().inputOptions[inputName];
            // TODO: fails silently? error handling here?
            if (!sel) return;

            set({
                selectedInputName: inputName,
                selectedRecipeId: sel.recipe ?? "",
            });

            if (sel.recipe && !get().recipes[sel.recipe]) {
                await get().loadRecipe(sel.recipe);
            }
        },

        updateRecipeObj: (recipeId, updates) => {
            const rec = get().recipes[recipeId];
            if (!rec) return;

            const nextObj = structuredClone(rec.currentObj);
            for (const [path, value] of Object.entries(updates)) {
                lodashSet(nextObj, path, value);
            }

            const modified = !isEqual(nextObj, rec.originalObj);

            set((state) => ({
                recipes: {
                    ...state.recipes,
                    [recipeId]: {
                        ...rec,
                        currentObj: nextObj,
                        isModified: modified,
                    },
                },
            }));
        },

        restoreRecipeDefault: (recipeId) => {
            set(state => {
                const rec = state.recipes[recipeId];
                if (!rec) return {};

                const nextObj = structuredClone(rec.originalObj);
                return {
                    recipes: {
                        ...state.recipes,
                        [recipeId]: {
                            ...rec,
                            currentObj: nextObj,
                            isModified: false,
                        },
                    },
                };
            });
        },


        getCurrentValue: (path) => {
            const { selectedRecipeId, recipes } = get();
            const obj = recipes[selectedRecipeId]?.currentObj;
            // TODO: fails silently? error handling here?
            if (!obj) return undefined;
            const v = lodashGet(obj, path);
            return (typeof v === "string" || typeof v === "number") ? v : undefined;
        },



        startPacking: async (callback) => {
            const state = get();
            const input = state.inputOptions[state.selectedInputName];
            const configId = input?.config ?? "";
            const recipeObj = state.recipes[state.selectedRecipeId]?.currentObj ?? {};
            const recipeString = jsonToString(recipeObj);

            set({ isPacking: true });
            try {
                await callback(state.selectedRecipeId, configId, recipeString);
            } finally {
                set({ isPacking: false });
            }
        },

        getOriginalValue: (path) => {
            const { selectedRecipeId, recipes } = get();
            const obj = recipes[selectedRecipeId]?.originalObj;
            if (!obj) return undefined;
            const v = lodashGet(obj, path);
            return (typeof v === "string" || typeof v === "number") ? v : undefined;
        },
        reset: () => set(() => ({ ...initialState })),

    })),


);

// tiny helpers/selectors (all derived — not stored)
export const useSelectedRecipeId = () => useRecipeStore(s => s.selectedRecipeId);
export const useInputOptions = () => useRecipeStore(s => s.inputOptions);
export const useIsLoading = () => useRecipeStore(s => s.isLoading);
export const useIsPacking = () => useRecipeStore(s => s.isPacking);
export const useFieldsToDisplay = () =>
    useRecipeStore(s => s.inputOptions[s.selectedInputName]?.editable_fields);
export const useIsCurrentRecipeModified = () =>
    useRecipeStore(s => s.recipes[s.selectedRecipeId]?.isModified ?? false);
export const useGetOriginalValue = () => useRecipeStore(s => s.getOriginalValue);
export const useCurrentRecipeObj = () =>
    useRecipeStore(s => s.recipes[s.selectedRecipeId]?.currentObj);
export const useOriginalRecipeObj = () =>
    useRecipeStore(s => s.recipes[s.selectedRecipeId]?.originalObj);
// Derived state
export const useCurrentRecipeString = () =>
    useRecipeStore(s => jsonToString(s.recipes[s.selectedRecipeId]?.currentObj));

// action selectors (stable identities)
export const useLoadInputOptions = () => useRecipeStore(s => s.loadInputOptions);
export const useLoadAllRecipes = () => useRecipeStore(s => s.loadAllRecipes);
export const useSelectInput = () => useRecipeStore(s => s.selectInput);
export const useUpdateRecipeObj = () => useRecipeStore(s => s.updateRecipeObj);
export const useRestoreRecipeDefault = () => useRecipeStore(s => s.restoreRecipeDefault);
export const useStartPacking = () => useRecipeStore(s => s.startPacking);
export const useGetCurrentValue = () => useRecipeStore(s => s.getCurrentValue);
export const useResetRecipeStore = () => useRecipeStore(s => s.reset);