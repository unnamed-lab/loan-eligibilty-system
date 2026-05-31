//! HTTP inference service (axum).
//!
//!   POST /predict  { "features": [f32; 11] }  -> { eligible, probability, latency_ms }
//!   GET  /health                              -> { status: "ok" }
//!
//! The model is loaded once and shared behind a Mutex (inference is cheap; a
//! Mutex is sufficient at this scale — swap for a pool if you need parallelism).

mod model;

use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
use model::{Model, N_FEATURES};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;

#[derive(Clone)]
struct AppState {
    model: Arc<Mutex<Model>>,
}

#[derive(Deserialize)]
struct PredictRequest {
    features: Vec<f32>,
}

#[derive(Serialize)]
struct PredictResponse {
    eligible: bool,
    probability: f32,
    latency_ms: f32,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let model_path = std::env::var("MODEL_PATH").unwrap_or_else(|_| "models/model.onnx".into());
    let model = Model::load(&model_path)?;
    tracing::info!("Loaded model from {model_path}");

    let state = AppState {
        model: Arc::new(Mutex::new(model)),
    };

    let app = Router::new()
        .route("/health", get(health))
        .route("/predict", post(predict))
        .with_state(state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "8081".into());
    let addr = format!("0.0.0.0:{port}");
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    tracing::info!("Inference engine listening on {addr}");
    axum::serve(listener, app).await?;
    Ok(())
}

async fn health() -> impl IntoResponse {
    Json(serde_json::json!({ "status": "ok" }))
}

async fn predict(
    State(state): State<AppState>,
    Json(req): Json<PredictRequest>,
) -> impl IntoResponse {
    if req.features.len() != N_FEATURES {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!(ErrorResponse {
                error: format!("expected {N_FEATURES} features, got {}", req.features.len())
            })),
        )
            .into_response();
    }

    let start = Instant::now();
    let result = {
        let mut model = state.model.lock().unwrap();
        model.predict(&req.features)
    };
    let latency_ms = start.elapsed().as_secs_f32() * 1000.0;

    match result {
        Ok(p) => Json(PredictResponse {
            eligible: p.eligible,
            probability: p.probability,
            latency_ms,
        })
        .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!(ErrorResponse { error: e.to_string() })),
        )
            .into_response(),
    }
}
