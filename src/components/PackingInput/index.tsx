import { useCallback, useEffect } from "react";
import {
    useCurrentRecipeString,
    useFieldsToDisplay,
    useInputOptions,
    useIsLoading,
    useLoadInputOptions,
    useSelectInput,
    useStartPacking,
    useLoadAllRecipes,
} from "../../state/store";
import Dropdown from "../Dropdown";
import JSONViewer from "../JSONViewer";
import RecipeForm from "../RecipeForm";
import "./style.css";


interface PackingInputProps {
    startPacking: (recipeId: string, configId: string, recipeString: string) => Promise<void>;
}

const PackingInput = (props: PackingInputProps): JSX.Element => {
    const { startPacking } = props;
    const recipeString = useCurrentRecipeString();
    const fieldsToDisplay = useFieldsToDisplay();
    const inputOptions = useInputOptions();
    const isLoading = useIsLoading();

    const loadInputOptions = useLoadInputOptions();
    const loadAllRecipes = useLoadAllRecipes();
    const selectInput = useSelectInput();
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

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="recipe-select">
                <div>Packing Recipe</div>
                <Dropdown
                    placeholder="Select an option"
                    options={inputOptions}
                    onChange={selectInput}
                />
            </div>
            <div className="recipe-content">
                <RecipeForm onStartPacking={handleStartPacking} />
                <JSONViewer
                    title="Recipe"
                    content={recipeString}
                    isEditable={fieldsToDisplay === undefined}
                />
            </div>
        </div>
    );
};

export default PackingInput;