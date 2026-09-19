import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateClaimDto {
  @ApiProperty({
    description: 'Full name of the patient submitting the claim',
    example: 'John Doe',
  })
  @IsString({ message: 'Patient name must be a string' })
  @IsNotEmpty({ message: 'Patient name is required' })
  name!: string;

  @ApiProperty({
    description: 'Email address of the patient for claim updates',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email!: string;

  @ApiProperty({
    description: 'Total amount requested for the claim in local currency',
    example: 1500,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Claim amount must be a number' })
  @Min(0, { message: 'Claim amount cannot be negative' })
  claimAmount!: number;

  @ApiProperty({
    description: 'Detailed explanation of the claim request or treatment',
    example: 'Consultation fee and prescribed medication receipt',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @ApiProperty({
    description: 'URL or path reference to the uploaded receipt or prescription document',
    example: 'http://localhost:3000/uploads/receipt-12345.pdf',
  })
  @IsString({ message: 'Document URL must be a string' })
  @IsNotEmpty({ message: 'Supporting document URL/path is required' })
  documentUrl!: string;
}