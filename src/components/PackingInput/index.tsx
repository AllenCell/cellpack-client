import { useState } from "react";
import { usePackingData } from "../../hooks/usePackingData";
import Dropdown from "../Dropdown";
import JSONViewer from "../JSONViewer";
import "./style.css";

interface PackingInputProps {
    startPacking: (recipeId: string, configId: string, recipeString: string) => Promise<void>;
}

const PackingInput = (props: PackingInputProps): JSX.Element => {
    const { startPacking } = props;
    
    // Use custom hook for data management
    const {
        selectedRecipeId,
        selectedConfigId,
        recipes,
        configs,
        recipeStr,
        configStr,
        selectRecipe,
        selectConfig,
        updateRecipeStr,
    } = usePackingData();
    
    const [viewRecipe, setViewRecipe] = useState<boolean>(true);
    const [viewConfig, setViewConfig] = useState<boolean>(true);

    const runPacking = async () => {
        setViewConfig(false);
        setViewRecipe(false);
        startPacking(selectedRecipeId, selectedConfigId, recipeStr);
    };

    const toggleRecipe = () => {
        setViewRecipe(!viewRecipe);
    }

    const toggleConfig = () => {
        setViewConfig(!viewConfig);
    }

    return (
        <div>
            <div className="input-container">
                <Dropdown
                    value={selectedRecipeId}
                    placeholder="Select a recipe"
                    options={recipes}
                    onChange={selectRecipe}
                />
                <Dropdown
                    value={selectedConfigId}
                    placeholder="Select a config"
                    options={configs}
                    onChange={selectConfig}
                />
                <button onClick={runPacking} disabled={!selectedRecipeId}>
                    Pack
                </button>
            </div>
            <div className="box">
                <JSONViewer
                    title="Recipe"
                    content={recipeStr}
                    isVisible={viewRecipe}
                    isEditable={true}
                    onToggle={toggleRecipe}
                    onChange={updateRecipeStr}
                />
                <JSONViewer
                    title="Config"
                    content={configStr}
                    isVisible={viewConfig}
                    isEditable={false}
                    onToggle={toggleConfig}
                />
            </div>
        </div>
    );
};

export default PackingInput;