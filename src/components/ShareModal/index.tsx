import { Button, Input, Modal, Space } from "antd";

interface ShareModalProps {
    open: boolean;
    onClose: () => void;
    shareUrl: string;
}

const ShareModal = ({ open, onClose, shareUrl }: ShareModalProps) => {
    return (
        <Modal
            title="Share Result"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Space.Compact style={{ display: "flex", width: "100%" }}>
                <Input
                    value={shareUrl}
                    readOnly
                    style={{ flex: 1 }}
                />
                <Button
                    type="primary"
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                >
                    Copy
                </Button>
            </Space.Compact>
        </Modal>
    );
};

export default ShareModal;
