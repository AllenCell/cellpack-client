import { ViewableRecipe } from "../types";
import { set } from "lodash-es";
import { jsonToString } from "../utils/recipeLoader";

/**
 * Build a recipe from a default and a set of edits.
 */
export const buildCurrentRecipeString = (defaultRecipe: ViewableRecipe, edits: Record<string, string | number>) => {
    const clone = structuredClone(defaultRecipe);
    for (const [path, value] of Object.entries(edits)) {
        set(clone, path, value);
    }
    return jsonToString(clone);
};