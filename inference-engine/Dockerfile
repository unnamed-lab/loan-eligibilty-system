FROM rust:1.82 AS builder
WORKDIR /app
# Cargo.lock is committed and copied so the build uses the pinned, known-good
# dependency set (ort 2.0.0-rc.9 + ort-sys rc.9 + ureq 2.x). Without it, Cargo
# would re-resolve to ort-sys rc.12 whose download build script is broken.
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release --locked

FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates wget && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/inference-engine /usr/local/bin/
COPY models ./models
ENV MODEL_PATH=/app/models/model.onnx PORT=8081
EXPOSE 8081
CMD ["inference-engine"]
