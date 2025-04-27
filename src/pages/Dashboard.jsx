import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { checkIfBlocked } from "../utils/checkBlocked.js";
import { useNavigate } from "react-router-dom";
import { TemplateGrid } from "../components/TemplateGrid.jsx";

export default function Dashboard({ isDark, lang, backupImg }) {
  const [myTemplates, setMyTemplates] = useState([]);
  const [otherTemplates, setOtherTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDeletion, setLoadingDeletion] = useState(false);
  const [isViewGallery, setIsViewGallery] = useState(true);
  const [activeCategory, setActiveCategory] = useState('latest');
  const [selectedTemplates, setSelectedTemplates] = useState([]);
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

        if (isLoggedIn && user) {
          const isAdmin = user?.role === 'admin';
          setMyTemplates(allTemplates.filter(t => t.userId === user.id));
          setOtherTemplates(
            allTemplates.filter(
              t =>
                t.userId !== user.id &&
                (isAdmin || t.isPublic || (t.allowedUsers || []).some(u => u.id === user.id))
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

  const handleDeleteSelected = async () => {
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete selected templates?' : 'Вы уверены, что хотите удалить выбранные шаблоны?')) return;
  
    try {
      setLoadingDeletion(true);
      await Promise.all(
        selectedTemplates.map(templateId =>
          axios.delete(`${API}/templates/${templateId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      setLoadingDeletion(false);
      setMyTemplates(prev => prev.filter(t => !selectedTemplates.includes(t.id)));
      setOtherTemplates(prev => prev.filter(t => !selectedTemplates.includes(t.id)));
      setSelectedTemplates([]);
      alert(lang === 'en' ? 'Templates deleted successfully' : 'Шаблоны успешно удалены');
    } catch (err) {
      console.error('Failed to delete templates:', err);
      alert(lang === 'en' ? 'Failed to delete templates' : 'Не удалось удалить шаблоны');
    } finally {
      setLoadingDeletion(false);
    }
  };
  
  const allTemplates = [...myTemplates, ...otherTemplates];

  const latestTemplates = allTemplates
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className={`${isDark ? 'text-white' : 'text-dark'}`} style={{ padding: '2rem' }}>
      <div className="d-flex gap-2 mb-3">
        <button
          className={`${isDark ? 'text-white dark-mode' : 'text-dark light-mode'} ${isViewGallery ? 'bg-success text-white' : 'border-success'} rounded border-success`}
          onClick={() => setIsViewGallery(true)}
        >
          <i className="bi bi-columns-gap"></i> {lang==='en' ? 'Gallery' : 'Галерея'}
        </button>
        <button
          className={`${isDark ? 'text-white dark-mode' : 'text-dark light-mode'} ${!isViewGallery ? 'bg-success text-white' : 'border-success'} rounded border-success`}
          onClick={() => setIsViewGallery(false)}
        >
          <i className="bi bi-view-stacked"></i> {lang==='en' ? 'List' : 'Список'}
        </button>
      </div>
      {isLoggedIn && (<div className="d-flex gap-3 mb-3">
        <button
          className={`rounded ${isDark ? 'dark-mode text-white' : 'light-mode text-dark'} ${activeCategory === 'latest' ? 'bg-success text-white' : 'border-success'}`}  
          onClick={() => setActiveCategory('latest')}
        >
          {lang === 'en' ? 'Latest' : 'Последние'}
        </button>
        <button
          className={`rounded ${isDark ? 'dark-mode text-white' : 'light-mode text-dark'} ${activeCategory === 'my'? 'bg-success text-white' : 'border-success'}`}   
          onClick={() => setActiveCategory('my')}
        >
          {lang === 'en' ? 'My Templates' : 'Мои шаблоны'}
        </button>
        <button
          className={`rounded ${isDark ? 'dark-mode text-white' : 'light-mode text-dark'} ${activeCategory === 'other' ? 'bg-success text-white' : 'border-success'}`}  
          onClick={() => setActiveCategory('other')}
        >
          {lang === 'en' ? 'Other Templates' : 'Другие шаблоны'}
        </button>
      </div>)}

      <>
        <h2>
          {isLoggedIn 
            ? activeCategory === 'latest' 
              ? (lang === 'en' ? 'Latest Templates' : 'Последние шаблоны')
              : activeCategory === 'my' 
              ? (lang === 'en' ? 'My Templates' : 'Мои шаблоны')
              : (lang === 'en' ? 'Other Templates' : 'Другие шаблоны')
            : (lang === 'en' ? 'Templates' : 'Шаблоны') // Title for guests
          }
        </h2>

        {isLoggedIn && selectedTemplates.length > 0 && (
          <button
            className="btn btn-danger my-2"
            onClick={handleDeleteSelected}
          >
            {loadingDeletion 
            ? (lang === 'en' ? 'Deleting...' : 'Удаляются...') 
            : (lang === 'en' ? `Delete Selected (${selectedTemplates.length})` : `Удалить выбранные (${selectedTemplates.length})`)}
          </button>
        )}

        {isLoggedIn && activeCategory === 'my' && (
          <Link to="/templates/new">
            <button className={`rounded ${isDark ? 'text-white dark-mode border-success' : 'text-dark light-mode border-info'} mb-3`}>
              {lang === 'en' ? 'New Template' : 'Новый Шаблон'}
            </button>
          </Link>
        )}

        {loading && (
          <div className="spinner-border text-dark" role="status">
            <span className="sr-only"></span>
          </div>
        )}

        {!loading && (
          <TemplateGrid 
            backupImg={backupImg}
            templates={
              isLoggedIn
                ? activeCategory === 'latest'
                  ? latestTemplates
                  : activeCategory === 'my'
                  ? myTemplates
                  : otherTemplates
                : otherTemplates // 👈 Guest users see otherTemplates (only public templates are there)
            }
            selectedTemplates={selectedTemplates}
            setSelectedTemplates={setSelectedTemplates} 
            isDark={isDark}
            lang={lang}
            setMyTemplates={setMyTemplates}
            setOtherTemplates={setOtherTemplates}
            isViewGallery={isViewGallery}
          />
        )}

        {(!loading && (
          (isLoggedIn && (
            (activeCategory === 'latest' && latestTemplates.length === 0) ||
            (activeCategory === 'my' && myTemplates.length === 0) ||
            (activeCategory === 'other' && otherTemplates.length === 0)
          )) || (!isLoggedIn && otherTemplates.length === 0)
        )) && (
          <p>{lang === 'en' ? 'No templates created yet' : 'Пока шаблонов нет'}.</p>
        )}
      </>

    </div>
  );
};
