import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { checkIfBlocked } from "../utils/checkBlocked.js";
import { useNavigate } from "react-router-dom";
import { TemplateGrid } from "../components/TemplateGrid.jsx";

export default function Dashboard({ isDark, lang }) {
  const [myTemplates, setMyTemplates] = useState([]);
  const [otherTemplates, setOtherTemplates] = useState([]);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = !!token;
  const navigate = useNavigate();

  useEffect(() => {
    checkIfBlocked(navigate);
    const fetchTemplates = async () => {
      const API = import.meta.env.VITE_API_URL;
      try {
        const res = await axios.get(`${API}/templates`, {
          headers: isLoggedIn ? { Authorization: `Bearer ${token}` } : {}
        });

        const allTemplates = res.data;

        if (isLoggedIn && user) {
          setMyTemplates(allTemplates.filter(t => t.userId === user.id));
          setOtherTemplates(allTemplates.filter(t => t.userId !== user.id));
        } else {
          setOtherTemplates(allTemplates); // guest
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
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
      {isLoggedIn && (
        <div className="mb-3">
          <h2>
            {lang === 'en' ? 'Latest Templates' : 'Последние шаблоны' }
          </h2>
          {latestTemplates.length > 0 ? (
            <TemplateGrid templates={latestTemplates} isDark={isDark}/>
          ) : (
            <p>{lang === 'en' ? 'No templates created yet' : 'Пока шаблонов нет'}.</p>
          )}
        </div>
      )}
      <hr className="my-4" />
      {isLoggedIn && (
        <>
          <h2>
            {lang === 'en' ? 'My Templates' : 'Мои шаблоны'}
          </h2>
          <Link to="/templates/new">
            <button className={`rounded ${isDark ? 'text-white dark-mode border-success' : 'text-dark light-mode border-info'} mb-3`}>
               {lang === 'en' ? 'New Template' : 'Новый Шаблон'}
            </button>
          </Link>

          {myTemplates.length > 0 ? (
            <TemplateGrid templates={myTemplates} isDark={isDark}/>
          ) : (
            <p>{lang === 'en' ? 'No templates created yet' : 'Вы пока не создали свои шаблоны'}.</p>
          )}

          <hr className="my-4" />
        </>
      )}

      <h2>
        {isLoggedIn
          ? (lang === 'en' ? 'Other Templates' : 'Другие шаблоны')
          : (lang === 'en' ? 'Templates' : 'Шаблоны')}
      </h2>
      <TemplateGrid templates={otherTemplates} isDark={isDark}/>
    </div>
  );
};
