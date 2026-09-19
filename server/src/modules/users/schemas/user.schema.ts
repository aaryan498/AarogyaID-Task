import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum Role {
  PATIENT = 'PATIENT',
  INSURER = 'INSURER',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: String, enum: Role, default: Role.PATIENT })
  role!: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);