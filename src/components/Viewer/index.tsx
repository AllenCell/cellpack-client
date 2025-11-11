import { SIMULARIUM_EMBED_URL } from "../../constants/urls";
import { useResultUrl } from "../../state/store";
import "./style.css";

const Viewer = (): JSX.Element => {
    const resultUrl = useResultUrl();
    return (
        <div className="viewer-container">
            <iframe
                className="simularium-embed"
                src={`${SIMULARIUM_EMBED_URL}${resultUrl}`}
            />
        </div>
    );
};

export default Viewer;
