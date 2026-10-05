# The build context is the REPO ROOT (see docker-compose.yml and render.yaml),
# because the image bakes in shared/feature-contract.json from ../shared.
# Every COPY below is therefore prefixed with shap-service/.
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*
COPY shap-service/requirements.txt .
# Cache mount + retries/timeout: resilient, resumable installs on flaky networks.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --retries 10 --timeout 120 -r requirements.txt \
    && ln -sf /usr/local/bin/uvicorn /usr/bin/uvicorn

ENV PATH="/usr/local/bin:${PATH}"
COPY shap-service/app.py .
COPY shap-service/artifacts ./artifacts
# app.py reads this at import time, so a wrong path crashes the process at boot.
COPY shared/feature-contract.json /shared/feature-contract.json
ENV FEATURE_CONTRACT_PATH=/shared/feature-contract.json
EXPOSE 10000
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]

