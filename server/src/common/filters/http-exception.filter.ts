import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/custom-error-codes';
import { ApiError } from '../interfaces/api-error.interface';

@Catch()
export class HttpExceptionFilter
    implements ExceptionFilter {
    private readonly logger =
        new Logger(HttpExceptionFilter.name);

    catch(
        exception: unknown,
        host: ArgumentsHost,
    ): void {
        const ctx =
            host.switchToHttp();

        const request =
            ctx.getRequest<Request>();

        const response =
            ctx.getResponse<Response>();

        let errorResponse: ApiError;

        if (exception instanceof AppError) {
            errorResponse = {
                success: false,
                statusCode:
                    exception.statusCode,
                errorCode:
                    exception.errorCode,
                message:
                    exception.message,
                timestamp:
                    new Date().toISOString(),
                path: request.url,
                details:
                    exception.details,
            };
        }

        else if (exception instanceof HttpException) {
            const statusCode = exception.getStatus();

            const exceptionResponse =
                exception.getResponse();

            let message = exception.message;

            if (
                typeof exceptionResponse ===
                'object' &&
                exceptionResponse &&
                'message' in
                exceptionResponse
            ) {
                const responseMessage =
                    exceptionResponse.message;

                message = Array.isArray(
                    responseMessage,
                )
                    ? responseMessage.join(', ')
                    : String(responseMessage);
            }

            let errorCode: ErrorCode;

            switch (statusCode) {
                case HttpStatus.BAD_REQUEST:
                    errorCode =
                        ErrorCode.VALIDATION_ERROR;
                    break;

                case HttpStatus.UNAUTHORIZED:
                    errorCode =
                        ErrorCode.AUTH_REQUIRED;
                    break;

                case HttpStatus.FORBIDDEN:
                    errorCode =
                        ErrorCode.FORBIDDEN;
                    break;

                case HttpStatus.NOT_FOUND:
                    errorCode =
                        ErrorCode.RECORD_NOT_FOUND;
                    break;

                case HttpStatus.CONFLICT:
                    errorCode =
                        ErrorCode.DATABASE_ERROR;
                    break;

                default:
                    errorCode =
                        ErrorCode.INTERNAL_SERVER_ERROR;
            }

            errorResponse = {
                success: false,
                statusCode,
                errorCode,
                message,
                timestamp:
                    new Date().toISOString(),
                path: request.url,
            };
        }

        else {
            errorResponse = {
                success: false,
                statusCode:
                    HttpStatus.INTERNAL_SERVER_ERROR,
                errorCode:
                    ErrorCode.INTERNAL_SERVER_ERROR,
                message:
                    'Internal server error',
                timestamp:
                    new Date().toISOString(),
                path: request.url,
            };
        }

        this.logger.error(
            `${request.method} ${request.url}`,
            exception instanceof Error
                ? exception.stack
                : undefined,
        );

        response.status(errorResponse.statusCode).json(errorResponse);
    }
}