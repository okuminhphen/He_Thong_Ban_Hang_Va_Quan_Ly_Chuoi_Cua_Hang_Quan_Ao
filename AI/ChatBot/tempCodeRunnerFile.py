import pandas as pd
import re
import unicodedata
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

# Tiền xử lý
def remove_accents(text):
    return "".join(c for c in unicodedata.normalize("NFD", text)
                   if unicodedata.category(c) != "Mn")

def preprocess(text):
    text = text.lower()
    text = remove_accents(text)
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    return text

# Load dataset
df = pd.read_csv("dataset.csv")
df["clean_question"] = df["question"].apply(preprocess)

# Encode label
label_encoder = LabelEncoder()
df["label"] = label_encoder.fit_transform(df["answer"])

# Train/test
X_train, X_test, y_train, y_test = train_test_split(
    df["clean_question"], df["label"], test_size=0.2, random_state=42
)

# TF-IDF
vectorizer = TfidfVectorizer()
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# Train model
model = LogisticRegression()
model.fit(X_train_vec, y_train)

# Evaluate
y_pred = model.predict(X_test_vec)
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))

# Save model
joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "tfidf.pkl")
joblib.dump(label_encoder, "label_encoder.pkl")

print("Train xong!")
