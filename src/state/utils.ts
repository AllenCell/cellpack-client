import { set as lodashSet } from "lodash-es";
import { RecipeData, ViewableRecipe } from "../types";

/**
 * Builds a new recipe object by applying user edits to the default recipe data.
 * Keeping this cloning process out of selector hooks prevents infinite re-render
 * loops, and allows the utilty to be used inside store actions.
 * @param recipe - The recipe data containing:
 *   - `defaultRecipeData`: the base (unmodified) ViewableRecipe.
 *   - `edits`: a record of path–value pairs representing user modifications.
 * @returns A deep-cloned ViewableRecipe with all edits applied.
 * Typically represents the "current" version of the selected recipe in state.
 */
export const buildRecipeObject = (recipe: RecipeData): ViewableRecipe => {
    const clone = structuredClone(recipe.defaultRecipeData);
    for (const [path, value] of Object.entries(recipe.edits)) {
        lodashSet(clone, path, value);
    }
    return clone;
}

