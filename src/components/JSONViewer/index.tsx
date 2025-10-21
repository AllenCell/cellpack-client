import { Collapse, Input } from "antd";
import { useState } from "react";
import "./style.css";

interface JSONViewerProps {
    title: string;
    content: string;
    isEditable: boolean;
}

const JSONViewer = (props: JSONViewerProps): JSX.Element => {
    const { title, content, isEditable } = props;
    const [viewContent, setViewContent] = useState<boolean>(true);

    if (!content) {
        return (<></>)
    }
    
    const items = [{
        key: "1",
        label: title,
        children: isEditable ? (
            <Input.TextArea 
                value={content} 
                rows={14}
            />
        ) : (
            <pre className="json-content">{content}</pre>
        )
    }];
    
    return (
        <div className={`${title.toLowerCase()}-box`}>
            <Collapse 
                items={items}
                activeKey={viewContent ? ["1"] : []}
                onChange={() => setViewContent(!viewContent)}
            />
        </div>
    );
};

export default JSONViewer;