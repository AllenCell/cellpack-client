import "./style.css";

interface ViewerProps {
    resultUrl: string;
}

const Viewer = (props: ViewerProps): JSX.Element => {
    const { resultUrl } = props;
    return (
        <div className="viewer-container">
            <iframe className="simularium-embed" src={resultUrl} />
        </div>
    );
};

export default Viewer;