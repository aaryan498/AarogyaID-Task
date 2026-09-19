import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Claim, ClaimDocument, ClaimStatus } from './schemas/claim.schema';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectModel(Claim.name)
    private readonly claimModel: Model<ClaimDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Submit a new claim (Patient Portal)
   */
  async create(createClaimDto: CreateClaimDto): Promise<ClaimDocument> {
    const newClaim = new this.claimModel({
      ...createClaimDto,
      status: ClaimStatus.PENDING,
      submissionDate: new Date(),
      approvedAmount: 0,
      documentUrl: [],
    });
    return await newClaim.save();
  }

  /**
   * Upload multiple document files for a specific claim (Patient Portal - Step 2)
   */
  async uploadClaimDocuments(
    claimId: string,
    files: Express.Multer.File[],
  ): Promise<ClaimDocument> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one document file must be uploaded');
    }

    const claim = await this.findOne(claimId);
    const uploadedUrls = await this.cloudinaryService.uploadMultipleFiles(files);

    claim.documentUrl = [...claim.documentUrl, ...uploadedUrls];
    return await claim.save();
  }

  /**
   * Get all claims with optional status filter (Insurer / Patient Portal)
   */
  async findAll(status?: ClaimStatus): Promise<ClaimDocument[]> {
    const filter = status ? { status } : {};
    return await this.claimModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get claims submitted by a specific email (Patient Portal)
   */
  async findByEmail(email: string): Promise<ClaimDocument[]> {
    return await this.claimModel
      .find({ email })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get a single claim document by ID
   */
  async findOne(id: string): Promise<ClaimDocument> {
    const claim = await this.claimModel.findById(id).exec();
    if (!claim) {
      throw new NotFoundException(`Claim with ID "${id}" not found`);
    }
    return claim;
  }

  /**
   * Update claim status, approved amount, and comments (Insurer Portal)
   */
  async updateStatus(
    id: string,
    updateClaimStatusDto: UpdateClaimStatusDto,
  ): Promise<ClaimDocument> {
    const { status, approvedAmount, insurerComments } = updateClaimStatusDto;

    const claim = await this.findOne(id);

    if (status === ClaimStatus.APPROVED) {
      const finalAmount = approvedAmount ?? claim.claimAmount;
      if (finalAmount > claim.claimAmount) {
        throw new BadRequestException(
          'Approved amount cannot exceed the requested claim amount',
        );
      }
      claim.approvedAmount = finalAmount;
    } else if (status === ClaimStatus.REJECTED) {
      claim.approvedAmount = 0;
    }

    claim.status = status;

    if (insurerComments !== undefined) {
      claim.insurerComments = insurerComments;
    }

    return await claim.save();
  }
}