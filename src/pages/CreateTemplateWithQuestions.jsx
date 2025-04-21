import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { checkIfBlocked } from "../utils/checkBlocked.js";
import CloudinaryUpload from "../components/CloudinaryUpload.jsx";

export default function CreateTemplateWithQuestions({ isDark, lang }) {
    
    const [template, setTemplate] = useState({
        title: '',
        description: '',
        topic: 'Other',
        tags: '',
        imageUrl: ''
    });

    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState({
        type: 'single-line',
        title: '',
        description: '',
        options: ['', ''],
        showInTable: false
    });

    useEffect(() => {
        checkIfBlocked(navigate);
    })

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleTemplateChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTemplate((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleQuestionChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentQuestion((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        setCurrentQuestion((prev) => ({ ...prev, options: [...prev.options, ''] }))
    };

    const removeOption = (index) => {
        const newOptions = [...currentQuestion.options];
        newOptions.splice(index, 1);
        setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
    };

    const addQuestion = () => {
        setQuestions((prev) => [...prev, { ...currentQuestion, id: Date.now() }]);
        setCurrentQuestion({ type: 'single-line', title: '', description: '', options: ['', ''], showInTable: false });
    };

    const handleSubmit = async (e) => {
        const API = import.meta.env.VITE_API_URL;
        e.preventDefault();

        try {
            const payload = {
                ...template,
                tags: template.tags.split(',').map(t => t.trim())
            };

            const res = await axios.post(`${API}/templates`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const templateId = res.data.id;

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                await axios.post(`${API}/questions/${templateId}`, {
                    type: q.type,
                    title: q.title,
                    description: q.description,
                    showInTable: q.showInTable,
                    order: i,
                    options: q.type === 'checkbox' ? q.options : null
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // navigate(`/template/${templateId}/edit`)
            navigate('/');
        } catch(err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div className={`d-flex flex-column gap-3 mx-auto rounded shadow w-lg-50 ${isDark ? 'text-white dark-mode' : 'text-dark light-mode'} border-info`} style={{ marginBottom: '2rem', padding: '20px', maxWidth: '60%'}}>
                <h2>{lang === 'en' ? 'Create Template' : 'Создать шаблон'}</h2>
                <input 
                    name="title" 
                    placeholder={`${lang === 'en' ? 'Title' : 'Название'}`} 
                    value={template.title} 
                    onChange={handleTemplateChange} 
                    required
                    className="w-md-75"
                />
                <textarea 
                    name="description" 
                    placeholder={`${lang === 'en' ? 'Description' : 'Описание'}`}
                    value={template.description} 
                    onChange={handleTemplateChange} 
                />
                <select name="topic" value={template.topic} onChange={handleTemplateChange}>
                    <option value="Other">Other</option>
                    <option value="Information request">Information request</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Appointment">Appointment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Product Order">Product Order</option>
                    <option value="Education">Education</option>
                    <option value="Hotel booking">Hotel booking</option>
                </select>
                <input 
                    name="tags" 
                    placeholder={`${lang === 'en' ? 'Tags(comma-separated)' : 'Теги(разделенные-запятыми)'}`}
                    value={Array.isArray(template.tags) ? template.tags.join(', ') : template.tags} 
                    onChange={handleTemplateChange} 
                />
                <CloudinaryUpload onUpload={(url) => setTemplate(prev => ({ ...prev, imageUrl: url }))}/>
                {template.imageUrl && <img src={template.imageUrl} alt="Preview" className="mt-2" style={{ maxWidth: '200px' }} />}
            </div>

            <hr />
            <div className={`d-flex flex-column gap-3 mx-auto rounded shadow w-lg-50 ${isDark ? 'text-white dark-mode' : 'text-dark light-mode'} `} style={{ padding: '20px', maxWidth: '60%' }}>
                <h3>{lang === 'en' ? 'New Question' : 'Новый Вопрос'}</h3>
                <select name="type" value={currentQuestion.type} onChange={handleQuestionChange}>
                    <option value="single-line">{lang === 'en' ? 'Single-Line' : 'Однострочный'}</option>
                    <option value="multi-line">{lang === 'en' ? 'Multi-Line' : 'Многострочный'}</option>
                    <option value="integer">{lang === 'en' ? 'Integer' : 'Число'}</option>
                    <option value="checkbox">{lang === 'en' ? 'Checkbox' : 'Флажки'}</option>
                </select>
                <input className="rounded" name="title" placeholder={`${lang === 'en' ? 'Question' : 'Вопрос'}`} value={currentQuestion.title} onChange={handleQuestionChange} />
                <div className="form-check mb-2">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={currentQuestion.showInTable}
                        id="showInTable"
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, showInTable: e.target.checked }))}
                    />
                    <label className="form-check-label" htmlFor="showInTable">
                        {lang === 'en' ? 'Show in results' : 'Показать вопрос в форме'}
                    </label>
                </div>
                {currentQuestion.type === 'checkbox' && (
                    <div className="d-flex flex-column gap-3">
                        <h5>{lang === 'en' ? 'Options:' : 'Варианты:'}</h5>
                        {currentQuestion.options.map((opt, i) => (
                            <div key={i}>
                                <input className="rounded" value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} placeholder={`${lang === 'en' ? 'Option' : 'Вариант'} ${i + 1}`}/>
                                <button type="button" className="btn btn-danger btn-sm" style={{ marginLeft: '5px' }} onClick={() => removeOption(i)}>
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        ))}
                        <button className={`rounded btn ${isDark ? 'btn-outline-dark border-white text-white' : 'btn-outline-light border-dark text-dark'}`} style={{ width: '50%', }} type="button" onClick={addOption}>
                            {lang === 'en' ? 'Add option' : 'Добавить вариант'}
                        </button>
                    </div>
                )}
                <button className={`rounded btn ${isDark ? 'btn-outline-dark border-white text-white' : 'btn-outline-light border-dark text-dark'} `} type="button" onClick={addQuestion}>
                {lang === 'en' ? 'Add question' : 'Добавить вопрос'}
                </button>
            </div>

            <hr />
            <h3>{template.title}</h3>
            <h4>{template.description}</h4>
            <ul>
                {questions.map((q, i) => (
                    <li key={i}>
                        <strong>#{i + 1}:</strong> {q.title}  <br />
                        {q.type === 'single-line' && (
                            <input className="rounded" type="text" name="answer" placeholder={`${lang === 'en' ? 'Answer' : 'Ответ'}`}/>
                        )}
                        {q.type === 'checkbox' && (
                            <div style={{ marginTop: '0.5rem' }}>
                                {q.options?.map((opt, j) => (
                                    <div key={j}>
                                        <label>
                                            <input className="rounded" type="checkbox" /> {opt || '(Empty option)'}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <button  className={`rounded btn d-flex mx-auto ${isDark ? 'btn-success border-white text-white' : 'btn-success border-dark'}`} onClick={handleSubmit} style={{ marginTop: '2rem' }}>
            {lang === 'en' ? 'Save template' : 'Сохранить шаблон'}
            </button>
        </div>
    );
}