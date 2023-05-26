import { Request } from '@nestjs/common';
import { ParsedTokenResponse } from './responses.type';

export interface AuthenticatedRequest extends Request {
	user: ParsedTokenResponse;
}
