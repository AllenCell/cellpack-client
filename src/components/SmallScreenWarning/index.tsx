import { useState } from "react";
import { Alert } from "antd";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "./style.css";

const SmallScreenWarning = (): JSX.Element | null => {
    const [dismissed, setDismissed] = useState(false);
    const isSmallScreen = useMediaQuery("(max-width: 900px)");

    if (dismissed || !isSmallScreen) {
        return null;
    }

    return (
        <div className="small-screen-warning">
            <Alert
                message="cellPACK Studio is designed for larger screens. Some features may not display correctly on this device."
                type="warning"
                showIcon
                closable
                onClose={() => setDismissed(true)}
                banner
            />
        </div>
    );
};

export default SmallScreenWarning;
