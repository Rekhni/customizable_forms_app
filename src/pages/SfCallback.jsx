// src/pages/SfCallback.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function SfCallback({ isDark, lang }) {
  const [accessToken, setAccessToken] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get('access_token');
    const instance_url = params.get('instance_url');

    if (access_token && instance_url) {
      setAccessToken(access_token);
      setInstanceUrl(instance_url);
    } else {
      setMessage('Missing Salesforce credentials');
    }
  }, []);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('Submitting...');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/salesforce/create-account-contact`, {
        tokens: { access_token: accessToken, instance_url: instanceUrl },
        ...formData
      });

      setMessage('✅ ' + res.data.msg);
      toast.success(lang === 'en' ? 'Successfully synced in Salesforce' : 'Успешно синхронизировались в Salesforce');
      setFormData({ name: '', email: '', phone: '', company: '' });
    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.msg || err.message));
      toast.error(lang === 'en' ? 'Failed to sync in Salesforce' : 'Не удалось синхронизироваться в Salesforce');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 className={`${isDark ? 'text-white' : 'text-dark'}`}>{lang === 'en' ? 'Sync to Salesforce' : 'Синхронизируйся в Salesforce'}</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} className='d-flex flex-column justify-content-center align-items-center gap-3' style={{ maxWidth: '500px' }}>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required style={{ width: '400px' }} />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ width: '400px' }} />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} style={{ width: '400px' }} />
        <input name="company" placeholder="Company" value={formData.company} onChange={handleChange} required style={{ width: '400px' }} />
        <button className={`rounded ${isDark ? 'dark-mode text-white' : 'light-mode text-dark'}`} type="submit">{lang === 'en' ? 'Create in Salesforce' : 'Авторизоваться в Salesforce'}</button>
      </form>
    </div>
  );
}
