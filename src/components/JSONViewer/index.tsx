import { Descriptions, Tree, TreeDataNode } from "antd";
import "./style.css";
import { DescriptionsItemProps } from "antd/es/descriptions/Item";

interface JSONViewerProps {
    title: string;
    content: string;
    isEditable: boolean;
    onChange: (value: string) => void;
}

const JSONViewer = (props: JSONViewerProps): JSX.Element => {
    const { content } = props;

    if (!content) {
        return <></>;
    }

    const formatArray = (arr: unknown[]): string => {
        console.log(arr);
        return `[ ${arr
            .map((item) => {
                if (Array.isArray(item)) {
                    return formatArray(item);
                }
                return isNaN(Number(item)) ? item : Number(item).toFixed(3);
            })
            .join(", ")} ]`;
    };

    const convertUnderscoreToSpace = (str: string): string => {
        return str.replace(/_/g, " ");
    };

    const formatKeyValue = (key: string, value: string) => {
        return (
            <>
                <span>{key}</span>:{" "}
                <span style={{ fontWeight: "bold" }}>{value}</span>
            </>
        );
    };

    const contentAsObj = JSON.parse(content);
    const returnOneElement = (
        key: string,
        value: unknown,
        parentKey: string = ""
    ): TreeDataNode => {
        const nodeKey = parentKey ? `${parentKey}.${key}` : key;
        if (Array.isArray(value)) {
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
            title: formatKeyValue(key, String(value)),
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
                    <h4>{tree.title}</h4>
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
