import { Dictionary } from "../../types";
import InputSwitch from "../InputSwitch";
import "./style.css";

interface RecipeFormProps {
    editableFields: Dictionary<any>[];
    handleChange: (id: string, value: string | number) => void;
}

const RecipeForm = (props: RecipeFormProps): JSX.Element => {
    const { editableFields, handleChange } = props;

    return (
        <div className="recipe-form-container">
            <div className="input-container">
                {editableFields.map((field) => (
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
                        changeHandler={handleChange}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecipeForm;
