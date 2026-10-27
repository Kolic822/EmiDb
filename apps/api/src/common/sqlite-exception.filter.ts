import {
  type ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  type ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import Database from 'better-sqlite3';
import type { Response } from 'express';

const { SqliteError } = Database;
type SqliteError = InstanceType<typeof SqliteError>;

/** Turns SQLite constraint violations into meaningful HTTP errors. */
@Catch(SqliteError)
export class SqliteExceptionFilter implements ExceptionFilter<SqliteError> {
  private readonly logger = new Logger(SqliteExceptionFilter.name);

  catch(error: SqliteError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const http = this.toHttp(error);
    response.status(http.getStatus()).json(http.getResponse());
  }

  private toHttp(error: SqliteError): HttpException {
    switch (error.code) {
      case 'SQLITE_CONSTRAINT_UNIQUE':
        return new ConflictException('An entry with that name already exists');
      case 'SQLITE_CONSTRAINT_FOREIGNKEY':
        return new BadRequestException('A referenced entry does not exist');
      default:
        this.logger.error(error.message, error.stack);
        return new InternalServerErrorException();
    }
  }
}
