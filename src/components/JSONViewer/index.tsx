import { Descriptions, Tree, TreeDataNode } from "antd";
import { DescriptionsItemProps } from "antd/es/descriptions/Item";
import {
    formatKeyValue,
    formatArray,
    convertUnderscoreToSpace,
    isAnNumberArray,
} from "./formattingUtils";
import "./style.css";

interface JSONViewerProps {
    title: string;
    content: string;
    isEditable: boolean;
    onChange: (value: string) => void;
}

const JSONViewer = (props: JSONViewerProps): JSX.Element | null => {
    const { content } = props;

    if (!content) {
        return null;
    }

    const contentAsObj = JSON.parse(content);
    const returnOneElement = (
        key: string,
        value: unknown,
        parentKey: string = ""
    ): TreeDataNode => {
        const nodeKey = parentKey ? `${parentKey}.${key}` : key;
        if (Array.isArray(value) && isAnNumberArray(value)) {
            return {
                key: nodeKey,
                title: formatKeyValue(key, formatArray(value)),
            };
        }

        if (typeof value === "object" && value !== null) {
            return {
                key: nodeKey,
                title: key,
                children: Object.entries(value).map(([k, v]) =>
                    returnOneElement(k, v, nodeKey)
                ),
            };
        }

        return {
            key: nodeKey,
            title: formatKeyValue(key, value as string | null),
        };
    };

    const descriptions: DescriptionsItemProps[] = [];
    const trees: { title: string; children: TreeDataNode[] }[] = [];

    const createTree = (key: string, value: object) => {
        const treeData: TreeDataNode[] = [];
        const title = key;
        for (const [k, v] of Object.entries(value)) {
            const element = returnOneElement(k, v);
            if (element) {
                treeData.push(element);
            }
        }
        if (treeData.length > 0) {
            trees.push({ title: title, children: treeData });
        }
    };

    // top level objects
    Object.entries(contentAsObj).forEach(([key, value]) => {
        if (typeof value === "string") {
            descriptions.push({
                label: convertUnderscoreToSpace(key),
                children: <>{value}</>,
            });
        } else if (Array.isArray(value)) {
            descriptions.push({
                label: convertUnderscoreToSpace(key),
                children: <>{formatArray(value)}</>,
            });
        } else if (typeof value === "object" && value !== null) {
            createTree(key, value);
        }
    });
    console.log(trees);

    return (
        <div className="full-recipe">
            <Descriptions
                size="small"
                bordered
                column={1}
                items={descriptions}
                classNames={{
                    label: "description-label",
                    content: "description-content",
                }}
            />
            {trees.map((tree) => (
                <>
                    <h4 className="tree-title">{tree.title}</h4>
                    <Tree
                        key={tree.title}
                        showLine
                        selectable={false}
                        treeData={tree.children}
                    />
                </>
            ))}
        </div>
    );
};

export default JSONViewer;
