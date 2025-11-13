import { set as lodashSet } from "lodash-es";
import { ViewableRecipe } from "../types";

/**
 * Builds a new object by applying user edits (by path) to a default.
 * Used to get the "current" version of the selected recipe 
 * in the UI.
 * @param recipe - The default recipe object
 * @param edits - A record of path–value pairs representing user modifications. 
 * @returns A deep-cloned ViewableRecipe with all edits applied.
 */
export const applyChangesToNestedObject = (recipe: ViewableRecipe, edits: Record<string, string | number>): ViewableRecipe => {
    const clone = structuredClone(recipe);
    for (const [path, value] of Object.entries(edits)) {
        lodashSet(clone, path, value);
    }
    return clone;
}

