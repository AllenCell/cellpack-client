import { useEffect, useState } from "react";
import { Dictionary, EditableField, PackingInputs } from "../../types";
import { getPackingInputsDict } from "../../utils/firebase";
import { Button } from "antd";
import { getFirebaseRecipe, jsonToString } from "../../utils/recipeLoader";
import Dropdown from "../Dropdown";
import JSONViewer from "../JSONViewer";
import InputSwitch from "../InputSwitch";
import "./style.css";


interface PackingInputProps {
    startPacking: (recipeId: string, configId: string, recipeString: string) => Promise<void>;
    submitEnabled: boolean;
}

const PackingInput = (props: PackingInputProps): JSX.Element => {
    const { startPacking, submitEnabled } = props;
    const [selectedRecipeId, setSelectedRecipeId] = useState("");
    const [selectedConfigId, setSelectedConfigId] = useState("");
    const [inputOptions, setInputOptions] = useState<Dictionary<PackingInputs>>({});
    const [recipeStr, setRecipeStr] = useState<string>("");
    const [viewRecipe, setViewRecipe] = useState<boolean>(true);
    const [fieldsToDisplay, setFieldsToDisplay] = useState<EditableField[] | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
            const inputDict = await getPackingInputsDict();
            setInputOptions(inputDict);
        };
        fetchData();
    }, []);

    const selectInput = async (inputName: string) => {
        const recipeId: string = inputOptions[inputName]?.recipe || "";
        const configId: string = inputOptions[inputName]?.config || "";
        setFieldsToDisplay(inputOptions[inputName]?.editable_fields || undefined);
        await selectRecipe(recipeId);
        setSelectedConfigId(configId);
    }

    const selectRecipe = async (recipeId: string) => {
        setSelectedRecipeId(recipeId);
        const recJson = await getFirebaseRecipe(recipeId);
        const recStr = jsonToString(recJson);
        setRecipeStr(recStr);
    }

    const runPacking = async () => {
        startPacking(selectedRecipeId, selectedConfigId, recipeStr);
    };

    const toggleRecipe = () => {
        setViewRecipe(!viewRecipe);
    }

    const handleFormChange = (changes: Dictionary<string | number>) => {
        const recipeObj = JSON.parse(recipeStr);
        for (const [id, value] of Object.entries(changes)) {
            const keys = id.split('.');
            let current = recipeObj;
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];

                if (i === keys.length - 1) {
                    // Last key in the path, assign the value
                    current[key] = value;
                } else {
                    // Not the last key, ensure the intermediate object exists
                    if (typeof current[key] !== 'object' || current[key] === null) {
                        // Doesn't exist, return original object without changes
                        console.warn(`Path "${id}" is invalid. Cannot set value.`);
                        return;
                    }
                    current = current[key];
                }
            }
        }
        const updatedRecipeStr = JSON.stringify(recipeObj, null, 2);
        setRecipeStr(updatedRecipeStr);
    };

    const getCurrentValue = (path: string): string | number | undefined => {
        const recipeObj = JSON.parse(recipeStr);
        const keys = path.split('.');
        let current = recipeObj;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (current[key] === undefined) {
                return undefined;
            }
            current = current[key];
        }
        return current;
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
                <div className="recipe-json">
                    <JSONViewer
                        title="Recipe"
                        content={recipeStr}
                        isVisible={viewRecipe}
                        isEditable={fieldsToDisplay === undefined}
                        onToggle={toggleRecipe}
                        onChange={setRecipeStr}
                    />
                </div>
                <div className="recipe-form">
                    {fieldsToDisplay && (
                        <div className="input-container">
                            <h3>Options</h3>
                            {fieldsToDisplay.map((field) => (
                                <InputSwitch
                                    key={field.path}
                                    displayName={field.name}
                                    inputType={field.input_type}
                                    dataType={field.data_type}
                                    description={field.description}
                                    defaultValue={field.default}
                                    min={field.min}
                                    max={field.max}
                                    options={field.options}
                                    id={field.path}
                                    gradientOptions={field.gradient_options}
                                    changeHandler={handleFormChange}
                                    getCurrentValue={getCurrentValue}
                                />
                            ))}
                        </div>
                    )}
                    {selectedRecipeId && (
                        <Button
                            onClick={runPacking}
                            color="primary"
                            variant="filled"
                            disabled={!submitEnabled}
                            style={{ width: '100%' }}
                        >
                            Pack!
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PackingInput;