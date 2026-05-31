import { readFileSync } from 'fs';
import { join } from 'path';

/** Loads shared/feature-contract.json — the SAME file Python and Rust use. */
const contractPath =
  process.env.FEATURE_CONTRACT_PATH ||
  join(__dirname, '..', '..', '..', 'shared', 'feature-contract.json');

export interface FeatureDef {
  name: string;
  index: number;
  type: string;
  encoding?: Record<string, number>;
}

const contract = JSON.parse(readFileSync(contractPath, 'utf-8'));
export const FEATURES: FeatureDef[] = [...contract.features].sort(
  (a, b) => a.index - b.index,
);
export const FEATURE_ORDER = FEATURES.map((f) => f.name);

/** Encode a raw applicant object into the ordered float vector the model expects. */
export function encodeApplicant(raw: Record<string, any>): number[] {
  return FEATURES.map((f) => {
    const v = raw[f.name];
    if (f.name === 'Dependents' && v === '3+') return 4;
    if (f.encoding && typeof v === 'string' && v in f.encoding) {
      return f.encoding[v];
    }
    const n = Number(v);
    if (Number.isNaN(n)) {
      throw new Error(`Cannot encode feature '${f.name}' value '${v}'`);
    }
    return n;
  });
}
