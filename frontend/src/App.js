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

  const str = text.toString();

  // Remove long garbage text
  if (str.length > 60) return "N/A";

  // Remove unwanted phrases
  const badWords = ["demonstrated", "proficiency", "communication", "detail"];

  for (let word of badWords) {
    if (str.toLowerCase().includes(word)) {
      return "N/A";
    }
  }

  return str;
};
  // 🔥 Fetch suggestions
  useEffect(() => {
    axios
      .get("http://localhost:5000/skills")
      .then((res) => setSuggestions(res.data))
      .catch((err) => console.log(err));
  }, []);

  // 🔥 Handle typing
  const handleChange = (e) => {
    const value = e.target.value;
    setSkills(value);

    const filteredSuggestions = suggestions.filter((s) =>
      s.toLowerCase().includes(value.toLowerCase())
    );

    setFiltered(filteredSuggestions.slice(0, 5));
  };

  // 🔥 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!skills.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      const res = await axios.post("http://localhost:5000/predict", {
        skills: skills,
      });

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
          placeholder="Enter skills (Python, ML, React...)"
          className="input"
        />

        {/* 🔥 Suggestions Dropdown */}
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

      {/* 🔥 Spinner */}
      {loading && <div className="spinner"></div>}

      <div className="results">
        {results.length > 0 && <h2>Top Matches</h2>}

        {results.map((job, i) => (
          <div key={i} className="card">
            <h3>{job.title}</h3>
            <p><b>Company:</b> {job.company}</p>
            <p><b>Location:</b> {job.location}</p>

            {/* 📊 Similarity Bar */}
            <div className="barContainer">
              <div
                className="bar"
                style={{ width: `${job.score * 100}%` }}
              ></div>
            </div>
            <p>Score: {job.score}</p>

            {/* ✅ Matched Skills */}
            <p><b>Matched Skills:</b></p>
            <div>
              {job.matched_skills.map((s, idx) => (
                <span key={idx} className="chip green">
                  {s}
                </span>
              ))}
            </div>

            {/* ❌ Missing Skills */}
            <p><b>Missing Skills:</b></p>
            <div>
              {job.missing_skills.map((s, idx) => (
                <span key={idx} className="chip red">
                  {s}
                </span>
              ))}
            </div>

            {/* 📚 Learning Suggestions */}
            {job.learning.length > 0 && (
              <>
                <p><b>📚 Learning Path:</b></p>
                <div>
                  {job.learning.map((l, idx) => (
                    <span key={idx} className="chip blue">
                      {l}
                    </span>
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