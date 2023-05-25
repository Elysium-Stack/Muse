import { SharedModule } from '@muse/shared.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DiscordSharedModule } from '../discord';
import { AuthService } from './services/auth.service';

@Module({
	imports: [SharedModule, JwtModule, DiscordSharedModule],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthSharedModule {}
