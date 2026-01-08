import { Button, Divider, message, Modal, Upload } from "antd";
import type { UploadProps } from 'antd';
import { useState } from "react";
import { useSetLocalRecipe } from "../../state/store";


interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UploadModal = (props: UploadModalProps): JSX.Element => {
    const { isOpen, onClose } = props;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const setLocalRecipe = useSetLocalRecipe();

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        accept: ".json",
        fileList: [],
        beforeUpload: (file) => handleUpload(file),
    };

    const handleUpload = (file: File) => {
        message.success(`${file.name} file uploaded successfully`);
        setSelectedFile(file);
        return false; // Prevent automatic upload
    };

    const handleSubmit = () => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result;
                setLocalRecipe(content as string);
            };
            reader.readAsText(selectedFile);
        }
        handleClose();
    };

    const handleClose = () => {
        setSelectedFile(null);
        onClose();
    }

    return (
        <Modal
            title="Choose a Recipe JSON File to Load"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button onClick={handleClose}>
                    Cancel
                </Button>,
                <Button onClick={handleSubmit} color="primary" variant="filled" disabled={!selectedFile}>
                    Load
                </Button>
            ]}
        >
            <Divider size="small" />
            <Upload {...uploadProps}>
                <Button color="primary" variant="filled">Select a File</Button>
            </Upload>
            {selectedFile && (
                <div>
                    <p>{selectedFile.name}</p>
                </div>
            )}
        </Modal>
    );
};

export default UploadModal;