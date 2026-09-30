# Fixby Galaxy Engine — Core AI Engine & Unified Web Console
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose standard API ports (8000 standard, 7860 for Hugging Face Spaces)
ENV PORT=8000
EXPOSE 8000 7860

# Dynamic entrypoint respecting cloud $PORT environment variable
CMD ["sh", "-c", "uvicorn src.backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
