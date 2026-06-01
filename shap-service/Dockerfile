FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
# --retries/--timeout add resilience on flaky networks.
RUN pip install --no-cache-dir --retries 10 --timeout 120 -r requirements.txt
COPY app.py .
COPY artifacts ./artifacts
# The feature contract is mounted at /shared at runtime (see docker-compose);
# FEATURE_CONTRACT_PATH points app.py at it.
ENV FEATURE_CONTRACT_PATH=/shared/feature-contract.json
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
