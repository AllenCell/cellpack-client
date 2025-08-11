import { useEffect, useState } from "react";
import { FirebaseDict } from "../types";
import { FIRESTORE_COLLECTIONS } from "../constants/firebaseConstants";
import { getFirebaseRecipe, getDocById, getLocationDict } from "../firebase";

export interface PackingDataState {
  selectedRecipeId: string;
  selectedConfigId: string;
  
  recipes: FirebaseDict;
  configs: FirebaseDict;
  
  recipeStr: string;
  configStr: string;
  
  selectRecipe: (recipeId: string) => Promise<void>;
  selectConfig: (configId: string) => Promise<void>;
  updateRecipeStr: (newRecipeStr: string) => void;
}

export const usePackingData = (): PackingDataState => {
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [recipes, setRecipes] = useState<FirebaseDict>({});
  const [configs, setConfigs] = useState<FirebaseDict>({});
  const [recipeStr, setRecipeStr] = useState<string>("");
  const [configStr, setConfigStr] = useState<string>("");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const recipeDict = await getLocationDict(FIRESTORE_COLLECTIONS.RECIPES);
      const configDict = await getLocationDict(FIRESTORE_COLLECTIONS.CONFIGS);
      setRecipes(recipeDict);
      setConfigs(configDict);
    };
    fetchData();
  }, []);

  const selectRecipe = async (recipe: string) => {
    setSelectedRecipeId(recipe);
    const recStr = await getFirebaseRecipe(recipe);
    setRecipeStr(recStr);
  };

  const selectConfig = async (config: string) => {
    setSelectedConfigId(config);
    const confStr = await getDocById(FIRESTORE_COLLECTIONS.CONFIGS, config);
    setConfigStr(confStr);
  };

  const updateRecipeStr = (newRecipeStr: string) => {
    setRecipeStr(newRecipeStr);
  };

  return {
    selectedRecipeId,
    selectedConfigId,
    recipes,
    configs,
    recipeStr,
    configStr,
    selectRecipe,
    selectConfig,
    updateRecipeStr,
  };
};