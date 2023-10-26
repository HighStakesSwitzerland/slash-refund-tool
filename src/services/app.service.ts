import {Injectable, Logger} from '@nestjs/common';
import {TransactionService} from "@app/services/transaction.service";
import {InjectRepository} from "@nestjs/typeorm";
import {WalletsKeyValuePairs} from "@app/database/entities/wallets-key-value-pairs";
import {Repository} from "typeorm";
import {isNil} from "@nestjs/common/utils/shared.utils";
import * as process from "process";

@Injectable()
export class AppService {
	private readonly _logger: Logger = new Logger(AppService.name);

	constructor(private readonly _transactionService: TransactionService,
	            @InjectRepository(WalletsKeyValuePairs) private readonly _repository: Repository<WalletsKeyValuePairs>) {
	}

	public async run(): Promise<void> {

		const walletList = await this._repository.findBy({txhash: ''});
		this._logger.log(`Found ${walletList.length} wallets in database`);

		const chunkSize: number = 40;
		for (let i = 0; i < walletList.length; i += chunkSize) {
			const chunk = [] = walletList.slice(i, i + chunkSize);
			this._logger.log(`Processing chunk ${i / chunkSize + 1}`);
			if (chunk.find(e => isNil(e.txhash))) {
				this._logger.error(`Picked already done wallets!`);
				console.log(chunk);
				process.exit();
			}

			const tx = await this._transactionService.createMultiSendTx(chunk);
			chunk.forEach(e => e.txhash = tx.transactionHash);
			await this._repository.save(chunk);
		}

		this._logger.log(`Done`);
		process.exit();
	}

}
