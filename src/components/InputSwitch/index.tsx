import { useState } from "react";
import { Input, InputNumber, Select, Slider } from 'antd';
import GradientInput from "../GradientInput";
import "./style.css";
import { GradientOption } from "../../types";

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
    linkedFields?: string[];
    changeHandler: (id: string, value: string | number, linkedFields?: string[]) => void;
}

const InputSwitch = (props: InputSwitchProps): JSX.Element => {
    const { displayName, inputType, dataType, description, defaultValue, min, max, options, changeHandler, id, linkedFields, gradientOptions } = props;
    const [sliderValue, setSliderValue] = useState(defaultValue);

    const handleSliderChange = (value: number | null) => {
        if (value === null) return;
        setSliderValue(value);
        changeHandler(id, value, linkedFields);
    };

    switch (inputType) {
        case "slider": {
            return (
                <div className="input-switch">
                    <div>
                        <strong>{displayName} </strong>
                        <br />
                        <small>{description}</small>
                        <br />
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
                        defaultValue={defaultValue as number}
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
                    <div>
                        <strong>{displayName} </strong>
                        <br />
                        <small>{description}</small>
                        <br />
                    </div>
                    <Select
                        options={selectOptions}
                        defaultValue={defaultValue as string}
                        onChange={(e) => changeHandler(id, e, linkedFields)}
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
                        changeHandler={changeHandler}
                    />
                ) || <div>Issue reading gradient options</div>
            );
        }
        default: {
            return (
                <div className="input-switch">
                    <div>
                        <strong>{displayName} </strong>
                        <br />
                        <small>{description}</small>
                        <br />
                    </div>
                    <Input
                        defaultValue={defaultValue as string}
                        onChange={(e) => changeHandler(id, e.target.value, linkedFields)}
                        style={{ width: 200, marginLeft: 10 }}
                    />
                </div>
            );
        }
    }
};

export default InputSwitch;
