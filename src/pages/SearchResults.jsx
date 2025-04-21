import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { TemplateGrid } from "../components/TemplateGrid";

export default function SearchResults({ isDark, lang }) {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const API = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axios.get(`${API}/templates/search?query=${query}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResults(res.data);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        };

        if (query) fetchResults();
    }, [query]);

    if (loading) return <p className={`${isDark ? 'text-white' : 'text-dark'} p-4`}>{lang==='en' ? 'Loading results...' : 'Шаблоны загружаются...'}</p>;

    return (
        <div className={`container pt-4 ${isDark ? 'text-white' : 'text-dark'}`}>
            <h2>{lang==='en' ? 'Search results for:' : 'Результаты на:'} <span className="text-info">{query}</span></h2>

            {results.length === 0 ? (
                <p className="text-muted">{lang==='en' ? 'No matching templates found.' : 'Нет подходящих шаблонов.'}</p>
            ) : (
                <div className="row mt-4">
                    <TemplateGrid templates={results} isDark={isDark} />
                </div>
            )}
        </div>
    );
}
