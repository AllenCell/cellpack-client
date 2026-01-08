import { Button, Input } from 'antd';

const { TextArea } = Input;

interface LocalRecipeProps {
    recipeString: string;
    startPacking: (recipeId: string, configId: string, recipeString: string) => Promise<void>;
    maxHeight?: number;
}

const LocalRecipe: React.FC<LocalRecipeProps> = ({ recipeString, startPacking, maxHeight }) => {
    return (
        <div className="local-recipe">
            <h3>Uploaded Recipe</h3>
            <TextArea value={recipeString} disabled style={{ height: maxHeight }} />
            <Button
                className="packing-button"
                color="primary"
                variant="filled"
                style={{ width: "100%", minHeight: 38, marginTop: 6 }}
                onClick={() => startPacking("", "", recipeString)}
            >
               <strong>Run Packing</strong>
            </Button>
        </div>
    );
};

export default LocalRecipe;
