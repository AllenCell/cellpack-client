import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { get as lodashGet, isEqual } from 'lodash-es';
import { RecipeManifest } from "../types";
import { getRecipesFromFirebase } from "../utils/firebase";
import { buildCurrentRecipeString } from "./utils";
import { EMPTY_FIELDS } from "./constants";
export interface RecipeState {
    selectedRecipeId: string;
    recipes: Record<string, RecipeManifest>;
}

export interface UIState {
    isLoading: boolean;
    isPacking: boolean;
}

type Actions = {
    loadAllRecipes: () => void;
    selectRecipe: (recipeId: string) => Promise<void>;
    editRecipe: (recipeId: string, updates: Record<string, string | number>) => void;
    restoreRecipeDefault: (recipeId: string) => void;
    getCurrentValue: (path: string) => string | number | undefined;
    getOriginalValue: (path: string) => string | number | undefined;
    startPacking: (
        callback: (recipeId: string, configId: string, recipeString: string) => Promise<void>
    ) => Promise<void>;
    reset: () => void;
};

export type RecipeStore = RecipeState & UIState & Actions;

const initialState: RecipeState & UIState = {
    selectedRecipeId: "",
    recipes: {},
    isLoading: false,
    isPacking: false,
};

export const useRecipeStore = create<RecipeStore>()(
    subscribeWithSelector((set, get) => ({
        ...initialState,

        loadAllRecipes: async () => {
            set({ isLoading: true });
            try {
                const recipes = await getRecipesFromFirebase();
                set({ recipes });
                // make an intial selection
                const firstId = Object.keys(recipes)[0];
                set(s => (!s.selectedRecipeId && firstId ? { selectedRecipeId: firstId } : {}));
            } finally {
                set({ isLoading: false });
            }
        },

        selectRecipe: async (recipeId) => {
            const rec = get().recipes[recipeId];
            // TODO: fails silently? error handling here?
            if (!rec) return;

            set(s => (s.selectedRecipeId === rec.recipeId ? {} : { selectedRecipeId: rec.recipeId }));
        },

        editRecipe: (recipeId, updates) => {
            const rec = get().recipes[recipeId];
            if (!rec) return;

            const newEdits = { ...rec.edits };

            for (const [path, value] of Object.entries(updates)) {
                const defaultValue = lodashGet(rec.defaultRecipeData, path);
                if (isEqual(defaultValue, value)) {
                    delete newEdits[path]; // no longer different from default
                } else {
                    newEdits[path] = value;
                }
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



        startPacking: async (callback) => {
            const { selectedRecipeId, recipes } = get();
            const rec = recipes[selectedRecipeId];
            if (!rec) return;
            const recipeString = buildCurrentRecipeString(rec.defaultRecipeData, rec.edits);

            set({ isPacking: true });
            try {
                await callback(selectedRecipeId, rec.configId, recipeString);
            } finally {
                set({ isPacking: false });
            }
        },

        getOriginalValue: (path) => {
            const { selectedRecipeId, recipes } = get();
            const rec = recipes[selectedRecipeId]?.defaultRecipeData;
            if (!rec) return undefined;
            const v = lodashGet(rec, path);
            return (typeof v === "string" || typeof v === "number") ? v : undefined;
        },
        reset: () => set(() => ({ ...initialState })),

    })),


);

// Basic selectors
export const useSelectedRecipeId = () => useRecipeStore(s => s.selectedRecipeId);
export const useRecipes = () => useRecipeStore(s => s.recipes)
export const useIsLoading = () => useRecipeStore(s => s.isLoading);
export const useIsPacking = () => useRecipeStore(s => s.isPacking);

// Derived selectors
export const useEditableFields = () =>
    useRecipeStore(s => {
        const id = s.selectedRecipeId;
        return (id && s.recipes[id]?.editableFields) ?? EMPTY_FIELDS;
    });
    
// Action selectors (stable identities)
export const useLoadAllRecipes = () => useRecipeStore(s => s.loadAllRecipes);
export const useSelectRecipe = () => useRecipeStore(s => s.selectRecipe);
export const useEditRecipe = () => useRecipeStore(s => s.editRecipe);
export const useRestoreRecipeDefault = () => useRecipeStore(s => s.restoreRecipeDefault); // unused?
export const useGetCurrentValue = () => useRecipeStore(s => s.getCurrentValue);
export const useGetOriginalValue = () => useRecipeStore(s => s.getOriginalValue); // unused?
export const useStartPacking = () => useRecipeStore(s => s.startPacking);
export const useResetRecipeStore = () => useRecipeStore(s => s.reset); // unused?