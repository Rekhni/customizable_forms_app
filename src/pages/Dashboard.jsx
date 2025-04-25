import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { checkIfBlocked } from "../utils/checkBlocked.js";
import { useNavigate } from "react-router-dom";
import { TemplateGrid } from "../components/TemplateGrid.jsx";

export default function Dashboard({ isDark, lang }) {
  const [myTemplates, setMyTemplates] = useState([]);
  const [otherTemplates, setOtherTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isViewGallery, setIsViewGallery] = useState(true);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = !!token;
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    checkIfBlocked(navigate);
    const fetchTemplates = async () => {
      
      try {
        const res = await axios.get(`${API}/templates`, {
          headers: isLoggedIn ? { Authorization: `Bearer ${token}` } : {}
        });

        const allTemplates = res.data;

        console.log("Returned templates:", allTemplates.map(t => ({
          id: t.id,
          title: t.title,
          isPublic: t.isPublic,
          userId: t.userId,
          allowedUsers: t.allowedUsers?.map(u => u.id)
        })));

        if (isLoggedIn && user) {
          setMyTemplates(allTemplates.filter(t => t.userId === user.id));
          setOtherTemplates(
            allTemplates.filter(
              t =>
                t.userId !== user.id &&
                (t.isPublic || (t.allowedUsers || []).some(u => u.id === user.id))
            )
          );
        } else {
          setOtherTemplates(allTemplates); // guest
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [isLoggedIn]);


  const allTemplates = [...myTemplates, ...otherTemplates];

  const latestTemplates = allTemplates
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);



  return (
    <div className={`${isDark ? 'text-white' : 'text-dark'}`} style={{ padding: '2rem' }}>
      <div className="d-flex gap-2 mb-3">
        <button
          className={`${isDark ? 'text-white dark-mode' : 'text-dark light-mode'} rounded border-success`}
          onClick={() => setIsViewGallery(true)}
        >
          <i className="bi bi-columns-gap"></i> {lang==='en' ? 'Gallery' : 'Галерея'}
        </button>
        <button
          className={`${isDark ? 'text-white dark-mode' : 'text-dark light-mode'} rounded border-success`}
          onClick={() => setIsViewGallery(false)}
        >
          <i className="bi bi-view-stacked"></i> {lang==='en' ? 'List' : 'Список'}
        </button>
      </div>

      {isLoggedIn && (
        <div className="mb-3">
          <h2>
            {lang === 'en' ? 'Latest Templates' : 'Последние шаблоны' }
          </h2>
          {loading && (
            <div class="spinner-border text-dark" role="status">
              <span class="sr-only"></span>
            </div>
          )}
          {(latestTemplates.length > 0 && !loading) && (
            <TemplateGrid 
              templates={latestTemplates} 
              isDark={isDark}
              lang={lang}
              setMyTemplates={setMyTemplates}
              setOtherTemplates={setOtherTemplates}
              isViewGallery={isViewGallery}
            />
          )}
            {(!latestTemplates || !loading) && (<p>{lang === 'en' ? 'No templates created yet' : 'Пока шаблонов нет'}.</p>)}
          
        </div>
      )}
      <hr className="my-4" />
      {isLoggedIn && (
        <>
          <h2>
            {lang === 'en' ? 'My Templates' : 'Мои шаблоны'}
          </h2>

          <div className="d-flex flex-column gap-2">
            <Link to="/templates/new">
              <button className={`rounded ${isDark ? 'text-white dark-mode border-success' : 'text-dark light-mode border-info'} mb-3`}>
                {lang === 'en' ? 'New Template' : 'Новый Шаблон'}
              </button>
            </Link>

            {loading && (
              <div class="spinner-border text-dark" role="status">
                <span class="sr-only"></span>
              </div>
            )}
          </div>

          {(myTemplates.length > 0 && !loading) && (
            <TemplateGrid 
              templates={myTemplates} 
              isDark={isDark}
              lang={lang}
              setMyTemplates={setMyTemplates}
              setOtherTemplates={setOtherTemplates}
              isViewGallery={isViewGallery}
            />
          )}
            {(!myTemplates || !loading) || (<p>{lang === 'en' ? 'No templates created yet' : 'Пока шаблонов нет'}.</p>)}

          <hr className="my-4" />
        </>
      )}

      <h2>
        {isLoggedIn
          ? (lang === 'en' ? 'Other Templates' : 'Другие шаблоны')
          : (lang === 'en' ? 'Templates' : 'Шаблоны')}
      </h2>
      {loading && (
        <div class="spinner-border text-dark" role="status">
          <span class="sr-only"></span>
        </div>
          )}
      <TemplateGrid 
        templates={otherTemplates} 
        isDark={isDark} 
        lang={lang}
        setMyTemplates={setMyTemplates}
        setOtherTemplates={setOtherTemplates}
        isViewGallery={isViewGallery}
      />
      {(!myTemplates || !loading) && (<p>{lang === 'en' ? 'No templates created yet' : 'Пока шаблонов нет'}.</p>)}
    </div>
  );
};
