import { Button } from "antd";
import InputSwitch from "../InputSwitch";
import "./style.css";
import {
    useSelectedRecipeId,
    useFieldsToDisplay,
    useIsPacking,
} from "../../state/store";

interface RecipeFormProps {
    onStartPacking: () => Promise<void>;
}

const RecipeForm = ({ onStartPacking }: RecipeFormProps) => {
    const recipeId = useSelectedRecipeId();
    const fieldsToDisplay = useFieldsToDisplay();
    const isPacking = useIsPacking();

    return (
        <div className="recipe-form">
            {fieldsToDisplay && (
                <div className="input-container">
                    {fieldsToDisplay.map((field) => (
                        <InputSwitch
                            key={field.id}
                            displayName={field.name}
                            inputType={field.input_type}
                            dataType={field.data_type}
                            description={field.description}
                            min={field.min}
                            max={field.max}
                            options={field.options}
                            id={field.path}
                            gradientOptions={field.gradient_options}
                            conversionFactor={field.conversion_factor}
                            unit={field.unit}
                        />
                    ))}
                </div>
            )}
            {recipeId && (
                <Button
                    onClick={onStartPacking}
                    color="primary"
                    variant="filled"
                    disabled={isPacking}
                    style={{ width: "100%" }}
                >
                    Pack!
                </Button>
            )}
        </div>
    );
};
export default RecipeForm;
