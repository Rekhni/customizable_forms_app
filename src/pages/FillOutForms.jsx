import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function FillOutForms({ isDark, lang }) {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const [selectedForms, setSelectedForms] = useState([]);
    const API = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const res = await axios.get(`${API}/forms`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                setForms(res.data);
            } catch(err) {
                console.error("Failed to fetch forms:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchForms();
    }, [])

    const handleDeleteSelected = async () => {
        if (!window.confirm(lang === 'en' ? 'Are you sure?' : 'Вы уверены?')) return;

        try {
            await axios.delete(`${API}/forms`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { ids: selectedForms }
            });

            setForms(prev => prev.filter(f => !selectedForms.includes(f.id)));
            setSelectedForms([]);
        } catch(err) {
            console.error("Failed to delete forms:", err);
            alert(lang === 'en' ? 'Delete failed' : 'Ошибка удаления')
        }
    }

    if (loading) return <div class="spinner-border text-dark d-flex m-auto" role="status"><span class="sr-only"></span></div>

    return (
        <div className={`container pt-4 ${isDark ? 'text-white' : 'text-dark'} pb-4`} style={{ maxWidth: '50%' }}>
            <h2>{lang === 'en' ? 'Submitted Forms' : 'Заполненные формы'}</h2>
            {selectedForms.length > 0 && (
              <button className="btn btn-danger mb-2" onClick={handleDeleteSelected} disabled={selectedForms.length === 0}>
                    <i className="bi bi-trash"></i> 
              </button>  
            )}
            <div style={{ maxHeight: '550px', overflowY: 'auto' }}>
                {forms.length === 0 ? (
                    <p className="text-muted">{lang === 'en' ? 'No forms found.' : 'Пока заполненных форм нет.'}</p>
                ) : (
                    forms.map((form, i) => (
                        <form
                            key={form.id}
                            className={`p-3 mb-2 rounded shadow-sm border ${isDark ? 'border-success dark-mode' : 'border-secondary light-mode'}`}
                            >
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={selectedForms.includes(form.id)}
                                    onChange={() => {
                                    setSelectedForms(prev =>
                                        prev.includes(form.id)
                                        ? prev.filter(id => id !== form.id)
                                        : [...prev, form.id]
                                    );
                                    }}
                                />
                                </div>

                                <Link
                                to={`/filled-forms/${form.id}`}
                                className={`flex-grow-1 text-decoration-none ${isDark ? 'text-white' : 'text-dark'}`}
                                >
                                <div className="d-flex justify-content-between ms-3">
                                    <p>{i + 1} - {form.template?.title}</p>
                                    <div className={`d-flex gap-3 text-end ${isDark ? 'text-white' : 'text-dark'}`}>
                                    <div>{form.user?.name || form.user?.email}</div>
                                    <div>{new Date(form.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                </Link>
                            </div>
                        </form>

                    ))
                )}
            </div>
        </div>
    )
}