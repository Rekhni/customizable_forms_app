import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { Link } from "react-router-dom";

export default function ViewTemplate({ isDark, lang }) {
    const { id: templateId } = useParams();
    const [template, setTemplate] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [formAnswers, setFormAnswers] = useState({});
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';
    const API = import.meta.env.VITE_API_URL;

    const fetchComments = async () => {
        try {
            const res = await axios.get(`${API}/comments/${templateId}`);
            setComments(res.data);
        } catch(err) {
            console.error("Failed to fetch comments",err);
        }
    }

    const fetchLikes = async () => {
        try {
            const res = await axios.get(`${API}/likes/${templateId}`);
            setLikes(res.data.count);
        } catch(err) {
            console.error("Failed to fetch likes",err);
        }
    }
    
    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const res = await axios.get(`${API}/templates/${templateId}`, {
                    headers: isLoggedIn ? { Authorization: `Bearer ${token}` } : {}
                });

                setTemplate(res.data);
            } catch(err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        const fetchQuestions = async () => {
            try {
                const res = await axios.get(`${API}/questions/${templateId}`, {
                    headers: isLoggedIn ? { Authorization: `Bearer ${token}` } : {}
                });

                setQuestions(res.data);
            } catch(err) {  
                console.error(err);
            }
        }

        fetchTemplate();
        fetchQuestions();
        fetchLikes();
        fetchComments();
    }, [templateId]);

    const handleSubmitForm = async () => {
        try {
            const payload = {
                templateId,
                answers: Object.entries(formAnswers).map(([questionId, value]) => ({
                    questionId,
                    value: Array.isArray(value) ? value.join(', ') : value
                }))
            }
            setSubmitLoading(true);
            await axios.post(`${API}/forms`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFormAnswers({});
        } catch(err) {
            console.error(err);
            alert('Failed to submit form');
        } finally {
            setSubmitLoading(false);
            alert('Form submitted successfully!');
        }
    }

    const toggleLike = async () => {
        if (!token) {
            alert("Please login to like templates.");
            return;
        }

        try {
            const res = await axios.post(`${API}/likes/${templateId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setLiked(res.data.liked);
            setLikes(prev => res.data.liked ? prev + 1 : prev - 1);
        } catch(err) {
            console.error("Failed to toggle like:", err);
        }
    }

    const postComment = async () => {
        if (!newComment.trim()) return;

        try {
            await axios.post(`${API}/comments/${templateId}`, {
                text: newComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setNewComment('');
            setComments("");
            fetchComments();
        } catch(err) {
            console.error("Failed to add comment:", err);
        }
    }

    const handleAnswerChange = (questionId, value) => {
        setFormAnswers((prev) => ({
            ...prev,
            [questionId]: value
        }));
    };


    return (
        <div className={`${isDark ? 'text-white' : 'text-dark'}`} style={{ padding: '30px 20px' }}>
            {loading && (
                <div class="spinner-border text-dark d-flex mx-auto mt-3" role="status">
                    <span class="sr-only"></span>
                </div>
            )}
            {!loading && (<div className={`mx-auto rounded shadow ${isDark ? 'dark-mode' : 'light-mode'} border-info`} style={{ height: '100%', maxWidth: '700px', marginTop: '20px', padding: '30px' }}>
                <img src={template.imageUrl} alt="template img" className="rounded" style={{ objectFit: 'cover', width: '100%', height: '200px' }}/>
                {(template && (user?.id === template.userId || isAdmin)) && (
                    <Link to={`/template/${template.id}/edit`}>
                        <button className={`rounded btn ${isDark ? 'btn-outline-dark border-white text-white' : 'btn-outline-light border-dark text-dark'}  mt-3 mb-3`} style={{ marginTop: '10px' }}><i className="bi bi-pencil"></i> {lang === 'en' ? 'Edit' : 'Редактировать'}</button>
                    </Link>
                )}
                <h2>{template.title}</h2>
                <p><em>{template.description}</em></p>
                <hr />
                {questions.map((q) => (
                    <div key={q.id} style={{ marginBottom: '1rem' }}>
                        <strong>{q.title}</strong><br />
                        {q.description && <em>{q.description}</em>}<br />

                        {!isLoggedIn ? (
                        <p className={`${isDark ? 'text-white' : 'text-dark'}`}>{lang === 'en' ? '[Login to answer]' : '[Авторизуйтесь чтобы ответить]'}</p>
                        ) : (
                        <>
                            {q.type === 'single-line' && (
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={formAnswers[q.id] || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)} 
                                />
                            )}
                            {q.type === 'multi-line' && (
                                <textarea 
                                    type="text" 
                                    className="form-control"
                                    value={formAnswers[q.id || '']}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)} 
                                />
                            )}
                            {q.type === 'integer' && (
                                <input 
                                    type="number" 
                                    className="form-control"
                                    value={formAnswers[q.id || '']}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)} 
                                />
                            )}
                            {q.type === 'checkbox' && (
                            <div>
                                {q.options.map((opt, j) => (
                                <div key={j}>
                                    <label>
                                        <input 
                                            type="checkbox"
                                            checked={Array.isArray(formAnswers[q.id]) && formAnswers[q.id].includes(opt)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFormAnswers((prev) => {
                                                    const existing = Array.isArray(prev[q.id]) ? [...prev[q.id]] : [];
                                                    return {
                                                        ...prev,
                                                        [q.id]: checked 
                                                        ? [...existing, opt] 
                                                        : existing.filter(o => o !== opt)
                                                    };
                                                });
                                            }}
                                        />{" "}
                                        {opt}
                                    </label>
                                </div>
                                ))}
                            </div>
                            )}
                        </>
                        )}
                    </div>
                    ))}
                    <hr />
                    <div>
                        <button onClick={toggleLike} className={`btn btn-sm ${isDark ? 'btn-outline-dark text-white border-white' : 'btn-outline-light text-dark border-dark'} me-2`}>
                            {liked ? <i className="bi bi-hand-thumbs-up-fill"></i> : <i className="bi bi-hand-thumbs-up"></i>} {likes}
                        </button>   
                    </div>

                    <hr />
                    <h4>{lang === 'en' ? 'Comments' : 'Комментарии'}</h4>
                    <div className="mb-3">
                        {Array.isArray(comments) && comments.map((c, i) => (
                            <div key={i} className="border-bottom border-secondary pb-2 mb-2">
                                <strong>{c.User?.name || c.User?.email}</strong> <br />
                                <span>{c.text}</span>
                            </div>
                        ))}
                    </div>
                    {isLoggedIn && (
                        <div className="d-flex flex-column flex-md-row gap-2">
                            <input 
                                type="text" 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="form-control w-75 w-md-75"
                                placeholder={`${lang === 'en' ? 'Write a comment...' : 'Напишите комментарий...'}`}
                            />
                            <button 
                                className={`rounded btn ${isDark ? "btn-outline-dark text-white border-white" : 'btn-outline-light text-dark border-dark'}`} 
                                onClick={postComment}
                            >
                                {lang === 'en' ? 'Add' : 'Написать'}
                            </button>
                        </div>
                    )}
                    {(isLoggedIn && submitLoading) && (
                        <div class="spinner-border text-dark mt-3" role="status">
                            <span class="sr-only"></span>
                        </div>
                    )}
                    {(isLoggedIn && !submitLoading) && (
                        <div className="mt-4">
                            <button  className={`rounded btn ${isDark ? 'btn-outline-dark text-white border-white' : 'btn-outline-light text-dark border-dark'}`} onClick={handleSubmitForm}>{lang === 'en' ? 'Submit Form' : 'Сдать форму'}</button>
                        </div>
                    )}
            </div>)}


        </div>
    )
}