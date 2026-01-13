import { Select } from "antd";
import { map, sortBy } from "lodash-es";
import { Dictionary, RecipeManifest } from "../../types";

interface DropdownProps {
    placeholder: string;
    defaultValue?: string;
    options: Dictionary<RecipeManifest>;
    onChange: (value: string) => void;
}

const Dropdown = (props: DropdownProps): JSX.Element => {
    const { placeholder, options, onChange, defaultValue } = props;
    const selectOptions = map(options, (opt, key) => ({
        label: opt.displayName || key,
        value: opt.recipeId,
    }));
    const sortedOptions = sortBy(selectOptions, "label");

    return (
        <Select
            defaultValue={defaultValue}
            onChange={onChange}
            placeholder={placeholder}
            options={sortedOptions}
            style={{ width: "100%", paddingLeft: 5 }}
        />
    );
};

export default Dropdown;
