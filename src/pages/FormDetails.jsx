import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function FormDetails({ isDark, lang }) {
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const API = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await axios.get(`${API}/forms/${formId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setForm(res.data);
            } catch(err) {
                console.error('failed to fetch form', err);
            } finally {
                setLoading(false);
            }
        }

        fetchForm();

    }, [formId]);

    return (
        <div className={`container ${isDark ? 'text-white' : 'text-dark'} pt-2`} style={{ maxWidth: '1000px' }}>
            {loading && (
                <div class="spinner-border text-dark d-flex mx-auto mt-3" role="status">
                    <span class="sr-only"></span>
                </div>
            )}
            {!loading && (<div className={`m-4 d-flex flex-column justify-content-center align-items-center border-info rounded shadow text-center ${isDark ? 'dark-mode' : 'light-mode'}`}>
                <img src={form.template?.imageUrl} alt="form image" className="rounded" style={{ objectFit: 'cover', width: '100%', height: '200px' }}/>
                <h2 style={{ fontSize: '50px' }}>{form.template?.title}</h2>
                <p className="pb-0">{new Date(form.createdAt).toLocaleDateString()} {lang === 'en' ? 'by' : 'от'} {form.user?.name || form.user?.email}</p>
                
                <hr />
                {form.answers.map((ans, i) => (
                    ans.question?.showInTable && (
                        <div key={i} className="mb-3">
                        <strong style={{ fontSize: '20px' }}>{i + 1}  {ans.question?.title}</strong>
                        <div className="ms-3">
                            {Array.isArray(ans.value) ? (
                                <ul>
                                    {ans.value.map((val, j) => (
                                        <li key={j} style={{ fontSize: '15px' }}>{lang === 'en' ? 'Answer: ' : 'Ответ: '}{val}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span style={{ fontSize: '15px' }}>{lang === 'en' ? 'Answer: ' : 'Ответ: '} {ans.value}</span>
                            )}
                        </div>
                    </div>
                    )
                ))}
            </div>)}
        </div>
    )
}