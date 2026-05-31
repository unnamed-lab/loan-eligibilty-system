import { IsIn, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Raw applicant payload. Validated, then encoded via the feature contract. */
export class CreatePredictionDto {
  @ApiProperty({ enum: ['Male', 'Female'], example: 'Male' })
  @IsIn(['Male', 'Female'])
  Gender: string;

  @ApiProperty({ enum: ['Yes', 'No'], example: 'Yes' })
  @IsIn(['Yes', 'No'])
  Married: string;

  @ApiProperty({ enum: ['0', '1', '2', '3+'], example: '0' })
  @IsIn(['0', '1', '2', '3+'])
  Dependents: string;

  @ApiProperty({ enum: ['Graduate', 'Not Graduate'], example: 'Graduate' })
  @IsIn(['Graduate', 'Not Graduate'])
  Education: string;

  @ApiProperty({ enum: ['Yes', 'No'], example: 'Yes' })
  @IsIn(['Yes', 'No'])
  Self_Employed: string;

  @ApiProperty({ example: 3000 })
  @IsNumber() @Min(0) @Max(1000000)
  ApplicantIncome: number;

  @ApiProperty({ example: 0 })
  @IsNumber() @Min(0) @Max(1000000)
  CoapplicantIncome: number;

  @ApiProperty({ example: 66, description: 'In thousands' })
  @IsNumber() @Min(0) @Max(10000)
  LoanAmount: number;

  @ApiProperty({ example: 360, description: 'Term in months' })
  @IsNumber() @Min(0) @Max(600)
  Loan_Amount_Term: number;

  @ApiProperty({ enum: [0, 1], example: 1, description: '1 = good credit history' })
  @IsIn([0, 1])
  Credit_History: number;

  @ApiProperty({ enum: ['Rural', 'Semiurban', 'Urban'], example: 'Urban' })
  @IsIn(['Rural', 'Semiurban', 'Urban'])
  Property_Area: string;
}
