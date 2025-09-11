import JSZip from "jszip";
import { getOutputsDirectory } from "./firebase";
import { getS3ListUrl, getS3FileUrl } from "../constants/aws";


export const parseS3ListResponse = (xmlText: string): string[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const contents = xmlDoc.getElementsByTagName("Contents");
    const fileNames: string[] = [];
    
    for (let i = 0; i < contents.length; i++) {
        const keyElement = contents[i].getElementsByTagName("Key")[0];
        if (keyElement) {
            const fullPath = keyElement.textContent || "";
            const fileName = fullPath.split("/").pop();
            if (fileName && fileName.length > 0) {
                fileNames.push(fileName);
            }
        }
    }
    
    return fileNames;
};

export const downloadOutputsFromS3 = async (outputsDir: string, jobId: string) => {
    const match = outputsDir.match(/s3\/buckets\/([^/]+)\/(.+)\/?$/);
    if (!match) {
        throw new Error("Invalid S3 URL format");
    }
    
    const bucketName = match[1];
    const folderPath = match[2].replace(/\/$/, "");
    const listUrl = getS3ListUrl(bucketName, folderPath);
    
    console.log("Attempting to list S3 directory:", listUrl);
    
    const listResponse = await fetch(listUrl);
    const xmlText = await listResponse.text();
    const fileNames = parseS3ListResponse(xmlText);
    
    console.log(`Found ${fileNames.length} files:`, fileNames);
    
    const zip = new JSZip();
    let filesAdded = 0;
    
    for (const fileName of fileNames) {
        const fileUrl = getS3FileUrl(bucketName, folderPath, fileName);
        console.log(`Downloading: ${fileUrl}`);
        
        const response = await fetch(fileUrl);
        if (response.ok) {
            const blob = await response.blob();
            zip.file(fileName, blob);
            filesAdded++;
            console.log(`Added ${fileName} to zip`);
        } else {
            console.log(`Failed to download ${fileName}: ${response.status}`);
        }
    }
    
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const downloadUrl = window.URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `cellpack-outputs-${jobId}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    console.log(`Downloaded zip with ${filesAdded} files`);
};

export const downloadOutputs = async (jobId: string) => {
    const outputsDir = await getOutputsDirectory(jobId);
    await downloadOutputsFromS3(outputsDir, jobId);
}
