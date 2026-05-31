import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateApplicantDto {
  @ApiProperty({ example: 'Amaka Okafor' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Last submitted application snapshot' })
  @IsOptional()
  @IsObject()
  profile?: Record<string, any>;
}

export class UpdateApplicantDto extends PartialType(CreateApplicantDto) {}
