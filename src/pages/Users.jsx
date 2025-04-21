import { useState, useEffect } from "react";
import axios from 'axios';

export default function Users({ isDark, lang }) {
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingToggleAdmin, setLoadingToggleAdmin] = useState(false);
    const [loadingToggleBlock, setLoadingToggleBlock] = useState(false);
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
        } finally {
            setLoading(false);
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
            setLoadingDelete(true);
            await axios.delete(`${API}/users`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { userIds: selectedUserIds }
            });

            setLoadingDelete(false);
            fetchUsers();
            setSelectedUserIds([]);
        } catch(err) { 
            console.error("Failed to delete users:", err);
        } finally {
            setLoadingDelete(false);
        }
    };

    const toggleAdmin = async () => {
        try {
            setLoadingToggleAdmin(true);
            await axios.put(`${API}/users/toggle-admin`, { userIds: selectedUserIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLoadingToggleAdmin(false);
            fetchUsers();
            setSelectedUserIds([]);
        } catch(err) {
            console.error("Failed to update admin status:", err);
        } finally {
            setLoadingToggleAdmin(false);
        }
    }

    const toggleBlock = async () => {
        try {
            setLoadingToggleBlock(true);
            await axios.put(`${API}/users/toggle-block`, { userIds: selectedUserIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLoadingToggleBlock(false);
            fetchUsers();
            setSelectedUserIds([]);
        } catch(err) {
            console.error("Failed to update block/unblock user", err);
        } finally {
            setLoadingToggleBlock(false);
        }
    }

    return (
        <div className={`container pt-4 ${isDark ? 'text-white' : 'text-dark'}`}>
            <h2>{lang === 'en' ? 'All users' : 'Все пользователи'}</h2>
            <div className={`d-flex flex-wrap gap-2 shadow justify-content-start p-3 rounded ${isDark ? 'dark-mode' : 'light-mode'} border-info`}>
                <button className="btn btn-danger" onClick={deleteUsers} disabled={selectedUserIds.length === 0}>
                    {loadingDelete ? (
                        <div class="spinner-border text-dark" role="status" style={{ width: '15px', height: '15px' }}>
                            <span class="sr-only"></span>
                        </div>
                    ) : (
                        <i className="bi bi-trash"></i>
                    )} 
                </button>
                <button className="btn btn-info" onClick={toggleAdmin} disabled={selectedUserIds.length === 0}>
                    {loadingToggleAdmin ? (
                        <div class="spinner-border text-dark" role="status" style={{ width: '15px', height: '15px' }}>
                            <span class="sr-only"></span>
                        </div>
                    ) : (
                        <i className="bi bi-person-fill-gear"></i>
                    )}
                </button>
                <button className="btn btn-primary" onClick={toggleBlock} disabled={selectedUserIds.length === 0}>
                    {loadingToggleBlock ? (
                        <div class="spinner-border text-white " role="status" style={{ width: '15px', height: '15px', marginRight: '5px' }}>
                            <span class="sr-only"></span>
                        </div>
                    ) : (
                        <i className="bi bi-shield-lock" style={{ marginRight: '5px' }}></i>
                    )}
                    {lang === 'en' ? 'Toggle Block' : 'Заблокировать / Разблокировать'}
                </button>
            </div>
            {loading && (
                <div class="spinner-border text-dark d-flex mx-auto mt-2" role="status">
                    <span class="sr-only"></span>
                </div>
            )}
            {!loading && (<div className="table-responsive">
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
                        {loading && (
                            <div class="spinner-border text-dark d-flex justify-content-center mx-auto mt-2 mb-2" role="status">
                                <span class="sr-only"></span>
                            </div>
                        )}
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
            </div>)}
        </div>
    )
}