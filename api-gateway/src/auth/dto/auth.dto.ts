import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'officer@bank.ng' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'officer@bank.ng' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @MinLength(8)
  password: string;
}
