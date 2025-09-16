import { useState, useContext } from "react";
import { InputNumber, Select, Slider } from 'antd';
import { Dictionary, GradientOption } from "../../types";
import { PackingContext } from "../../context";
import "./style.css";

interface GradientStrength {
    displayName: string;
    description: string;
    path: string;
    defaultValue: number;
    min: number;
    max: number;
};

interface GradientInputProps {
    displayName: string;
    description: string;
    gradientOptions: GradientOption[];
    defaultValue: string;
};

const GradientStrength = (props: GradientStrength) => {
    const { displayName, description, path, defaultValue, min, max } = props;
    const { updateRecipeObj } = useContext(PackingContext);
    const [sliderValue, setSliderValue] = useState<number>(defaultValue);

    const handleStrengthChange = (value: number | null, path: string) => {
        if (value === null) return;
        const roundedValue = Number(value.toFixed(2));
        setSliderValue(roundedValue);
        updateRecipeObj({[path]: Number((1 - roundedValue).toFixed(2))});
    };

    return (
        <div className="input-switch">
            <div className="input-label">
                <strong>{displayName}</strong>
                <small>{description}</small>
            </div>
            <Slider
                min={min}
                max={max}
                onChange={(value) => handleStrengthChange(value, path)}
                value={sliderValue}
                step={0.01}
                style={{ width: 100 }}
            />
            <InputNumber
                min={min}
                max={max}
                value={sliderValue}
                onChange={(value) => handleStrengthChange(value, path)}
                step={0.01}
                style={{ margin: '0 16px' }}
            />
        </div>
    )
}

const GradientInput = (props: GradientInputProps): JSX.Element => {
    const { displayName, description, gradientOptions, defaultValue } = props;
    const { updateRecipeObj, getCurrentValue } = useContext(PackingContext);
    const initialOption = gradientOptions.find(option => option.value === defaultValue);
    const initialGradientStrength: GradientStrength = {
        displayName: initialOption?.strength_display_name || initialOption?.display_name + " Strength",
        description: initialOption?.strength_description || "",
        path: initialOption?.strength_path || "",
        defaultValue: 1 - (initialOption?.strength_default || 0.01),
        min: initialOption?.strength_min || 0,
        max: initialOption?.strength_max || 0.99,
    };
    const [gradientStrengthData, setGradientStrengthData] = useState<GradientStrength | undefined>(initialGradientStrength);

    const gradientSelected = (value: string) => {
        const selectedOption = gradientOptions.find(option => option.value === value);
        if (!selectedOption) return;

        // Make changes to JSON recipe
        const changes: Dictionary<string | number> = {[selectedOption.path]: value};
        if (selectedOption.packing_mode && selectedOption.packing_mode_path) {
            changes[selectedOption.packing_mode_path] = selectedOption.packing_mode;
        }
        updateRecipeObj(changes);

        // Display relevant strength slider if applicable
        if (selectedOption.strength_path) {
            const currVal = getCurrentValue(selectedOption.strength_path) as number | undefined || selectedOption.strength_default || 0.01;
            const strengthData: GradientStrength = {
                displayName: selectedOption.strength_display_name || selectedOption.display_name + " Strength",
                description: selectedOption.strength_description || "",
                path: selectedOption.strength_path,
                defaultValue: (1 - currVal),
                min: selectedOption.strength_min || 0,
                max: selectedOption.strength_max || 0.99,
            };
            setGradientStrengthData(strengthData);
        } else {
            setGradientStrengthData(undefined);
        }

    }

    const selectOptions = gradientOptions.map((option) => ({
        label: option.display_name,
        value: option.value,
    }));

    return (
        <div>
            <div className="input-switch">
                <div className="input-label">
                    <strong>{displayName} </strong>
                    <small>{description}</small>
                </div>
                <Select
                    options={selectOptions}
                    defaultValue={defaultValue}
                    onChange={(e) => gradientSelected(e)}
                    style={{ width: 200, margin: '0 16px' }}
                />
            </div>
            {gradientStrengthData && (
                <GradientStrength {...gradientStrengthData} />
            )}
        </div>
    );
};

export default GradientInput;