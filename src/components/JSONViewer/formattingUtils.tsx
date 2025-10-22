import { TreeDataNode } from "antd";

const isAnNumberArray = (arr: unknown[]): boolean => {
    return arr.every((item) => typeof item === "number" && !isNaN(item));
};

export const formatArray = (arr: unknown[]): string => {
    return `[ ${arr
        .map((item) => {
            if (Array.isArray(item)) {
                return formatArray(item);
            }
            return isNaN(Number(item)) ? item : Number(item).toFixed(3);
        })
        .join(", ")} ]`;
};

export const convertUnderscoreToSpace = (str: string): string => {
    return str.replace(/_/g, " ");
};

const formatKeyValue = (key: string, value: string | null) => {
    if (value === null) {
        return (
            <>
                <span>{key}</span>:{" "}
                <span style={{ fontStyle: "italic" }}>null</span>
            </>
        );
    }

    return (
        <>
            <span>{key}</span>:{" "}
            <span style={{ fontWeight: "bold" }}>{String(value)}</span>
        </>
    );
};

// helper function to recursively return tree nodes
export const returnOneElement = (
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
