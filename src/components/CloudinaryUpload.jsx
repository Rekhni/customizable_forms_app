import { useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import axios from "axios";

export default function CloudinaryUpload({ onUpload, isDark }) {
    const handleDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "forms_images");
        
        try {
            const res = await axios.post("https://api.cloudinary.com/v1_1/dyemaqiib/image/upload", formData);
            onUpload(res.data.secure_url);
        } catch(err) {
            console.error("Image upload failed", err);
            alert('Image upload failed');
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleDrop });

    return (
        <div {...getRootProps()} className={`p-3 border ${isDark ? 'border-white' : 'border-dark'} rounded text-center`} style={{ cursor: 'pointer' }}>
            <input {...getInputProps()} />
            {isDragActive ? "Drop the image here..." : "Drag 'n' drop an image here, or click to select"}
        </div>
    )
}