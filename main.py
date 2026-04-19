import pandas as pd
import joblib
from sentence_transformers import SentenceTransformer
from utils import clean_text

print("Loading dataset...")

df = pd.read_csv("data/linkedin_jobs.csv")
df.columns = df.columns.str.lower().str.strip()

df = df.dropna(subset=["title", "description"])

# 🔹 Clean text
df["cleaned_text"] = (
    df["title"] + " " + df["description"]
).apply(clean_text)

print("Loading model...")

model = SentenceTransformer('all-MiniLM-L6-v2')

print("Generating embeddings (this may take time)...")

embeddings = model.encode(
    df["cleaned_text"].tolist(),
    show_progress_bar=True,
    batch_size=64
)

# 🔥 Save everything
joblib.dump(df, "models/jobs_df.pkl")
joblib.dump(embeddings, "models/job_embeddings.pkl")

print("✅ Embeddings saved!")