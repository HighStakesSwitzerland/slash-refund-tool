import {Injectable, Logger} from '@nestjs/common';
import {TransactionService} from "@app/services/transaction.service";
import {InjectRepository} from "@nestjs/typeorm";
import {WalletsKeyValuePairs} from "@app/database/entities/wallets-key-value-pairs";
import {Repository} from "typeorm";

@Injectable()
export class AppService {
	private readonly _logger: Logger = new Logger(AppService.name);

	constructor(private readonly _transactionService: TransactionService,
	            @InjectRepository(WalletsKeyValuePairs) private readonly _repository: Repository<WalletsKeyValuePairs>) {
	}

	public async run(): Promise<void> {

		const walletList = await this._repository.findBy({txhash: null});
		this._logger.log(`Found ${walletList.length} wallets in database`);

		const chunkSize: number = 50;
		for (let i = 0; i < walletList.length; i += chunkSize) {
			const chunk = [] = walletList.slice(i, i + chunkSize);
			console.log(`Processing chunk ${i / chunkSize + 1}`);

			const tx = await this._transactionService.createMultiSendTx(chunk);
			chunk.forEach(e => e.txhash = tx.transactionHash);
			await this._repository.save(chunk);
		}


	}

}
