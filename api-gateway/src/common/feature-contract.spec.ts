import { FEATURE_ORDER, encodeApplicant } from './feature-contract';

describe('feature-contract', () => {
  it('exposes the 11 features in locked order', () => {
    expect(FEATURE_ORDER).toEqual([
      'Gender', 'Married', 'Dependents', 'Education', 'Self_Employed',
      'ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term',
      'Credit_History', 'Property_Area',
    ]);
  });

  it('encodes the canonical sample applicant to the notebook vector', () => {
    const vector = encodeApplicant({
      Gender: 'Male', Married: 'Yes', Dependents: '0', Education: 'Graduate',
      Self_Employed: 'Yes', ApplicantIncome: 3000, CoapplicantIncome: 0,
      LoanAmount: 66, Loan_Amount_Term: 360, Credit_History: 1, Property_Area: 'Urban',
    });
    expect(vector).toEqual([1, 1, 0, 0, 1, 3000, 0, 66, 360, 1, 2]);
  });

  it("maps Dependents '3+' to 4", () => {
    const vector = encodeApplicant({
      Gender: 'Female', Married: 'No', Dependents: '3+', Education: 'Not Graduate',
      Self_Employed: 'No', ApplicantIncome: 1000, CoapplicantIncome: 0,
      LoanAmount: 100, Loan_Amount_Term: 360, Credit_History: 0, Property_Area: 'Rural',
    });
    expect(vector[2]).toBe(4);
  });

  it('throws on an unencodable value', () => {
    expect(() =>
      encodeApplicant({ Gender: 'Martian' } as any),
    ).toThrow(/Cannot encode/);
  });
});
