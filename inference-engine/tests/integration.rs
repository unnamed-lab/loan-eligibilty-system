//! Integration test: the engine must load the real ONNX model and produce a
//! sane prediction for the canonical sample applicant used throughout the
//! project (the notebook's `input_data`).
//!
//! Run with: `cargo test --release`
//! (Requires `models/model.onnx`, shipped in the repo.)

use std::path::Path;

// Pull in the model module directly from src/.
#[path = "../src/model.rs"]
mod model;

use model::{Model, N_FEATURES};

const SAMPLE: [f32; N_FEATURES] = [1.0, 1.0, 0.0, 0.0, 1.0, 3000.0, 0.0, 66.0, 360.0, 1.0, 2.0];

#[test]
fn loads_model_and_predicts_sample() {
    let path = Path::new("models/model.onnx");
    assert!(path.exists(), "models/model.onnx must be present");

    let mut m = Model::load(path).expect("model should load");
    let p = m.predict(&SAMPLE).expect("prediction should succeed");

    // Probability is a valid [0,1] value and `eligible` agrees with the 0.5 cut.
    assert!(p.probability >= 0.0 && p.probability <= 1.0);
    assert_eq!(p.eligible, p.probability >= 0.5);
}

#[test]
fn rejects_wrong_feature_count() {
    let mut m = Model::load("models/model.onnx").expect("model should load");
    let too_few = vec![1.0_f32; N_FEATURES - 1];
    assert!(m.predict(&too_few).is_err());
}
