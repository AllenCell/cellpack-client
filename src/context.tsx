import { createContext } from "react";
import { Dictionary, EditableField } from "./types";

interface PackingContextType {
    recipeId: string;
    configId: string;
    recipeString?: string;
    fieldsToDisplay?: EditableField[];
    updateRecipeObj: (updates: Dictionary<string | number>) => void;
    getCurrentValue: (path: string) => string | number | undefined;
    submitPacking: () => Promise<void>;
};

export const PackingContext = createContext<PackingContextType>({
    recipeId: "",
    configId: "",
    recipeString: "",
    fieldsToDisplay: undefined,
    updateRecipeObj: async () => {},
    getCurrentValue: () => undefined,
    submitPacking: async () => {},
});