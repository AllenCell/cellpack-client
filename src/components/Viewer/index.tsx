import { usePackingResults } from "../../state/store";
import "./style.css";


const Viewer = (): JSX.Element => {
    const { resultUrl } = usePackingResults();
    if (!resultUrl) {
        return <></>;
    }
    return (
        <div className="viewer-container">
            <iframe className="simularium-embed" src={resultUrl} />
        </div>
    );
};

export default Viewer;