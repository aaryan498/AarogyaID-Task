import { ErrorCode } from 'src/common/errors/custom-error-codes';

export interface ApiError {
  success: false;
  statusCode: number;
  errorCode: ErrorCode;
  message: string;
  timestamp: string;
  path: string;
  details?: unknown;
}