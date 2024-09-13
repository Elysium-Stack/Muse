import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	private readonly _logger = new Logger('HTTP');

	use(request: Request, response: Response, next: NextFunction): void {
		const { ip, method, originalUrl } = request;
		const userAgent = request.get('user-agent') || '';

		response.on('finish', () => {
			const { statusCode } = response;
			const contentLength = response.get('content-length');

			this._logger.debug(
				`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
			);
		});

		next();
	}
}
