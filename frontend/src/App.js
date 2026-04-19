import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [skills, setSkills] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const cleanText = (text) => {
    if (!text) return "N/A";
    if (text.length > 50) return "N/A";
    return text;
  };

  // Fetch suggestions
  useEffect(() => {
    axios.get("/skills")
      .then(res => setSuggestions(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setSkills(value);

    const filteredSuggestions = suggestions.filter((s) =>
      s.toLowerCase().includes(value.toLowerCase())
    );

    setFiltered(filteredSuggestions.slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skills.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      const res = await axios.post("/predict", { skills });
      setResults(res.data.results);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🔍 AI Job Recommender</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={skills}
          onChange={handleChange}
          placeholder="Enter skills (Python, React, SQL...)"
          className="input"
        />

        {filtered.length > 0 && (
          <div className="suggestions">
            {filtered.map((item, i) => (
              <div
                key={i}
                className="suggestionItem"
                onClick={() => {
                  setSkills(item);
                  setFiltered([]);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}

        <br /><br />
        <button type="submit" className="button">
          Find Jobs
        </button>
      </form>

      {loading && <div className="spinner"></div>}

      <div className="results">
        {results.length > 0 && <h2>Top Matches</h2>}

        {results.map((job, i) => (
          <div key={i} className="card">
            <h3>{job.title}</h3>
            <p><b>Company:</b> {cleanText(job.company)}</p>
            <p><b>Location:</b> {cleanText(job.location)}</p>

            <div className="barContainer">
              <div className="bar" style={{ width: `${job.score * 100}%` }}></div>
            </div>

            <p>Score: {job.score}</p>

            <p><b>Matched Skills:</b></p>
            <div>
              {job.matched_skills.map((s, idx) => (
                <span key={idx} className="chip green">{s}</span>
              ))}
            </div>

            <p><b>Missing Skills:</b></p>
            <div>
              {job.missing_skills.map((s, idx) => (
                <span key={idx} className="chip red">{s}</span>
              ))}
            </div>

            {job.learning.length > 0 && (
              <>
                <p><b>📚 Learning Path:</b></p>
                <div>
                  {job.learning.map((l, idx) => (
                    <span key={idx} className="chip blue">{l}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;