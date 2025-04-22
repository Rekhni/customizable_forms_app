import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../App.css';

export default function Navbar({ isDark, onToggleTheme, lang, onToggleLanguage }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';
    
    const [search, setSearch] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); 
        navigate('/login');
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (search.trim()) {
            setSearch('');
            navigate(`/search?query=${encodeURIComponent(search.trim())}`);
        }
    }

    return (
        <nav className={`navbar navbar-expand-md sticky-top border-bottom px-3 ${isDark ? 'dark-mode border-success' : 'light-mode border-info'}`}>
        <div className="d-flex gap-2">
                <button 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarContent"
                    className={`navbar-toggler ${isDark ? 'border-white' : 'border-dark'}`}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <button onClick={onToggleTheme} className={`btn ${isDark ? 'btn-outline-dark text-white border-white' : 'btn-outline-light text-dark border-dark'} btn-sm ms-auto`}>
                {isDark ? <i class="bi bi-brightness-high"></i> : <i class="bi bi-moon"></i>}
                </button>
                <button onClick={onToggleLanguage} className={`btn ${isDark ? 'btn-outline-dark text-white border-white' : 'btn-outline-light text-dark border-dark'} btn-sm ms-auto`} style={{ marginLeft: '10px' }}>
                    {lang === 'en' ? <span>ru</span> : <span>en</span>}
                </button>
        </div>

        <Link className={`navbar-brand ms-3 ${isDark ? 'text-white' : 'text-dark'}`} to="/" style={{ fontSize: '15px' }}>
            {lang === 'en' ? 'Dashboard' : 'Шаблоны'}
        </Link>

        <div className="collapse navbar-collapse" id="navbarContent" style={{ marginRight: '10px' }}>
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
            {isAdmin && (
                <li className="nav-item">
                    <Link to="/users" className={`nav-link ${isDark ? 'text-white' : 'text-dark'}`}>
                        {lang === 'en' ? 'Users' : 'Пользователи'}
                    </Link>
                </li>
            )}

            {(isAdmin || user?.id) && (
                <>
                <li className="nav-item">
                    <Link to="/filled-forms" className={`nav-link ${isDark ? 'text-white' : 'text-dark'}`}>
                        {lang === 'en' ? 'Filled-out Forms' : 'Заполненные формы'}
                    </Link>
                </li>
                <li className="nav-item">
                    <form onSubmit={handleSearchSubmit} className="d-flex gap-3">
                        <input
                        type="text"
                        placeholder={`${lang === 'en' ? 'Search by tag...' : 'Искать по тэгу...'}`}
                        className="form-control form-control-sm mt-md-0 mt-md-0"
                        style={{ maxWidth: "200px" }}
                        value={search}
                        onChange={handleSearchChange}
                        />
                        <button type="submit" className={`btn btn-sm ${isDark ? 'border-white text-white btn-outline-dark' : 'border-dark text-dark btn-outline-light'}`}>
                            <i className="bi bi-search"></i>
                        </button>
                    </form>
                </li>
                </>
            )}
            </ul>

            {token ? (
            <div className="d-flex align-items-center gap-2">
                <span className={`${isDark ? 'text-white' : 'text-dark'} fw-bold`}>{user?.name || user?.email}</span>
                <button className={`btn btn-sm ${isDark ? 'border-white text-white  btn-outline-dark' : ' btn-outline-light border-dark text-dark'} `} onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i>
                </button>
            </div>
            ) : (
            <Link className={`btn ${isDark ? 'text-white border-white btn-outline-dark' : 'text-dark border-dark btn-outline-light'} btn-sm`} to="/login">
                {lang==='en' ? 'Login' : 'Логин'}
            </Link>
            )}
        </div>
        </nav>

    );
}