import { set as lodashSet } from "lodash-es";
import { RecipeData, ViewableRecipe } from "../types";

export const buildRecipeObject = (recipe: RecipeData): ViewableRecipe => {
    const clone = structuredClone(recipe.defaultRecipe);
    for (const [path, value] of Object.entries(recipe.edits)) {
        lodashSet(clone, path, value);
    }
    return clone;
}

