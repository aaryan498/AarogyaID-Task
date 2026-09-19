import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';
import { ClaimStatus } from './schemas/claim.schema';

@ApiTags('Claims')
@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  /**
   * P-1: Submit a new claim (Patient Portal)
   */
  @Post()
  @ApiOperation({
    summary: 'Submit a new medical claim',
    description: 'Allows a patient to submit a new claim with requested amount and supporting document URL.',
  })
  @ApiResponse({
    status: 201,
    description: 'The claim has been successfully submitted.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error on input fields.',
  })
  async create(@Body() createClaimDto: CreateClaimDto) {
    return await this.claimsService.create(createClaimDto);
  }

  /**
   * I-1 & P-2: Get claims (Filtered by status for Insurer, or fetch all)
   */
  @Get()
  @ApiOperation({
    summary: 'Get all claims or filter by status',
    description: 'Retrieves claims. Can be filtered using status (Pending, Approved, Rejected).',
  })
  @ApiQuery({
    name: 'status',
    enum: ClaimStatus,
    required: false,
    description: 'Optional status filter (Pending, Approved, Rejected)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of claims retrieved successfully.',
  })
  async findAll(@Query('status') status?: ClaimStatus) {
    return await this.claimsService.findAll(status);
  }

  /**
   * P-2: View claims by patient email (Patient Portal Dashboard)
   */
  @Get('patient')
  @ApiOperation({
    summary: 'Get claims for a specific patient by email',
    description: 'Fetches all submitted claims associated with a specific patient email.',
  })
  @ApiQuery({
    name: 'email',
    type: String,
    required: true,
    description: 'Patient email address',
  })
  @ApiResponse({
    status: 200,
    description: 'List of claims for the patient retrieved successfully.',
  })
  async findByEmail(@Query('email') email: string) {
    return await this.claimsService.findByEmail(email);
  }

  /**
   * Get a single claim detail by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get claim details by ID',
    description: 'Retrieves complete details of a single claim record by its unique ID.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the claim',
  })
  @ApiResponse({
    status: 200,
    description: 'Claim details retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Claim not found.',
  })
  async findOne(@Param('id') id: string) {
    return await this.claimsService.findOne(id);
  }

  /**
   * I-1: Update claim status, approved amount, & comments (Insurer Portal)
   */
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update claim status (Insurer Portal)',
    description: 'Allows an insurer to approve or reject a claim, update approved amount, and leave review comments.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the claim to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Claim status updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error or approved amount exceeds claim amount.',
  })
  @ApiResponse({
    status: 404,
    description: 'Claim not found.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateClaimStatusDto: UpdateClaimStatusDto,
  ) {
    return await this.claimsService.updateStatus(id, updateClaimStatusDto);
  }
}