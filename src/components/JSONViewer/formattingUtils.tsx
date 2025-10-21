export const isAnNumberArray = (arr: unknown[]): boolean => {
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

export const formatKeyValue = (key: string, value: string | null) => {
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
