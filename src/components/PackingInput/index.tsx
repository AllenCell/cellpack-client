import { useCallback, useEffect } from "react";
import { Tabs } from "antd";

import {
    useSelectedRecipeId,
    useCurrentRecipeString,
    useFieldsToDisplay,
    useInputOptions,
    useIsLoading,
    useLoadInputOptions,
    useSelectRecipe,
    useUpdateRecipeString,
    useStartPacking,
    useLoadAllRecipes,
} from "../../state/store";
import Dropdown from "../Dropdown";
import JSONViewer from "../JSONViewer";
import RecipeForm from "../RecipeForm";
import "./style.css";

interface PackingInputProps {
    startPacking: (
        recipeId: string,
        configId: string,
        recipeString: string
    ) => Promise<void>;
}

const PackingInput = (props: PackingInputProps): JSX.Element => {
    const { startPacking } = props;
    const selectedRecipeId = useSelectedRecipeId();
    const recipeString = useCurrentRecipeString();
    const fieldsToDisplay = useFieldsToDisplay();
    const inputOptions = useInputOptions();
    const isLoading = useIsLoading();

    const loadInputOptions = useLoadInputOptions();
    const loadAllRecipes = useLoadAllRecipes();
    const selectRecipe = useSelectRecipe();
    const updateRecipeString = useUpdateRecipeString();
    const storeStartPacking = useStartPacking();

    const preFetchInputsAndRecipes = useCallback(async () => {
        await loadInputOptions();
        await loadAllRecipes();
    }, [loadInputOptions, loadAllRecipes]);

    // Load input options on mount
    useEffect(() => {
        preFetchInputsAndRecipes();
    }, [loadInputOptions, loadAllRecipes, preFetchInputsAndRecipes]);

    const handleStartPacking = async () => {
        await storeStartPacking(startPacking);
    };

    const handleRecipeStringChange = (newString: string) => {
        if (selectedRecipeId) {
            updateRecipeString(selectedRecipeId, newString);
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
                    defaultValue={selectedRecipeId}
                    placeholder="Select an option"
                    options={inputOptions}
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
                        isEditable={fieldsToDisplay === undefined}
                        onChange={handleRecipeStringChange}
                    />
                </Tabs.TabPane>
            </Tabs>
        </>
    );
};

export default PackingInput;
