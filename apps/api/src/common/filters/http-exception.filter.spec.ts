import {
  ArgumentsHost,
  ConflictException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

function createHttpContext(requestId = 'request-123') {
  const payload: { body?: unknown; statusCode?: number; headers: Record<string, string> } = {
    headers: {},
  };
  const response = {
    setHeader: jest.fn((name: string, value: string) => {
      payload.headers[name] = value;
    }),
    status: jest.fn((statusCode: number) => {
      payload.statusCode = statusCode;
      return response;
    }),
    json: jest.fn((body: unknown) => {
      payload.body = body;
      return response;
    }),
  };

  const request = {
    requestId,
    method: 'GET',
    path: '/api/v1/tenants/example/applications',
    url: '/api/v1/tenants/example/applications?access_token=must-not-be-logged',
  };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;

  return { host, payload, request, response };
}

describe('HttpExceptionFilter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a safe response and logs a structured stacktrace for unexpected errors', () => {
    const logger = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const { host, payload, response } = createHttpContext();
    const exception = new Error('Database connection failed');

    exception.stack = 'Error: Database connection failed\\n    at ApplicationsService.list';

    new HttpExceptionFilter().catch(exception, host);

    expect(response.setHeader).toHaveBeenCalledWith('X-Request-Id', 'request-123');
    expect(payload.statusCode).toBe(500);
    expect(payload.body).toEqual({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
        details: [],
        requestId: 'request-123',
      },
    });

    expect(logger).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(String(logger.mock.calls[0][0])) as {
      requestId: string;
      path: string;
      error: { message: string; stacktrace: string };
    };
    expect(logged.requestId).toBe('request-123');
    expect(logged.path).toBe('/api/v1/tenants/example/applications');
    expect(logged.error.message).toBe('Database connection failed');
    expect(logged.error.stacktrace).toContain('ApplicationsService.list');
    expect(JSON.stringify(payload.body)).not.toContain('Database connection failed');
    expect(JSON.stringify(logger.mock.calls[0])).not.toContain('access_token');
  });

  it('preserves useful domain messages for expected client errors', () => {
    const logger = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const { host, payload } = createHttpContext();

    new HttpExceptionFilter().catch(
      new ConflictException('Application name already exists.'),
      host,
    );

    expect(payload.statusCode).toBe(409);
    expect(payload.body).toEqual({
      error: {
        code: 'CONFLICT',
        message: 'Application name already exists.',
        details: [],
        requestId: 'request-123',
      },
    });
    expect(logger).not.toHaveBeenCalled();
  });
});
