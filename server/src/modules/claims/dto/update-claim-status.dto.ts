import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ClaimStatus } from '../schemas/claim.schema';

export class UpdateClaimStatusDto {
  @ApiProperty({
    description: 'Updated status of the claim (Approved or Rejected)',
    enum: ClaimStatus,
    example: ClaimStatus.APPROVED,
  })
  @IsEnum(ClaimStatus, {
    message: 'Status must be one of: Pending, Approved, Rejected',
  })
  status!: ClaimStatus;

  @ApiPropertyOptional({
    description: 'Amount approved by the insurer',
    example: 1200,
    minimum: 0,
    default: 0,
  })
  @IsNumber({}, { message: 'Approved amount must be a number' })
  @Min(0, { message: 'Approved amount cannot be negative' })
  @IsOptional()
  approvedAmount?: number;

  @ApiPropertyOptional({
    description: 'Reviewer comments or reason for decision',
    example: 'Approved based on submitted medical receipts.',
  })
  @IsString({ message: 'Insurer comments must be a string' })
  @IsOptional()
  insurerComments?: string;
}