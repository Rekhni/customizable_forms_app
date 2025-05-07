import { useState } from 'react';
// import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function SupportTicket({ isDark, lang }) {
  const [summary, setSummary] = useState('');
  const [priority, setPriority] = useState('Average');
  const [submitting, setSubmitting] = useState(false);
  const [fileLink, setFileLink] = useState(null);
//   const location = useLocation();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      userName: user?.name || 'Unknown',
      summary,
      priority,
      pageUrl: window.location.href,
      templateTitle: '', // You can dynamically fill this if needed
    };

    try {
      const res = await axios.post(`${API}/support/upload`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(lang === 'en' ? 'Ticket submitted successfully' : 'Заявка успешно отправлена');
      setFileLink(res.data.fileLink);
      setSummary('');
      setPriority('Average');
    } catch (err) {
      console.error("Submission failed:", err);
      alert(lang === 'en' ? 'Failed to submit ticket' : 'Не удалось отправить заявку');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`container pt-4 ${isDark ? 'text-white' : 'text-dark'}`}>
      <h2>{lang === 'en' ? 'Support Ticket' : 'Тикет поддержки'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>{lang === 'en' ? 'Summary' : 'Описание'}</label>
          <textarea className="form-control" value={summary} onChange={e => setSummary(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>{lang === 'en' ? 'Priority' : 'Приоритет'}</label>
          <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="High">{lang === 'en' ? 'High' : 'Высокий'}</option>
            <option value="Average">{lang === 'en' ? 'Average' : 'Средний'}</option>
            <option value="Low">{lang === 'en' ? 'Low' : 'Низкий'}</option>
          </select>
        </div>
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? (lang === 'en' ? 'Submitting...' : 'Отправляется...') : (lang === 'en' ? 'Submit Ticket' : 'Отправить тикет')}
        </button>
      </form>

      {fileLink && (
        <div className="alert alert-success mt-3">
          {lang === 'en' ? 'View uploaded file:' : 'Посмотреть загруженный файл:'}{' '}
          <a href={fileLink} target="_blank" rel="noopener noreferrer">{fileLink}</a>
        </div>
      )}
    </div>
  );
}
