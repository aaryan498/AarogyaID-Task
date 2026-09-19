import { ErrorCode } from './custom-error-codes';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode: ErrorCode,
    public readonly details?: unknown,
  ) {
    super(message);

    this.name = this.constructor.name;

    Error.captureStackTrace(
      this,
      this.constructor,
    );
  }
}