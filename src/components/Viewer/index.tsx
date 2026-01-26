import { useEffect, useRef, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { SIMULARIUM_EMBED_URL } from "../../constants/urls";
import { useIsLoading, useIsModified, useIsPacking, useResultUrl } from "../../state/store";
import "./style.css";

const Viewer = (): JSX.Element => {
    const resultUrl = useResultUrl();
    const isLoadingGlobally = useIsLoading();
    const isPacking = useIsPacking();
    const isModified = useIsModified();

  const iframeSrc = resultUrl ? `${SIMULARIUM_EMBED_URL}${resultUrl}` : "";

  const lastSrcRef = useRef<string>("");
  const [isLoadingIframe, setIsLoadingIframe] = useState(false);

    useEffect(() => {
        if (!iframeSrc) return;
        if (iframeSrc === lastSrcRef.current) return;

        lastSrcRef.current = iframeSrc;
        setIsLoadingIframe(true);
    }, [iframeSrc]);


  const isLoading =
      isLoadingGlobally || isLoadingIframe || !iframeSrc;

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
            {iframeSrc && (
                <iframe
                    key={iframeSrc}
                    className="simularium-embed"
                    src={iframeSrc}
                    onLoad={() => setIsLoadingIframe(false)}
                />
            )}
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
