import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';
import { ClaimStatus } from './schemas/claim.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/schemas/user.schema';

@ApiTags('Claims')
@Controller('claims')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  /**
   * P-1: Submit a new claim (Patient Portal)
   */
  @Post()
  @Roles(Role.PATIENT)
  @ApiOperation({
    summary: 'Submit a new medical claim',
    description: 'Allows a patient to submit a new claim with requested amount and details.',
  })
  @ApiResponse({
    status: 201,
    description: 'The claim has been successfully submitted.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error on input fields.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Patients only.' })
  async create(@Body() createClaimDto: CreateClaimDto) {
    return await this.claimsService.create(createClaimDto);
  }

  /**
   * P-1 Step 2: Upload documents for a claim
   */
  @Post(':id/upload-documents')
  @Roles(Role.PATIENT)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload supporting documents for a claim',
    description: 'Uploads PDFs and images to Cloudinary and attaches their URLs to the specified claim.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the claim',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents uploaded and attached successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - No files provided.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Patients only.' })
  @ApiResponse({ status: 404, description: 'Claim not found.' })
  async uploadDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.claimsService.uploadClaimDocuments(id, files);
  }

  /**
   * I-1 & P-2: Get claims (Filtered by status for Insurer, or fetch all)
   */
  @Get()
  @Roles(Role.INSURER)
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
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insurers only.' })
  async findAll(@Query('status') status?: ClaimStatus) {
    return await this.claimsService.findAll(status);
  }

  /**
   * P-2: View claims by patient email (Patient Portal Dashboard)
   */
  @Get('patient')
  @Roles(Role.PATIENT, Role.INSURER)
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
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findByEmail(@Query('email') email: string) {
    return await this.claimsService.findByEmail(email);
  }

  /**
   * Get a single claim detail by ID
   */
  @Get(':id')
  @Roles(Role.PATIENT, Role.INSURER)
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
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
  @Roles(Role.INSURER)
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
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insurers only.' })
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