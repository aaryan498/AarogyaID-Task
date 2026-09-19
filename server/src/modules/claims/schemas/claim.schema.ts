import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClaimDocument = Claim & Document;

export enum ClaimStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

@Schema({ timestamps: true })
export class Claim {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  claimAmount!: number;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  documentUrl!: string;

  @Prop({ type: String, enum: ClaimStatus, default: ClaimStatus.PENDING })
  status!: ClaimStatus;

  @Prop({ default: Date.now })
  submissionDate!: Date;

  @Prop({ required: false, default: 0 })
  approvedAmount!: number;

  @Prop({ required: false })
  insurerComments!: string;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);