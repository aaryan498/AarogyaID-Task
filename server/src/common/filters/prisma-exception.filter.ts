import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client';
import { Request, Response } from 'express';

import { ApiError } from '../interfaces/api-error.interface';
import { ErrorCode } from '../errors/custom-error-codes';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();

    const request =
      ctx.getRequest<Request>();

    const response =
      ctx.getResponse<Response>();

    let errorResponse: ApiError;

    switch (exception.code) {
      case 'P2002':
        errorResponse = {
          success: false,
          statusCode:
            HttpStatus.CONFLICT,
          errorCode:
            ErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
          message:
            'Resource already exists.',
          timestamp:
            new Date().toISOString(),
          path: request.url,
        };

        break;

      case 'P2025':
        errorResponse = {
          success: false,
          statusCode:
            HttpStatus.NOT_FOUND,
          errorCode:
            ErrorCode.RECORD_NOT_FOUND,
          message:
            'Requested resource was not found.',
          timestamp:
            new Date().toISOString(),
          path: request.url,
        };

        break;

      default:
        errorResponse = {
          success: false,
          statusCode:
            HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode:
            ErrorCode.DATABASE_ERROR,
          message:
            'Database operation failed.',
          timestamp:
            new Date().toISOString(),
          path: request.url,
        };
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}