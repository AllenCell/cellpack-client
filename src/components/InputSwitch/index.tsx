import { useState, useEffect, useCallback } from "react";
import { Input, InputNumber, Select, Slider } from "antd";
import { GradientOption } from "../../types";
import {
    useSelectedRecipeId,
    useUpdateRecipeObj,
    useGetCurrentValue,
    useCurrentRecipeString,
} from "../../state/store";
import GradientInput from "../GradientInput";
import "./style.css";

interface InputSwitchProps {
    displayName: string;
    inputType: string;
    dataType: string;
    description: string;
    id: string;
    defaultValue: string | number;
    min?: number;
    max?: number;
    scaleFactor?: number;
    unit?: string;
    options?: string[];
    gradientOptions?: GradientOption[];
}

const InputSwitch = (props: InputSwitchProps): JSX.Element => {
    const { displayName, inputType, dataType, description, defaultValue, min, max, options, id, gradientOptions, scaleFactor, unit } = props;

    const selectedRecipeId = useSelectedRecipeId();
    const updateRecipeObj = useUpdateRecipeObj();
    const getCurrentValue = useGetCurrentValue();
    const recipeVersion = useCurrentRecipeString();
    const scale = scaleFactor ?? 1;

    // Stable getter for current value, with default fallback
    const getCurrentValueMemo = useCallback(() => {
        const v = getCurrentValue(id);
        const value = v ?? defaultValue;
        return typeof value === "number" ? value * scale : value;
    }, [getCurrentValue, id, defaultValue, scale]);

    // Local controlled state for the input UI
    const [value, setValue] = useState<string | number>(getCurrentValueMemo());

    // Reset local state when store value (or recipe) changes
    useEffect(() => {
        setValue(getCurrentValueMemo());
    }, [getCurrentValueMemo, recipeVersion]);

    const handleInputChange = (value: string | number | null) => {
        if (value == null || !selectedRecipeId) return;
        setValue(value);
        updateRecipeObj(selectedRecipeId, { [id]: typeof value === "number" ? value / scale : value });
    };

    switch (inputType) {
        case "slider": {
            const numericValue =
                typeof value === "number" ? value : Number(value) || 0;
            const step = dataType === "integer" ? 1 : 0.01;

            return (
                <div className="input-switch">
                    <div className="input-label">
                        <strong>{displayName}</strong>
                        <small>{description}</small>
                    </div>
                    <div className="input-content">
                        <Slider
                            min={min}
                            max={(max ?? 1) * scale}
                            step={step}
                            onChange={handleInputChange}
                            value={numericValue}
                            style={{ width: "60%" }}
                        />
                        <InputNumber
                            min={min}
                            max={(max ?? 1) * scale}
                            step={step}
                            style={{ margin: "0 6px" }}
                            value={numericValue}
                            onChange={handleInputChange}
                        />
                        {unit && <span>{unit}</span>}
                    </div>
                </div>
            );
        }

        case "dropdown": {
            const selectOptions = options?.map((option) => ({
                label: option,
                value: option,
            })) || [];
            return (
                <div className="input-switch">
                    <div className="input-label">
                        <strong>{displayName}</strong>
                        <small>{description}</small>
                    </div>
                    <div className="input-content">
                        <Select
                            options={selectOptions}
                            value={String(value)}
                            onChange={handleInputChange}
                            style={{ width: 200, marginLeft: 10 }}
                        />
                    </div>
                </div>
            );
        }

        case "gradient": {
            return gradientOptions && gradientOptions.length > 0 ? (
                <GradientInput
                    displayName={displayName}
                    description={description}
                    gradientOptions={gradientOptions}
                    defaultValue={String(getCurrentValueMemo())}
                />
            ) : (
                <div>Issue reading gradient options</div>
            );
        }

        default: {
            return (
                <div className="input-switch">
                    <div className="input-label">
                        <strong>{displayName}</strong>
                        <small>{description}</small>
                    </div>
                    <Input
                        value={String(value)}
                        onChange={(e) => handleInputChange(e.target.value)}
                        style={{ width: 200, marginLeft: 10 }}
                    />
                </div>
            );
        }
    }
};

export default InputSwitch;
