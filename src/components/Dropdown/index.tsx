import { FirebaseDict } from "../../types";
import { FIRESTORE_FIELDS } from "../../constants/firebaseConstants";

interface DropdownProps {
    value: string;
    placeholder: string;
    options: FirebaseDict;
    onChange: (value: string) => void;
}

const Dropdown = (props: DropdownProps): JSX.Element => {
    const { value, placeholder, options, onChange } = props;

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="" disabled>
                {placeholder}
            </option>
            {Object.entries(options).map(([key, value]) => (
                <option key={key} value={value[FIRESTORE_FIELDS.FIREBASE_ID]}>
                    {key}
                </option>
            ))}
        </select>
    );
};

export default Dropdown;