import { useCallback, useState } from "react";
import { useDropzone } from 'react-dropzone';
import axios from "axios";

export default function CloudinaryUpload({ onUpload, isDark, lang }) {
    const [loading, setLoading] = useState(false);

    const handleDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "forms_images");
        
        try {
            setLoading(true);
            const res = await axios.post("https://api.cloudinary.com/v1_1/dyemaqiib/image/upload", formData);

            setLoading(false);
            onUpload(res.data.secure_url);
        } catch(err) {
            console.error("Image upload failed", err);
            alert('Image upload failed');
        } finally {
            setLoading(false);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleDrop });

    return (
        <div {...getRootProps()} className={`p-3 border ${isDark ? 'border-white' : 'border-dark'} rounded text-center`} style={{ cursor: 'pointer' }}>
            <input {...getInputProps()} />
            {loading ? (
                <div className="d-flex justify-content-center align-items-center gap-2">
                    <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                    <span>{lang === 'en' ? "Uploading..." : "Загрузка..."}</span>
                </div>
            ) : (
                isDragActive
                ? (lang === 'en' ? "Drop the image here..." : "Перетащите изображение сюда...")
                : (lang === 'en' ? "Drag 'n' drop an image here, or click to select" : "Перетащите изображение сюда или нажмите чтобы выбрать")
            )}
        </div>
    )
}