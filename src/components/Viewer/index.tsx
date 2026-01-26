import { LoadingOutlined } from "@ant-design/icons";
import { SIMULARIUM_EMBED_URL } from "../../constants/urls";
import { useIsLoading, useIsModified, useIsPacking, useResultUrl } from "../../state/store";
import "./style.css";

const Viewer = (): JSX.Element => {
    const resultUrl = useResultUrl();
    const isLoading = useIsLoading();
    const isPacking = useIsPacking();
    const isModified = useIsModified();

    const overlayText = isPacking
        ? "Running..."
        : isLoading
        ? "Loading..."
        : isModified
        ? "Re-run packing to view result"
        : "";
    
    const activeState = isLoading || isPacking;
    const showOverlay = activeState || isModified;

    return (
        <div className="viewer-container">
            <iframe
                key={resultUrl}
                className="simularium-embed"
                src={`${SIMULARIUM_EMBED_URL}${resultUrl}`}
            />
            {showOverlay && (
                <div className="viewer-overlay">
                    <div
                        className={`overlay-content ${
                            activeState ? "active" : ""
                        }`}
                    >
                        {activeState && <LoadingOutlined />}
                        <p>{overlayText}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Viewer;
