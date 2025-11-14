import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs } from "antd";

import {
    useSelectedRecipeId,
    useSelectRecipe,
    useStartPacking,
    useLoadAllRecipes,
    useCurrentRecipeObject,
    useInputOptions,
    useLoadInputOptions,
} from "../../state/store";
import Dropdown from "../Dropdown";
import JSONViewer from "../JSONViewer";
import RecipeForm from "../RecipeForm";
import ExpandableText from "../ExpandableText";
import "./style.css";
import { useSiderHeight } from "../../hooks/useSiderHeight";

interface PackingInputProps {
    startPacking: (
        recipeId: string,
        configId: string,
        recipeString: string
    ) => Promise<void>;
}

const DEFAULT_DESCRIPTION_HEIGHT = 58;
const SELECT_HEIGHT = 52;

const PackingInput = (props: PackingInputProps): JSX.Element => {
    const { startPacking } = props;
    const selectedRecipeId = useSelectedRecipeId();
    const recipeObj = useCurrentRecipeObject();
    const inputOptions = useInputOptions();

    const loadInputOptions = useLoadInputOptions();
    const loadAllRecipes = useLoadAllRecipes();
    const selectRecipe = useSelectRecipe();
    const storeStartPacking = useStartPacking();
    const siderHeight = useSiderHeight();

    const recipeDescription = useRef<HTMLDivElement>(null);
    const [tabsHeight, setTabsHeight] = useState<number>();

    useEffect(() => {
        setTabsHeight(
            siderHeight -
                (recipeDescription.current?.offsetHeight ||
                    DEFAULT_DESCRIPTION_HEIGHT) -
                SELECT_HEIGHT
        );
    }, [setTabsHeight, siderHeight]);

    const preFetchInputsAndRecipes = useCallback(async () => {
        await loadInputOptions();
        await loadAllRecipes();
    }, [loadInputOptions, loadAllRecipes]);

    // Load input options on mount
    useEffect(() => {
        preFetchInputsAndRecipes();
    }, [loadInputOptions, loadAllRecipes, preFetchInputsAndRecipes]);

    const handleStartPacking = async () => {
        await storeStartPacking(startPacking);
    };

    const loadingText = <div className="recipe-select">Loading...</div>;

    // No recipe or dropdown options to load
    if (!recipeObj && !inputOptions[selectedRecipeId]) {
        return loadingText;
    }

    const onExpandCollapse = () => {
        console.log("expanded:", recipeDescription.current?.offsetHeight);
        setTabsHeight(recipeDescription.current?.offsetHeight);
    };

    return (
        <>
            <div className="recipe-select">
                <div>Choose Recipe</div>
                <Dropdown
                    defaultValue={selectedRecipeId}
                    placeholder="Select an option"
                    options={inputOptions}
                    onChange={selectRecipe}
                />
            </div>
            {/* Options menu loaded, but no recipe to load yet */}
            {!recipeObj ? (
                loadingText
            ) : (
                <>
                    {recipeObj.description && (
                        <div
                            className="recipe-description"
                            ref={recipeDescription}
                        >
                            <ExpandableText
                                text={recipeObj.description}
                                onExpand={onExpandCollapse}
                            />
                        </div>
                    )}
                    <Tabs
                        defaultActiveKey="1"
                        className="recipe-content"
                        style={{ height: tabsHeight }}
                    >
                        <Tabs.TabPane tab="Editable fields" key="1">
                            <RecipeForm
                                onStartPacking={handleStartPacking}
                                // availableHeight={tabsHeight - 46}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Full Recipe" key="2">
                            <JSONViewer title="Recipe" content={recipeObj} />
                        </Tabs.TabPane>
                    </Tabs>
                </>
            )}
        </>
    );
};

export default PackingInput;
