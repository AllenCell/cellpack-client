import { useState, useContext } from "react";
import { Input, InputNumber, Select, Slider } from 'antd';
import { GradientOption } from "../../types";
import { PackingContext } from "../../context";
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
    options?: string[];
    gradientOptions?: GradientOption[];
}

const InputSwitch = (props: InputSwitchProps): JSX.Element => {
    const { displayName, inputType, dataType, description, defaultValue, min, max, options, id, gradientOptions } = props;
    const { updateRecipeObj } = useContext(PackingContext);
    const [sliderValue, setSliderValue] = useState(defaultValue);

    const handleSliderChange = (value: number | null) => {
        if (value === null) return;
        setSliderValue(value);
        updateRecipeObj({[id]: value});
    };

    switch (inputType) {
        case "slider": {
            return (
                <div className="input-switch">
                    <div className="input-label">
                        <strong>{displayName} </strong>
                        <small>{description}</small>
                    </div>
                    <Slider
                        min={min}
                        max={max}
                        step={dataType === "integer" ? 1 : 0.01}
                        onChange={handleSliderChange}
                        defaultValue={defaultValue as number}
                        value={typeof sliderValue === 'number' ? sliderValue : 0}
                        style={{ width: 100 }}
                    />
                    <InputNumber
                        min={min}
                        max={max}
                        step={dataType === "integer" ? 1 : 0.01}
                        style={{ margin: '0 16px' }}
                        value={sliderValue as number}
                        onChange={handleSliderChange}
                    />
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
                    <Select
                        options={selectOptions}
                        defaultValue={defaultValue as string}
                        onChange={(e) => updateRecipeObj({[id]: e})}
                        style={{ width: 200, marginLeft: 10 }}
                    />
                </div>
            );
        }
        case "gradient": {
            return (
                gradientOptions && gradientOptions.length > 0 && (
                    <GradientInput
                        displayName={displayName}
                        description={description}
                        gradientOptions={gradientOptions}
                        defaultValue={defaultValue as string}
                    />
                ) || <div>Issue reading gradient options</div>
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
                        defaultValue={defaultValue as string}
                        onChange={(e) => updateRecipeObj({[id]: e.target.value})}
                        style={{ width: 200, marginLeft: 10 }}
                    />
                </div>
            );
        }
    }
};

export default InputSwitch;
