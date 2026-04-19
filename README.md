# NLP / Flask Project

## Overview

* This project is built using Flask and NLP techniques
* Supports real-time features using Socket.IO
* Deployed using Gunicorn on Render

---

## Live Preview

* Open the deployed app:

  * https://job-recommender-socu.onrender.com

---

## Requirements

* Python 3.10+
* pip
* Git
* Render account (for deployment)

---

## Required Libraries

Install all dependencies:

```bash
pip install -r requirements.txt
```

Or manually:

```bash
pip install flask flask-socketio gunicorn eventlet
```

---

## Project Structure

```
nlp/
│
├── app.py
├── requirements.txt
├── Procfile
└── README.md
```

---

## Running Locally

```bash
python app.py
```

---

## Running with Gunicorn

```bash
gunicorn -k eventlet -w 1 app:app
```

---

## Deployment (Render)

* Connect GitHub repo to Render
* Build command:

  * `pip install -r requirements.txt`
* Start command:

  * `gunicorn -k eventlet -w 1 app:app`

---

## Important Notes

* Use eventlet for Socket.IO support
* Do not use Flask development server in production
* Ensure Procfile is present

---

## Features

* Real-time communication
* NLP processing
* Scalable deployment

---


