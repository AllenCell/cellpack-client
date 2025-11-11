import { LoadingOutlined } from "@ant-design/icons";
import { SIMULARIUM_EMBED_URL } from "../../constants/urls";
import { useIsLoading, useIsPacking, useResultUrl } from "../../state/store";
import "./style.css";

const Viewer = (): JSX.Element => {
    const resultUrl = useResultUrl();
    const isLoading = useIsLoading();
    const isPacking = useIsPacking();

    const overlayText = isPacking
        ? "Running..."
        : isLoading
        ? "Loading..."
        : "";

    const showOverlay = isLoading || isPacking;

    return (
        <div className="viewer-container">
            <iframe
                className="simularium-embed"
                src={`${SIMULARIUM_EMBED_URL}${resultUrl}`}
            />
            {showOverlay && (
                <div className="viewer-overlay">
                    <div className="overlay-content">
                        <LoadingOutlined />
                        <p>{overlayText}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Viewer;
