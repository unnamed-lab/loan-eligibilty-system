# Rust 1.90: some transitive deps (e.g. idna_adapter) require edition 2024,
# which Cargo only supports from 1.85 onward.
FROM rust:1.90 AS builder
WORKDIR /app
# Cargo.lock is committed and copied so the build uses the pinned, known-good
# dependency set (ort 2.0.0-rc.9 + ort-sys rc.9 + ureq 2.x). Without it, Cargo
# would re-resolve to ort-sys rc.12 whose download build script is broken.
COPY Cargo.toml Cargo.lock ./
COPY src ./src
# Cache mounts for the crate registry and target dir make retries fast and
# resumable on flaky networks. The binary is copied out of the cached target
# dir (cache mounts are not part of the image layer).
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo build --release --locked \
    && cp /app/target/release/inference-engine /usr/local/bin/inference-engine

FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates wget && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/bin/inference-engine /usr/local/bin/
COPY models ./models
ENV MODEL_PATH=/app/models/model.onnx PORT=8081
EXPOSE 8081
CMD ["inference-engine"]
