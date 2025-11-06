import { Select } from "antd";
import { map } from "lodash-es";
import { Dictionary, RecipeManifest } from "../../types";

interface DropdownProps {
    placeholder: string;
    options: Dictionary<RecipeManifest>;
    defaultValue?: string;
    onChange: (value: string) => void;
}

const Dropdown = (props: DropdownProps): JSX.Element => {
    const { placeholder, options, onChange, defaultValue } = props;
        const selectOptions = map(options, (opt, key) => ({
            label: opt.displayName || key,
            value: opt.recipeId,
        }));

    return (
        <Select
            defaultValue={defaultValue}
            onChange={onChange}
            placeholder={placeholder}
            options={selectOptions}
            style={{ width: "100%", paddingLeft: 5 }}
        />
    );
};

export default Dropdown;