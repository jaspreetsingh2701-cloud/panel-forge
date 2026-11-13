import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';

type ErrorWithMetadata = Error & {
  code?: unknown;
  clientVersion?: unknown;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request & { requestId?: string }>();
    const requestId = request.requestId ?? randomUUID();

    response.setHeader('X-Request-Id', requestId);

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred.';
    let details: string[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const responseMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : typeof exceptionResponse === 'object' &&
              exceptionResponse !== null &&
              'message' in exceptionResponse
            ? exceptionResponse.message
            : undefined;

      // ValidationPipe returns an array of field-level validation messages.
      if (
        statusCode === HttpStatus.BAD_REQUEST &&
        Array.isArray(responseMessage)
      ) {
        errorCode = 'VALIDATION_FAILED';
        message = 'The request could not be validated.';
        details = responseMessage.filter(
          (item): item is string => typeof item === 'string',
        );
      } else {
        // Keep stable error codes, but preserve safe, intentional 4xx messages
        // from domain exceptions (e.g. "Application name already exists").
        switch (statusCode) {
          case HttpStatus.BAD_REQUEST:
            errorCode = 'BAD_REQUEST';
            message =
              typeof responseMessage === 'string'
                ? responseMessage
                : 'The request is invalid.';
            break;
          case HttpStatus.UNAUTHORIZED:
            errorCode = 'UNAUTHORIZED';
            message =
              typeof responseMessage === 'string'
                ? responseMessage
                : 'Authentication is required.';
            break;
          case HttpStatus.FORBIDDEN:
            errorCode = 'FORBIDDEN';
            message =
              typeof responseMessage === 'string'
                ? responseMessage
                : 'You do not have permission to perform this action.';
            break;
          case HttpStatus.NOT_FOUND:
            errorCode = 'RESOURCE_NOT_FOUND';
            message =
              typeof responseMessage === 'string'
                ? responseMessage
                : 'The requested resource was not found.';
            break;
          case HttpStatus.CONFLICT:
            errorCode = 'CONFLICT';
            message =
              typeof responseMessage === 'string'
                ? responseMessage
                : 'The request conflicts with the current state.';
            break;
          case HttpStatus.TOO_MANY_REQUESTS:
            errorCode = 'TOO_MANY_REQUESTS';
            message =
              typeof responseMessage === 'string'
                ? responseMessage
                : 'Too many requests. Please try again later.';
            break;
          default:
            if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
              errorCode = 'INTERNAL_SERVER_ERROR';
              message = 'An unexpected error occurred.';
            } else {
              errorCode = 'HTTP_ERROR';
              message =
                typeof responseMessage === 'string'
                  ? responseMessage
                  : 'The request could not be completed.';
            }
        }
      }
    }

    // Full diagnostics stay in server logs, never in the HTTP response.
    // Use the path without query parameters to avoid logging tokens or secrets.
    if (
      !(exception instanceof HttpException) ||
      statusCode >= HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      const error =
        exception instanceof Error
          ? (exception as ErrorWithMetadata)
          : undefined;
      const errorLog = {
        timestamp: new Date().toISOString(),
        level: 'error',
        event: 'http.request_failed',
        requestId,
        method: request.method,
        path: request.path,
        statusCode,
        error: {
          name: error?.name ?? 'UnknownError',
          message: error?.message ?? String(exception),
          stacktrace: error?.stack ?? String(exception),
          ...(typeof error?.code === 'string' ? { code: error.code } : {}),
          ...(typeof error?.clientVersion === 'string'
            ? { clientVersion: error.clientVersion }
            : {}),
        },
      };

      this.logger.error(JSON.stringify(errorLog));
    }

    response.status(statusCode).json({
      error: {
        code: errorCode,
        message,
        details,
        requestId,
      },
    });
  }
}
