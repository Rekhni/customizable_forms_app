import { Link } from "react-router-dom";

export function TemplateGrid({ templates, isDark }) {
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
            <Link
              to={`/template/${t.id}/preview`}
              style={{ textDecoration: 'none', color: 'inherit' }}
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
                  <img
                    src={t.imageUrl}
                    alt={t.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '1.2rem', color: '#aaa' }}>Form preview</span>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <h4 style={{ margin: 0 }}>{t.title || 'Untitled Form'}</h4>
                <p style={{ fontSize: '0.85rem' }}>{t.topic || 'Other'}</p>
                <p style={{ fontSize: '0.75rem' }}>{new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    );
  }