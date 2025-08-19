import { Button } from "antd";
import "./style.css";

interface JSONViewerProps {
    title: string;
    content: string;
    isVisible: boolean;
    isEditable?: boolean;
    onToggle: () => void;
    onChange?: (value: string) => void;
}

const JSONViewer = (props: JSONViewerProps): JSX.Element => {
    const { title, content, isVisible, isEditable = false, onToggle, onChange } = props;
    if (!content) {
        return (<></>)
    }
    return (
        <div className={`${title.toLowerCase()}-box`}>
            <Button className="collapsible" onClick={onToggle}>
                {title}
            </Button>
            <div className={`${title.toLowerCase()}-json`}>
                {isVisible && (
                    isEditable ? (
                        <textarea 
                            value={content} 
                            onChange={(e) => onChange?.(e.target.value)}
                        />
                    ) : (
                        <pre>{content}</pre>
                    )
                )}
            </div>
        </div>
    );
};

export default JSONViewer;