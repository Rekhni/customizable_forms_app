import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import CreateTemplateWithQuestions from "./pages/CreateTemplateWithQuestions";
import ViewTemplate from './pages/ViewTemplate';
import EditTemplate from "./pages/EditTemplate";
import FillOutForms from "./pages/FillOutForms";
import Users from './pages/Users';
import SearchResults from "./pages/SearchResults";
import FormDetails from "./pages/FormDetails";
import './App.css';
import { useState, useEffect } from "react";


function App() {

  const backupImg = 'https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdjEwMTYtYy0wOF8xLWtzaDZtemEzLmpwZw.jpg'

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === 'dark';
  });
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'en');

  useEffect(() => {
    document.body.className = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language])



  return (
    <Router>
      <Navbar isDark={isDark} onToggleTheme={() => setIsDark(prev => !prev)} lang={language} onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'ru' : 'en'))}/>
      <div className={`${isDark ? 'bg-theme-dark' : 'bg-theme-light'}`} style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Dashboard isDark={isDark} lang={language} backupImg={backupImg} />} />
          <Route path="/login" element={<Login isDark={isDark} lang={language} />}/>
          <Route path="/register" element={<Register isDark={isDark} lang={language} />} />
          <Route path="/templates/new" element={<PrivateRoute> <CreateTemplateWithQuestions isDark={isDark} lang={language} /> </PrivateRoute>}/>
          <Route path="/template/:id/preview" element={<ViewTemplate isDark={isDark} lang={language} backupImg={backupImg}/>}/>
          <Route path="/template/:id/edit" element={<PrivateRoute><EditTemplate isDark={isDark} lang={language} /></PrivateRoute>}/>
          <Route path="/users" element={<PrivateRoute><Users isDark={isDark} lang={language}/></PrivateRoute>}/>
          <Route path="/search" element={<PrivateRoute><SearchResults isDark={isDark} lang={language}/></PrivateRoute>}/>
          <Route path="/filled-forms" element={<PrivateRoute><FillOutForms isDark={isDark} lang={language}  /></PrivateRoute>}/>
          <Route path="/filled-forms/:formId" element={<PrivateRoute><FormDetails isDark={isDark} lang={language} backupImg={backupImg} /></PrivateRoute>}/>
        </Routes>
      </div>
    </Router>
  )
}

export default App
