import { Button, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons'
import { useLocalRecipeString, useSetLocalRecipe } from '../../state/store';

import "./style.css";

const { TextArea } = Input;

interface LocalRecipeProps {
    startPacking: (recipeId: string, configId: string, recipeString: string) => Promise<void>;
    maxHeight?: number;
}

const LocalRecipe: React.FC<LocalRecipeProps> = ({ startPacking, maxHeight }) => {
    const localRecipeString = useLocalRecipeString();
    const setLocalRecipe = useSetLocalRecipe();

    const closeLocalRecipe = () => {
        setLocalRecipe(undefined);
    };

    if (!localRecipeString) {
        return <div>No local recipe loaded.</div>;
    }
    return (
        <div className="local-recipe">
            <div className="upload-recipe-header">
                <h3>Uploaded Recipe</h3>
                <Button icon={<CloseOutlined />} onClick={closeLocalRecipe} color="default" variant="text"/>
            </div>
            <TextArea value={localRecipeString} disabled style={{ height: maxHeight }} />
            <Button
                className="packing-button"
                color="primary"
                variant="filled"
                style={{ width: "100%", minHeight: 38, marginTop: 6 }}
                onClick={() => startPacking("", "", localRecipeString)}
            >
               <strong>Run Packing</strong>
            </Button>
        </div>
    );
};

export default LocalRecipe;
