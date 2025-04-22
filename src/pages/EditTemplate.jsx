import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import CloudinaryUpload from "../components/CloudinaryUpload";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function EditTemplate({ isDark, lang }) {
    const { id: templateId } = useParams();
    const [template, setTemplate] = useState({ questions: [] });
    const [loading, setLoading] = useState(true);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingAddQuestion, setLoadingAddQuestion] = useState(false);
    const [newImage, setNewImage] = useState("");
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        type: 'single-line',
        title: '',
        options: ['', ''],
        showInTable: false
      });
    const API = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const handleQuestionChange = (index, field, value) => {
        setTemplate(prev => {
          const updated = [...prev.questions];

          if (field ==='type' && value === 'checkbox' && !Array.isArray(updated[index].options)) {
            updated[index].options = ['', ''];
          }

          updated[index][field] = value;
          return { ...prev, questions: updated };
        });
    };
      
    const handleOptionChange = (qIndex, optIndex, value) => {
        setTemplate(prev => {
          const updated = [...prev.questions];
          updated[qIndex].options[optIndex] = value;
          return { ...prev, questions: updated };
        });
    };
      
    const addOption = (qIndex) => {
        setTemplate(prev => {
          const updated = [...prev.questions];
          updated[qIndex].options.push("");
          return { ...prev, questions: updated };
        });
    };
      
    const removeOption = (qIndex, optIndex) => {
        setTemplate(prev => {
          const updated = [...prev.questions];
          updated[qIndex].options.splice(optIndex, 1);
          return { ...prev, questions: updated };
        });
    };

    const handleDeleteSelected = () => {
        if (selectedQuestions.length === 0) return;
        const confirmDelete = window.confirm("Are you sure you want to delete selected questions?");
        if (!confirmDelete) return;
    
        setTemplate(prev => {
            const updated = prev.questions.filter((q, i) => !selectedQuestions.includes(i));
            const removed = prev.questions.filter((q, i) => selectedQuestions.includes(i) && q.id);
    
            setDeletedQuestionIds(prev => [...prev, ...removed.map(q => q.id)]);
            return { ...prev, questions: updated };
        });
    
        setSelectedQuestions([]);
    };

    const toggleSelectQuestion = (index) => {
        setSelectedQuestions(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };


    useEffect(() => {
        const fetchData = async () => {
          try {
            const templateRes = await axios.get(`${API}/templates/${templateId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
      
            const templateData = templateRes.data;
      
            const questionsRes = await axios.get(`${API}/questions/${templateId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
      
            setTemplate({ ...templateData, questions: questionsRes.data });
            setLoading(false);
          } catch (err) {
            console.error("Failed to fetch template or questions:", err);
          }
        };
      
        fetchData();
      }, [templateId]);
      

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTemplate((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                title: template.title,
                description: template.description,
                topic: template.topic,
                imageUrl: newImage || template.imageUrl,
                tags: typeof template.tags === "string" ? template.tags.split(",").map(t => t.trim()) : template.tags
            }
            setLoadingSave(true);
            await axios.put(`${API}/templates/${templateId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            for (let i = 0; i < template.questions.length; i++) {
                const q = template.questions[i];
              
                if (q.id) {
                  await axios.put(`${API}/questions/${q.id}`, {
                    type: q.type,
                    title: q.title,
                    order: i,
                    options: q.type === 'checkbox' ? q.options : null,
                    showInTable: q.showInTable 
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                }
              }
              

              for (const qId of deletedQuestionIds) {
                await axios.delete(`${API}/questions/${qId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
              }
            
            
            setLoadingSave(false);
            setDeletedQuestionIds([]);
            navigate(`/template/${templateId}/preview`);
        } catch(err) {
            console.error(err);
        }
    };

    return (
        <div className={`container pt-4 ${isDark ? 'text-white' : 'text-dark'} p-4`}>
            {loading && (
                <div class="spinner-border text-dark d-flex mx-auto mt-3" role="status">
                    <span class="sr-only"></span>
                </div>
            )}
            {!loading && (<form onSubmit={handleSubmit} className={`mt-3 w-lg-50 mx-auto rounded shadow ${isDark ? 'dark-mode' : 'light-mode'} border-info`} style={{ padding: '20px', maxWidth: '700px' }}>
                <h2>{lang === 'en' ? 'Edit Template' : 'Редактировать шаблон'}</h2>
                <div className="mb-3">
                    <label className="form-label">{lang === 'en' ? 'Title' : 'Название'}</label>
                    <input
                    name="title"
                    className="form-control"
                    value={template.title}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">{lang === 'en' ? 'Description' : 'Описание'}</label>
                    <textarea
                    name="description"
                    className="form-control"
                    value={template.description}
                    onChange={handleChange}
                    />
                </div>
        
                <div className="mb-3">
                    <label className="form-label">{lang === 'en' ? 'Topic' : 'Тема'}</label>
                    <input
                    name="topic"
                    className="form-control"
                    value={template.topic}
                    onChange={handleChange}
                    />
                </div>
        
                <div className="mb-3">
                    <label className="form-label">{lang === 'en' ? 'Tags (comma-separated)' : 'Теги (разделенные-запятыми)'}</label>
                    <input
                    name="tags"
                    className="form-control"
                    value={Array.isArray(template.tags) ? template.tags.join(", ") : template.tags}
                    onChange={handleChange}
                    />
                </div>
        
                <div className="mb-3">
                    <label className="form-label">{lang === 'en' ? 'Image' : 'Картина'}</label>
                    <CloudinaryUpload onUpload={(url) => setNewImage(url)} isDark={isDark}/>
                    {template.imageUrl && !newImage && (
                        <img src={template.imageUrl} alt={template.title} className="mt-2 rounded" style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}/>
                    )}
                    {newImage && (
                        <img src={newImage} alt="New image" className="mt-2 rounded" style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}/>
                    )}
                </div>
                <hr />
                <h4 className="mt-5">{lang === 'en' ? 'Questions' : 'Вопросы'}</h4>
                <div className="d-flex align-items-center gap-3 mb-3">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowAddQuestion(true)}
                    >
                        <i className="bi bi-plus-square"></i>
                    </button>

                    <button
                        style={{ cursor: 'pointer' }}
                        className="btn btn-danger"
                        onClick={handleDeleteSelected}
                        disabled={selectedQuestions.length === 0}
                    >
                        <i className="bi bi-trash"></i> 
                    </button>
                </div>
                {template.questions?.length === 0 && <p className="text-muted">
                    {lang === 'en' ? 'No questions added yet.' : 'Пока вопросов нет.'}
                </p>}

                <DragDropContext onDragEnd={(result) => {
                    const { source, destination } = result;
                    if (!destination) return;

                    const updated = Array.from(template.questions);
                    const [moved] = updated.splice(source.index, 1);
                    updated.splice(destination.index, 0, moved);

                    setTemplate(prev => ({ ...prev, questions: updated }));
                }}>
                    <Droppable droppableId="questions">
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                {template.questions?.map((q, i) => (
                                    <Draggable key={q.id || i} draggableId={(q.id || i).toString()} index={i}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`p-3 mb-3 border rounded ${isDark ? 'text-white border-white dark-mode' : 'text-dark border-dark light-mode'} ${selectedQuestions.includes(i) ? 'border-warning' : ''}`}
                                                onClick={() => toggleSelectQuestion(i)}
                                                style={{ cursor: 'pointer', padding: '20px', ...provided.draggableProps.style }}
                                            >
                                                <h5>#{i + 1}</h5>
                                                <div className="mb-2">
                                                    <label>{lang === 'en' ? 'Type:' : 'Тип:'}</label>
                                                    <select
                                                        className="form-select"
                                                        value={q.type}
                                                        onChange={(e) => handleQuestionChange(i, 'type', e.target.value)}
                                                    >
                                                        <option value="single-line">{lang === 'en' ? 'Single-Line' : 'Однострочный'}</option>
                                                        <option value="multi-line">{lang === 'en' ? 'Multi-Line' : 'Многострочный'}</option>
                                                        <option value="integer">{lang === 'en' ? 'Integer' : 'Число'}</option>
                                                        <option value="checkbox">{lang === 'en' ? 'Checkbox' : 'Флажки'}</option>
                                                    </select>
                                                </div>
                                                <input
                                                    className="form-control mb-2"
                                                    placeholder={`${lang==='en' ? 'Title' : 'Название'}`}
                                                    value={q.title}
                                                    onChange={(e) => handleQuestionChange(i, 'title', e.target.value)}
                                                />
                                                <div className="form-check mb-2">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={q.showInTable}
                                                        onChange={(e) => handleQuestionChange(i, 'showInTable', e.target.checked)}
                                                    />
                                                    <label className="form-check-label">{lang === 'en' ? 'Show in results' : 'Показать вопрос в форме'}</label>
                                                </div>
                                                {q.type === 'checkbox' && (
                                                    <div className="mb-2">
                                                        <label>{lang === 'en' ? 'Options:' : 'Варианты:'}:</label>
                                                        {q.options.map((opt, j) => (
                                                        <div key={j} className="d-flex gap-2 mb-1">
                                                            <input
                                                            className="form-control"
                                                            value={opt}
                                                            onChange={(e) => handleOptionChange(i, j, e.target.value)}
                                                            />
                                                            <button className="btn btn-danger btn-sm" type="button" onClick={() => removeOption(i, j)}>
                                                                <i class="bi bi-x-lg"></i>
                                                            </button>
                                                        </div>
                                                        ))}
                                                        <button className={`btn btn-sm ${isDark ? 'btn-outline-dark text-white border-white' : 'btn-outline-light text-dark border-dark'} mt-1`} type="button" onClick={() => addOption(i)}>
                                                            <i className="bi bi-plus"></i> {lang === 'en' ? 'Add option' : 'Добавить вариант'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {showAddQuestion && (
                <div className={`p-3 rounded mb-4 ${isDark ? 'dark-mode text-white border-white' : 'light-mode text-dark border-dark'}`} style={{ cursor: 'pointer', padding: '20px' }}>
                    <h5>{lang === 'en' ? 'New question' : 'Новый вопрос'}</h5>
                    <select
                    className="form-select mb-2"
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                    >
                    <option value="single-line">{lang === 'en' ? 'Single-Line' : 'Однострочный'}</option>
                    <option value="multi-line">{lang === 'en' ? 'Multi-Line' : 'Многострочный'}</option>
                    <option value="integer">{lang === 'en' ? 'Integer' : 'Число'}</option>
                    <option value="checkbox">{lang === 'en' ? 'Checkbox' : 'Флажки'}</option>
                    </select>

                    <input
                    className="form-control mb-2"
                    placeholder={`${lang==='en' ? 'Question' : 'Вопрос'}`}
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                    />

                    {newQuestion.type === 'checkbox' && (
                    <div className="mb-2">
                        <label>{lang==='en' ? 'Options' : 'Варианты:'}:</label>
                        {newQuestion.options.map((opt, i) => (
                        <div key={i} className="d-flex gap-2 mb-1">
                            <input
                            className="form-control"
                            value={opt}
                            onChange={(e) => {
                                const updated = [...newQuestion.options];
                                updated[i] = e.target.value;
                                setNewQuestion(prev => ({ ...prev, options: updated }));
                            }}
                            />
                            <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                                const updated = [...newQuestion.options];
                                updated.splice(i, 1);
                                setNewQuestion(prev => ({ ...prev, options: updated }));
                            }}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        ))}
                        <button
                        type="button"
                        className={`btn btn-sm mt-2 ${isDark ? 'border-white btn-outline-dark text-white' : 'border-dark btn-outline-light text-dark'} `}
                        onClick={() => setNewQuestion(prev => ({ ...prev, options: [...prev.options, ''] }))}
                        >
                            <i className="bi bi-plus"></i> {lang==='en' ? 'Add option' : 'Добавить вариант'}
                        </button>
                    </div>
                    )}
                    {loadingAddQuestion && (
                        <div class="spinner-border text-dark mt-3" role="status">
                            <span class="sr-only"></span>
                        </div>
                    )}
                    {!loadingAddQuestion && (<button
                    type="button"
                    className={`btn ${isDark ? 'border-white text-white btn-outline-dark' : 'border-dark text-dark btn-outline-light'}`}
                    onClick={async () => {
                        try {
                            setLoadingAddQuestion(true);
                        const res = await axios.post(`${API}/questions/${templateId}`, {
                            ...newQuestion,
                            options: newQuestion.type === 'checkbox' ? newQuestion.options : null
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        setTemplate(prev => ({
                            ...prev,
                            questions: [...prev.questions, res.data]
                        }));

                        setNewQuestion({
                            type: 'single-line',
                            title: '',
                            description: '',
                            showInTable: false,
                            options: ['', ''],
                        });
                        
                        setLoadingAddQuestion(false);
                        setShowAddQuestion(false);
                        } catch (err) {
                        console.error("Failed to add question:", err);
                        } finally {
                            setLoadingAddQuestion(false);
                        }
                    }}
                    >
                    <i className="bi bi-plus"></i> {lang==='en' ? 'Add question' : 'Добавить вопрос'}
                    </button>)}
                </div>
                )}
                {loadingSave && (
                    <div class="spinner-border text-dark mt-3" role="status">
                        <span class="sr-only"></span>
                    </div>
                )}
                {!loadingSave && (
                    <button type="submit" className={`btn ${isDark ? 'btn-outline-dark text-white border-white' : 'btn-outline-light text-dark border-dark'} mt-2`}>{lang==='en' ? 'Save' : 'Сохранить'}</button>
                )}
            </form>)}
      </div>
    )
}