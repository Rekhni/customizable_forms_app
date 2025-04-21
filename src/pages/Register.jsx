import { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register({ isDark, lang }) {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${API}/auth/register`, form);
            navigate('/login');
        } catch (err) {
            console.error('Registration Failed: ' + err.response?.data?.msg || err.message);
            if (err.response?.data?.msg) {
                setError(err.response.data.msg);
            } else {
                setError('An error occurred during signing up.');
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="d-flex flex-column justify-content-center align-items-center w-75 mx-auto gap-3" style={{ paddingTop: '200px' }}>
                {error && <p className="p-4 bg-danger text-white rounded">{error}</p>}
                <h2  className={`${isDark ? 'text-white' : 'text-dark'}`}>{lang==='en' ? 'Sign up': 'Регистрация'}</h2>
                <input className="w-25 rounded form-control form-control-lg" name="name" type="text" placeholder={`${lang==='en' ? 'Name' : 'Имя'}`}  value={form.name} onChange={handleChange} required/>
                <input className="w-25 rounded form-control form-control-lg" name="email" type="email" placeholder={`${lang==='en' ? 'Email' : 'Почта'}`}  value={form.email} onChange={handleChange} required/>
                <input className="w-25 rounded form-control form-control-lg" name="password" type="password" placeholder={`${lang==='en' ? 'Password' : 'Пароль'}`}  value={form.password} onChange={handleChange} required/>
                <button className="rounded text-white border-info" type="submit" style={{ backgroundColor: '#1E90FF', fontSize: '20px', padding: '8px 20px' }}>{lang==='en' ? 'Sign up': 'Зарегистрироваться'}</button>
            </form>
        </div>
    )
}