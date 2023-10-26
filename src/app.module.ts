import {Logger, Module, OnApplicationBootstrap, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {AppService} from './services/app.service';
import {ConfigModule} from "@nestjs/config";
import {HttpModule} from "@nestjs/axios";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DatabaseConfig, DatabaseFeatures} from "@app/database/providers";
import {TransactionService} from "@app/services/transaction.service";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		HttpModule,
		TypeOrmModule.forRootAsync(DatabaseConfig),
		TypeOrmModule.forFeature(DatabaseFeatures),
	],
	controllers: [],
	providers: [
		AppService,
		TransactionService,
	]
})
export class AppModule implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy {
	private readonly _logger: Logger = new Logger(AppModule.name);

	constructor(private readonly _appService: AppService) {
	}

	async onApplicationBootstrap() {
		this._logger.log("Application bootstrapped");
		await this._appService.run();
	}

	onModuleDestroy(): any {
	}

	onModuleInit(): any {
	}

}
