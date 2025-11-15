import { Select, Slider } from "antd";
import { GradientOption } from "../../types";
import {
    useSelectedRecipeId,
    useGetCurrentValue,
    useEditRecipe,
} from "../../state/store";
import { getSelectedGradient, deriveGradientStrength, round2 } from "../../utils/gradient";
import "./style.css";

interface GradientInputProps {
    displayName: string;
    description: string;
    gradientOptions: GradientOption[];
    defaultValue: string;
};

const GradientInput = (props: GradientInputProps): JSX.Element => {
    const { displayName, gradientOptions, defaultValue } = props;
    const selectedRecipeId = useSelectedRecipeId();
    const editRecipe = useEditRecipe();
    const getCurrentValue = useGetCurrentValue();

    const { currentGradient, selectedOption } = getSelectedGradient(
        gradientOptions,
        defaultValue,
        getCurrentValue
    );

    const gradientStrengthData = deriveGradientStrength(selectedOption, getCurrentValue);

    const handleGradientChange = (value: string) => {
        if (!selectedRecipeId) return;
        const selectedOption = gradientOptions.find(option => option.value === value);
        if (!selectedOption || !selectedOption.path) return;
        if (selectedOption.packing_mode && selectedOption.packing_mode_path) {
            editRecipe(selectedRecipeId, selectedOption.packing_mode_path, selectedOption.packing_mode);
        }
        editRecipe(selectedRecipeId, selectedOption.path, value);
    };

    const handleStrengthChange = (val: number | null) => {
        if (val == null || !selectedRecipeId || !gradientStrengthData) return;
        const uiVal = round2(val);
        editRecipe(selectedRecipeId, gradientStrengthData.path, uiVal);
    };

    const selectOptions = gradientOptions.map((option) => ({
        label: option.display_name,
        value: option.value,
    }));

    return (
        <div>
            <div className="input-switch">
                <div className="input-label">
                    <strong>{displayName}</strong>
                </div>
                <div className="input-content">
                    <Select
                        options={selectOptions}
                        value={currentGradient}
                        onChange={handleGradientChange}
                        style={{ width: 200, margin: "0 6px" }}
                    />
                </div>
            </div>
            {gradientStrengthData && (
                <div className="input-switch">
                    <div className="input-label">
                        <strong>{gradientStrengthData.displayName}</strong>
                        <small>{gradientStrengthData.description}</small>
                    </div>
                    <div className="input-strength">
                        <Slider
                            id={gradientStrengthData.displayName}
                            min={gradientStrengthData.min}
                            max={gradientStrengthData.max}
                            onChange={(val) => handleStrengthChange(val)}
                            value={gradientStrengthData.uiValue}
                            step={0.01}
                            style={{ marginBottom: 0 }}
                        />
                        <div className="slider-labels">
                            <small className="slider-label-left">
                                <span>{gradientStrengthData.min}</span>
                            </small>
                            <small className="slider-label-right" style={{ marginRight: "5px" }}>
                                <span>{gradientStrengthData.max}</span>
                            </small>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradientInput;
