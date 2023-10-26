import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModuleAsyncOptions} from '@nestjs/typeorm';
import {WalletsKeyValuePairs} from "@app/database/entities/wallets-key-value-pairs";

export const DatabaseConfig: TypeOrmModuleAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: async (configService: ConfigService) => ({
		type: 'mysql',
		url: configService.get('DATABASE_URL'),
		entities: DatabaseFeatures,
		synchronize: true,
		logging: false,
	}),
};

export const DatabaseFeatures = [
	WalletsKeyValuePairs,
];
