//! ONNX model loading and inference.
//!
//! The model is the deployed XGBoost classifier exported from the Python
//! pipeline (`ml/artifacts/model.onnx`). It expects a single float32 tensor of
//! shape `[batch, 11]` whose columns follow the shared feature contract order:
//! Gender, Married, Dependents, Education, Self_Employed, ApplicantIncome,
//! CoapplicantIncome, LoanAmount, Loan_Amount_Term, Credit_History, Property_Area.
//!
//! Outputs: `label` (int64 [batch]) and `probabilities` (float [batch, 2]).

use anyhow::{anyhow, Result};
use ndarray::Array2;
use ort::session::Session;
use ort::value::Value;
use std::path::Path;

pub const N_FEATURES: usize = 11;

pub struct Model {
    session: Session,
}

#[derive(Debug, Clone)]
pub struct Prediction {
    pub eligible: bool,
    pub probability: f32, // P(eligible)
}

impl Model {
    /// Load the ONNX model once at startup.
    pub fn load(path: impl AsRef<Path>) -> Result<Self> {
        let session = Session::builder()?
            .with_optimization_level(ort::session::builder::GraphOptimizationLevel::Level3)?
            .commit_from_file(path)?;
        Ok(Self { session })
    }

    /// Run inference on one applicant's 11-feature vector.
    pub fn predict(&mut self, features: &[f32]) -> Result<Prediction> {
        if features.len() != N_FEATURES {
            return Err(anyhow!(
                "expected {} features, got {}",
                N_FEATURES,
                features.len()
            ));
        }
        let input: Array2<f32> = Array2::from_shape_vec((1, N_FEATURES), features.to_vec())?;
        let input_name = self.session.inputs[0].name.clone();
        let value = Value::from_array(input)?;
        let outputs = self.session.run(ort::inputs![input_name => value]?)?;

        // probabilities: ndarray view of shape [1, 2] -> element [0, 1] is P(eligible)
        let probs = outputs["probabilities"].try_extract_tensor::<f32>()?;
        let p_eligible = *probs
            .iter()
            .nth(1)
            .ok_or_else(|| anyhow!("probabilities output missing class 1"))?;

        Ok(Prediction {
            eligible: p_eligible >= 0.5,
            probability: p_eligible,
        })
    }
}
