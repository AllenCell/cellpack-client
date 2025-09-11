import { Dictionary, EditableField } from "../../types";
import InputSwitch from "../InputSwitch";

interface RecipeFormProps {
    fieldsToDisplay?: EditableField[];
    handleFormChange: (changes: Dictionary<string | number>) => void;
    getCurrentValue: (path: string) => string | number | undefined;
}

const RecipeForm = (props: RecipeFormProps) => {
    const { fieldsToDisplay, handleFormChange, getCurrentValue } = props;
    console.log("RecipeForm props: ", props);
    console.log("Rendering RecipeForm with fields: ", fieldsToDisplay);
    return (
        fieldsToDisplay !== undefined && (
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
        )
    );
};

export default RecipeForm;