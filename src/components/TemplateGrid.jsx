import { Link } from "react-router-dom";
import axios from "axios";

export function TemplateGrid({ templates, isDark, lang, setMyTemplates, setOtherTemplates }) {
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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {templates.map((t) => (
          <div
            key={t.id}
            className={`${isDark ? 'text-white dark-mode' : 'text-dark light-mode'} rounded shadow border-info`}
            style={{
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer',
            }}
          >

              <div
                style={{
                  height: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {t.imageUrl ? (
                  <Link 
                    to={`/template/${t.id}/preview`}
                    style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  >
                    <img
                      src={t.imageUrl}
                      alt={t.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />                  
                  </Link>

                ) : (
                  <span style={{ fontSize: '1.2rem', color: '#aaa' }}>Form preview</span>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <h4 style={{ margin: 0 }}>{t.title || 'Untitled Form'}</h4>
                <p style={{ fontSize: '0.85rem' }}>{t.topic || 'Other'}</p>
                <p style={{ fontSize: '0.75rem' }}>{new Date(t.createdAt).toLocaleDateString()}</p>
                <div className="d-flex justify-content-between">
                  <Link
                    
                    to={`/template/${t.id}/preview`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <button className="btn btn-primary bg-primary">{lang==='en' ? 'View' : 'Посмотреть'}</button>
                    
                  </Link>
                  {(isAdmin || user?.id === t.userId ) && (
                    <div >
                      <button className="btn btn-danger" onClick={() => handleDeleteTemplate(t.id)}>
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
          </div>
        ))}
      </div>
    );
  }