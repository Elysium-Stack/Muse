import { Request } from '@nestjs/common';
import { ParsedTokenResponseDTO } from './responses.type';

export interface AuthenticatedRequestDTO extends Request {
	user: ParsedTokenResponseDTO;
}
