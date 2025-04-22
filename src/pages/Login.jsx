import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ isDark, lang }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setLoading(true);
            const res = await axios.post(`${API}/auth/login`, { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user)); 
            navigate('/');

        } catch(err) {
            console.error(err);
            if (err.response?.data?.msg) {
                setError(err.response.data.msg);
            } else {
                setError('An error occurred during login.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="d-flex flex-column justify-content-center align-items-center gap-3" style={{ width: '100%', height: '100vh'}}>
            {error && <p className="p-4 bg-danger text-white rounded">{error}</p>}
            <h2 className={`${isDark ? 'text-white' : 'text-dark'}`}>{lang==='en' ? 'Sign in' : 'Войти'}</h2>
            <input className="w-25 rounded form-control form-control-lg" name="email" type="email" placeholder={`${lang==='en' ? 'Email' : 'Почта'}`} onChange={(e) => setEmail(e.target.value)} required style={{ minWidth: '300px' }}/>
            <input className="w-25 rounded form-control form-control-lg" name="password" type="password" placeholder={`${lang==='en' ? 'Password' : 'Пароль'}`} onChange={(e) => setPassword(e.target.value)} required style={{  minWidth: '300px' }}/>
            {loading ? (
                <div class="spinner-border text-dark" role="status">
                    <span class="sr-only"></span>
                </div>
            ) : (
                <button className="rounded text-white border-info" type="submit" style={{ backgroundColor: '#1E90FF', fontSize: '20px', padding: '8px 20px'}}>
                    {lang==='en' ? 'Sign in' : 'Войти'}
                </button>
            )}
            <p className={`${isDark ? 'text-white' : 'text-dark'}`}>{lang==='en' ? 'Not signed up yet' : 'Нет аккаунта'}? <Link to="/register" className={`${isDark ? 'text-white' : 'text-dark'}`}>{lang==='en' ? 'Signed up now' : 'Зарегистрируйся сейчас'}!</Link></p>
        </form>
    );
}