import os
import pandas as pd
import numpy as np
from pathlib import Path

# Paths relative to this script
SRC_DIR = Path(__file__).resolve().parent
DATA_PATH = SRC_DIR.parent / "data" / "dataset.csv"

def main():
    print(f"Reading original dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH, index_col=0)
    print(f"Original dataset shape: {df.shape}")

    n_new = 2000
    print(f"Generating {n_new} synthetic records via empirical resampling...")
    
    # Set seed for reproducibility
    np.random.seed(42)
    
    # Resample rows with replacement
    resampled_df = df.sample(n=n_new, replace=True).reset_index(drop=True)
    
    # Generate new index and unique Loan_ID
    resampled_df.index = range(len(df), len(df) + n_new)
    resampled_df['Loan_ID'] = [f"LP00{i}" for i in range(6000, 6000 + n_new)]
    
    # Continuous features definitions from shared/feature-contract.json
    continuous_cols = {
        "ApplicantIncome": {"min": 0, "max": 100000, "is_int": True, "scale": 0.05},
        "CoapplicantIncome": {"min": 0, "max": 100000, "is_int": False, "scale": 0.05},
        "LoanAmount": {"min": 0, "max": 1000, "is_int": False, "scale": 0.05},
        "Loan_Amount_Term": {"min": 0, "max": 600, "is_int": False, "scale": 0.0} # keep discrete
    }
    
    for col, config in continuous_cols.items():
        if col not in resampled_df.columns:
            continue
            
        mask = resampled_df[col].notna()
        values = resampled_df.loc[mask, col].astype(float)
        
        # Add small Gaussian noise to continuous variables
        if config["scale"] > 0:
            noise = np.random.normal(0, config["scale"] * values)
            new_values = values + noise
        else:
            new_values = values
            
        # Clip to defined bounds
        new_values = np.clip(new_values, config["min"], config["max"])
        
        if config["is_int"]:
            resampled_df.loc[mask, col] = np.round(new_values).astype(int)
        else:
            resampled_df.loc[mask, col] = np.round(new_values, 1)

    # Concatenate and save back to dataset.csv
    combined_df = pd.concat([df, resampled_df])
    combined_df.to_csv(DATA_PATH, index=True)
    
    print(f"Successfully appended {n_new} rows.")
    print(f"New dataset saved. Total shape: {combined_df.shape}")

if __name__ == "__main__":
    main()
