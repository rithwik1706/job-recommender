from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re

app = Flask(__name__)
CORS(app)

print("Loading model + data...")

model = SentenceTransformer('all-MiniLM-L6-v2')
df = joblib.load("models/jobs_df.pkl")
job_embeddings = joblib.load("models/job_embeddings.pkl")

print("Ready!")

# ---------------------------------------------------
# 🔥 SKILLS
# ---------------------------------------------------

COMMON_SKILLS = {
    "python", "java", "react", "node", "aws", "docker",
    "machine learning", "deep learning", "nlp",
    "sql", "mongodb", "mysql",
    "pandas", "numpy", "tensorflow",
    "javascript", "html", "css",
    "flask", "django", "git", "linux"
}

# ---------------------------------------------------
# 🔥 SKILL EXTRACTION
# ---------------------------------------------------

def extract_skills(text):
    text = text.lower()
    found = set()
    for skill in COMMON_SKILLS:
        if re.search(rf"\b{re.escape(skill)}\b", text):
            found.add(skill)
    return found

# ---------------------------------------------------
# 🔥 MATCHING
# ---------------------------------------------------

def get_skill_match(user_text, job_text):
    user_skills = extract_skills(user_text)
    job_skills = extract_skills(job_text)

    matched = list(user_skills & job_skills)
    missing = [s for s in (job_skills - user_skills) if s in COMMON_SKILLS]

    return matched, missing

# ---------------------------------------------------
# 🔥 CLEAN COMPANY
# ---------------------------------------------------

def get_company(row):
    company = str(row.get("company_name", "")).strip()

    if (
        not company or
        len(company) < 3 or len(company) > 20 or
        re.search(r"\d", company) or
        any(c in company for c in [".", ",", ";"]) or
        company.lower() in COMMON_SKILLS
    ):
        return "Tech Company"

    return company

# ---------------------------------------------------
# 🔥 CLEAN LOCATION
# ---------------------------------------------------

def get_location(row):
    location = str(row.get("location", "")).strip()

    if (
        not location or
        len(location) < 3 or len(location) > 20 or
        re.search(r"\d", location) or
        any(c in location for c in [".", ",", ";"])
    ):
        return "Remote"

    return location

# ---------------------------------------------------
# 🔥 LEARNING PATH
# ---------------------------------------------------

def get_learning_resources(skills):
    resources = {
        "python": "Python Course",
        "machine learning": "ML - Andrew Ng",
        "deep learning": "Deep Learning Specialization",
        "react": "React Docs",
        "docker": "Docker Course",
        "aws": "AWS Cloud Practitioner",
        "sql": "SQL for Data Analysis",
        "javascript": "JavaScript Guide",
        "flask": "Flask Tutorial",
        "django": "Django Course"
    }

    return list({resources[s] for s in skills if s in resources})[:3]

# ---------------------------------------------------
# 🚀 FINAL PREDICT
# ---------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    user_input = data.get("skills", "").strip()

    if not user_input:
        return jsonify({"results": []})

    # Clean input
    user_input_clean = re.sub(r'[^a-zA-Z ]', ' ', user_input.lower())

    # 🔥 Expand if only 1 skill (important fix)
    if len(user_input_clean.split()) == 1:
        user_input_clean += " programming development backend"

    user_embedding = model.encode([user_input_clean])
    similarities = cosine_similarity(user_embedding, job_embeddings).flatten()

    top_indices = similarities.argsort()[-50:][::-1]

    candidates = []
    seen = set()

    for idx in top_indices:
        row = df.iloc[idx]
        base_score = similarities[idx]

        key = row["title"] + str(row.get("company_name", ""))
        if key in seen:
            continue

        job_text = (
            str(row["title"]) + " " +
            str(row.get("description", ""))
        ).lower()

        matched, missing = get_skill_match(user_input_clean, job_text)

        # ❌ Skip totally irrelevant
        if len(matched) == 0:
            continue

        # 🔥 Hybrid scoring
        boost = len(matched) * 0.1
        final_score = base_score + boost

        # ❌ Filter weak
        if final_score < 0.7:
            continue

        candidates.append({
            "title": row["title"],
            "company": get_company(row),
            "location": get_location(row),
            "score": float(round(final_score, 3)),
            "matched_skills": matched[:5],
            "missing_skills": missing[:5],
            "learning": get_learning_resources(missing)
        })

        seen.add(key)

    # Sort results
    candidates = sorted(candidates, key=lambda x: x["score"], reverse=True)

    return jsonify({"results": candidates[:5]})

# ---------------------------------------------------
# 🎯 SKILLS API
# ---------------------------------------------------

@app.route("/skills", methods=["GET"])
def skills():
    return jsonify(list(COMMON_SKILLS))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)