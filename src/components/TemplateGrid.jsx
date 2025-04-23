import { Link } from "react-router-dom";
import axios from "axios";

export function TemplateGrid({ templates, isDark, lang, setMyTemplates, setOtherTemplates, isViewGallery }) {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';
    const token = localStorage.getItem('token');
    const API = import.meta.env.VITE_API_URL;

    const handleDeleteTemplate = async (templateId) => {
      if (!confirm(`${lang === 'en' ? 'Are you sure you want to delete this template?' : 'Вы уверены что хотите удалить шаблон?'}`)) return;
  
      try {
        await axios.delete(`${API}/templates/${templateId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        setMyTemplates((prev) => prev.filter(t => t.id !== templateId));
        setOtherTemplates((prev) => prev.filter(t => t.id !== templateId));
      } catch(err) {
        console.error("Delete failed", err);
        alert("Delete failed");
      }
    }
    
    return (
      <div
      style={{
        display: isViewGallery ? "grid" : "block",
        gridTemplateColumns: isViewGallery ? "repeat(auto-fill, minmax(250px, 1fr))" : "none",
        gap: "1.5rem",
      }}
    >
      {templates.map((t) => (
        <div
          key={t.id}
          className={`${isDark ? "text-white dark-mode" : "text-dark light-mode"} rounded shadow border-info mb-3`}
          style={{
            display: isViewGallery ? "block" : "flex",
            alignItems: isViewGallery ? "initial" : "center",
            padding: "1rem",
            gap: "1rem",
          }}
        >
          <Link to={`/template/${t.id}/preview`} style={{ textDecoration: "none" }}>
            <img
              src={t.imageUrl || "https://via.placeholder.com/150"}
              alt={t.title}
              style={{
                width: isViewGallery ? "100%" : "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </Link>

          <div style={{ flex: 1 }}>
            <h4>{t.title || "Untitled Form"}</h4>
            <p>{t.topic || "Other"}</p>
            <p>{new Date(t.createdAt).toLocaleDateString()}</p>
            <div className="d-flex justify-content-between">
              <Link to={`/template/${t.id}/preview`}>
                <button className="btn btn-primary">{lang === "en" ? "View" : "Посмотреть"}</button>
              </Link>
              {(isAdmin || user?.id === t.userId) && (
                <button className="btn btn-danger" onClick={() => handleDeleteTemplate(t.id)}>
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
    );
  }