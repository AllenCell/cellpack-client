import { useEffect } from "react";
import { Tabs } from "antd";
import {
    useEditRecipe,
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
    const editRecipe = useEditRecipe();
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

    //ssot make this work with "updates as object"
        const handleRecipeChange = (
            updates: Record<string, string | number>
        ) => {
            if (selectedRecipeId) {
                editRecipe(selectedRecipeId, updates);
            }
        };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="recipe-select">
                <div>Choose Recipe</div>
                <Dropdown
                    placeholder="Select an option"
                    options={recipes}
                    value={selectedRecipeId}
                    onChange={selectRecipe}
                />
            </div>
            <Tabs defaultActiveKey="1" className="recipe-content">
                <Tabs.TabPane tab="Edit" key="1">
                    <RecipeForm onStartPacking={handleStartPacking} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Full Recipe" key="2">
                    <JSONViewer
                        title="Recipe"
                        content={recipeString}
                        isEditable={hasEditableFields}
                        onChange={handleRecipeChange}
                    />
                </Tabs.TabPane>
            </Tabs>
        </>
    );
};

export default PackingInput;