import { Button, message, Modal, Upload } from "antd";
import type { UploadProps } from 'antd';
import { useState } from "react";


interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectRecipe: (recipeContent: string | null) => void;
}

const UploadModal = (props: UploadModalProps): JSX.Element => {
    const { isOpen, onClose, selectRecipe } = props;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
                selectRecipe(content as string);
                console.log("File content:");
                console.log(content);
                // Handle the loaded content here
            };
            reader.readAsText(selectedFile);
        }
        handleCancel();
    };

    const handleCancel = () => {
        setSelectedFile(null);
        selectRecipe(null);
        onClose();
    }

    return (
        <Modal
            title="Choose a Recipe JSON File to Load"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button onClick={handleSubmit} color="primary" variant="filled">
                    Load
                </Button>
            ]}
        >
            <Upload {...uploadProps}>
                <Button type="primary">Select a File</Button>
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