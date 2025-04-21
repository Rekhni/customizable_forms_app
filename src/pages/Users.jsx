import { useState, useEffect } from "react";
import axios from 'axios';

export default function Users({ isDark, lang }) {
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const token = localStorage.getItem('token');
    const API = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch(err) {
            console.error("Failed to fetch users:",err);
        }
    };

    const toggleUserSelection = (id) => {
        setSelectedUserIds(prev => 
            prev.includes(id) ? prev.map(uid => uid !== id) : [...prev, id] 
        );
    };

    const deleteUsers = async () => {
        if (!window.confirm("Are you sure you want to delete selected users?")) return;

        try {
            await axios.delete(`${API}/users`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { userIds: selectedUserIds }
            });

            fetchUsers();
            setSelectedUserIds([]);
        } catch(err) { 
            console.error("Failed to delete users:", err);
        }
    };

    const toggleAdmin = async () => {
        try {
            await axios.put(`${API}/users/toggle-admin`, { userIds: selectedUserIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            setSelectedUserIds([]);
        } catch(err) {
            console.error("Failed to update admin status:", err);
        }
    }

    const toggleBlock = async () => {
        try {
            await axios.put(`${API}/users/toggle-block`, { userIds: selectedUserIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchUsers();
            setSelectedUserIds([]);
        } catch(err) {
            console.error("Failed to update block/unblock user", err);
        }
    }

    return (
        <div className={`container pt-4 ${isDark ? 'text-white' : 'text-dark'}`}>
            <h2>{lang === 'en' ? 'All users' : 'Все пользователи'}</h2>
            <div className={`d-flex flex-wrap gap-2 shadow justify-content-start p-3 rounded ${isDark ? 'dark-mode' : 'light-mode'} border-info`}>
                <button className="btn btn-danger" onClick={deleteUsers} disabled={selectedUserIds.length === 0}>
                    <i className="bi bi-trash"></i> 
                </button>
                <button className="btn btn-info" onClick={toggleAdmin} disabled={selectedUserIds.length === 0}>
                    <i className="bi bi-person-fill-gear"></i>
                </button>
                <button className="btn btn-primary" onClick={toggleBlock} disabled={selectedUserIds.length === 0}>
                    <i className="bi bi-shield-lock"></i> {lang === 'en' ? 'Toggle Block' : 'Заблокировать / Разблокировать'}
                </button>
            </div>
            <div className="table-responsive">
                <div className="mt-4 shadow rounded border overflow-auto" style={{ maxHeight: '450px' }}>
                    <table className="table table-striped table-hover mb-0">
                        <thead className={isDark ? 'table-dark' : 'table-light'}>
                            <tr>
                            <th>
                                <input 
                                type="checkbox" 
                                checked={selectedUserIds.length === users.length}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                    setSelectedUserIds(users.map(u => u.id));
                                    } else {
                                    setSelectedUserIds([]);
                                    }
                                }}
                                />
                            </th>
                            <th>#</th>
                            <th>{lang === 'en' ? 'Email' : 'Электронная почта'}</th>
                            <th>{lang === 'en' ? 'Name' : 'Имя'}</th>
                            <th>{lang === 'en' ? 'Role' : 'Роль'}</th>
                            <th>{lang === 'en' ? 'Blocked' : 'Заблокирован'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, i) => (
                            <tr key={user.id}>
                                <td>
                                <input 
                                    type="checkbox"
                                    checked={selectedUserIds.includes(user.id)}
                                    onChange={() => toggleUserSelection(user.id)}
                                />
                                </td>
                                <td>{i+1}</td>
                                <td>{user.email}</td>
                                <td>{user.name}</td>
                                <td className={user.role === 'admin' ? 'text-danger' : 'text-primary'}>
                                {user.role === 'admin' ? (lang === 'en' ? 'admin' : 'админ') : (lang === 'en' ? 'user' : 'пользователь')}
                                </td>
                                <td>{user.isBlocked ? (lang === 'en' ? 'Yes' : 'Да') : (lang === 'en' ? 'No' : 'Нет')}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}