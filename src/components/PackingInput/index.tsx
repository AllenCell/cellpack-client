import { useEffect } from "react";
import {
    useIsLoading,
    useLoadAllRecipes,
    useRecipes,
    useSelectedRecipeId,
    useSelectRecipe,
    useStartPacking,
} from "../../state/store";
import { buildCurrentRecipeString } from "../../state/utils";
import Dropdown from "../Dropdown";
import JSONViewer from "../JSONViewer";
import RecipeForm from "../RecipeForm";
import "./style.css";

const PackingInput = (): JSX.Element => {
    const recipes = useRecipes();
    const selectedRecipeId = useSelectedRecipeId();
    const isLoading = useIsLoading();
    const loadAllRecipes = useLoadAllRecipes();
    const selectRecipe = useSelectRecipe();
    const startPacking = useStartPacking();

    const hasEditableFields = recipes[selectedRecipeId]?.editableFields !== undefined;
    const hasRecipes = Object.keys(recipes).length > 0;

    const currentRecipe = recipes[selectedRecipeId];

    const recipeString = currentRecipe ? buildCurrentRecipeString(
            currentRecipe.defaultRecipeData,
            currentRecipe.edits
        ) : "";

    // Load input options on mount
    useEffect(() => {
        const preFetchRecipes = async () => {
            await loadAllRecipes();
        }
        if (!isLoading && !hasRecipes) {
            preFetchRecipes();
        }
    }, [loadAllRecipes, hasRecipes, isLoading]);

    const handleStartPacking = async () => {
        await startPacking();
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="recipe-select">
                <div>Packing Recipe</div>
                <Dropdown
                    placeholder="Select an option"
                    options={recipes}
                    value={selectedRecipeId}
                    onChange={selectRecipe}
                />
            </div>
            <div className="recipe-content">
                <RecipeForm onStartPacking={handleStartPacking} />
                <JSONViewer
                    title="Recipe"
                    content={recipeString}
                    isEditable={hasEditableFields}
                />
            </div>
        </div>
    );
};

export default PackingInput;