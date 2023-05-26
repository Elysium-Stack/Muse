import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_REFRESh_SECRET } from '../util/constants';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh',
) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: JWT_REFRESh_SECRET,
			passReqToCallback: true,
		});
	}

	validate(req: Request, payload: any) {
		const refreshToken =
			req.get('Authorization')?.replace('Bearer', '').trim() ?? null;
		return { ...payload, refreshToken };
	}
}
