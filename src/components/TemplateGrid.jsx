import { Link } from "react-router-dom";

export function TemplateGrid({ templates, isDark, lang, isViewGallery, backupImg, selectedTemplates, setSelectedTemplates }) {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';
    const API = import.meta.env.VITE_API_URL;
    
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
            padding: !isViewGallery ? "1rem" : null,
            gap: "1rem",
          }}
        >
          {isViewGallery && (<Link to={`/template/${t.id}/preview`} style={{ textDecoration: "none" }}>
            <img
              src={t.imageUrl || backupImg}
              alt={t.title}
              style={{
                width: isViewGallery ? "100%" : "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </Link>)}

          <div style={{ flex: 1, ...(isViewGallery ? { padding: '0 15px 10px 15px' } : {})  }}>
            <div className={`${!isViewGallery ? 'd-flex justify-content-between' : ''}`}>
              <h4 className={`${isViewGallery ? 'mt-2' : ''}`}>{t.title || "Untitled Form"}</h4>
              <div className={`${!isViewGallery ? 'd-flex gap-3' : ''}`}>
                <p className="m-0">{t.topic || "Other"}</p>
                <p>{new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <Link to={`/template/${t.id}/preview`}>
                <button className="btn btn-primary">{lang === "en" ? "View" : "Посмотреть"}</button>
              </Link>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTemplates?.includes(t.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTemplates(prev => [...prev, t.id]);
                    } else {
                      setSelectedTemplates(prev => prev.filter(id => id !== t.id));
                    }
                  }}
                  disabled={!(isAdmin || user?.id === t.userId)}
                />
                {(isAdmin || user?.id === t.userId) && (
                  <small className="text-muted">
                    {lang === 'en' ? 'Select' : 'Выбрать'}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    );
  }