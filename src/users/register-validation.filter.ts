import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
 
@Catch(BadRequestException)
export class RegisterValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
 
    const exceptionResponse = exception.getResponse() as
      | { message?: string | string[] }
      | string;
 
    const rawMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse.message;
 
    const message = Array.isArray(rawMessage)
      ? rawMessage.join('、')
      : rawMessage || 'ユーザー登録に失敗しました。';
 
    response.status(400).render('register', {
      error: message,
      values: {
        email: request.body?.email || '',
        username: request.body?.username || '',
      },
    });
  }
}
 