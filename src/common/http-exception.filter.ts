import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';

import * as path from 'path';
import * as fs from 'fs';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';

    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };

        message = responseObj.message ?? message;
        error = responseObj.error ?? error;
      }
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp,
      path: request.url,
      method: request.method,
      error,
      message,
    };

    response.status(status).json(errorResponse);

    this.saveLog({
      status,
      timestamp,
      request,
      message,
      exception,
    });
  }

  private saveLog({
    status,
    timestamp,
    request,
    message,
    exception,
  }: {
    status: number;
    timestamp: string;
    request: Request;
    message: string | string[];
    exception: unknown;
  }): void {
    const logLevel = this.getLogLevel(status);

    const logDir = path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, `${logLevel}.log`);

    let logMessage = `
    [${logLevel.toUpperCase()}]
    Timestamp: ${timestamp}
    Method: ${request.method}
    Path: ${request.url}
    StatusCode: ${status}
    Message: ${JSON.stringify(message)}
    `;

    if (status >= 500 && exception instanceof Error && exception.stack) {
      logMessage += `Stack: ${exception.stack}\n`;
    }

    logMessage += '\n--------------------------------------------------\n';

    fs.appendFileSync(logFile, logMessage);
  }

  private getLogLevel(status: number): string {
    if (status >= 500) return 'error';

    if (status >= 400) return 'warn';

    return 'info';
  }
}
