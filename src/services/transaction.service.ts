import {Injectable, Logger} from "@nestjs/common";
import {isNil} from "@nestjs/common/utils/shared.utils";
import {coins, encodeSecp256k1Pubkey, makeSignDoc, Secp256k1HdWallet, StdSignDoc} from "@cosmjs/amino";
import {ConfigService} from "@nestjs/config";
import {ChainUtils} from "@app/utils/chain-utils";
import {AminoTypes, createDefaultAminoConverters, defaultRegistryTypes, DeliverTxResponse, SigningStargateClient} from '@cosmjs/stargate'
import {Int53} from "@cosmjs/math";
import {chains} from "chain-registry";
import {Chain} from '@chain-registry/types';
import {EncodeObject, encodePubkey, makeAuthInfoBytes, Registry, TxBodyEncodeObject} from "@cosmjs/proto-signing";
import {SignMode} from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import {TxRaw} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {fromBase64} from "@cosmjs/encoding";
import {Tendermint37Client} from "@cosmjs/tendermint-rpc";
import {Any} from "cosmjs-types/google/protobuf/any";
import {WalletsKeyValuePairs} from "@app/database/entities/wallets-key-value-pairs";
import {MsgMultiSend} from "cosmjs-types/cosmos/bank/v1beta1/tx";
import {Input, Output} from "cosmjs-types/cosmos/bank/v1beta1/bank";
import {Dec, IntPretty} from '@keplr-wallet/unit';
import {StdFee} from "@cosmjs/amino/build/signdoc";

@Injectable()
export class TransactionService {
	private readonly _logger: Logger = new Logger(TransactionService.name);
	private readonly MNEMONIC: string;
	private readonly aminoTypes: AminoTypes;

	constructor(private readonly _configService: ConfigService) {
		this.MNEMONIC = this._configService.get<string>('WALLET_SEED_PHRASE');

		this.aminoTypes = new AminoTypes({
			...createDefaultAminoConverters(),
		});
	}

	async createMultiSendTx(wallets: WalletsKeyValuePairs[]): Promise<DeliverTxResponse> {
		const registryChain: Chain = chains.find(
			(chain) => chain.chain_id === "cosmoshub-4",
		);
		if (isNil(registryChain)) {
			throw new Error(
				`Failed to find chain with ID "cosmoshub-4" in registry`,
			);
		}
		const denom = registryChain.fees.fee_tokens[0].denom;

		// create startgate client
		const {signer, signingClient, signerAddress, pubkey} = await this.newStargateSigningClient(registryChain);
		const {accountNumber, sequence} = await signingClient.getAccount(signerAddress);

		this._logger.log(`Will send tokens from ${signerAddress}`);

		const inputs: Input[] = [];
		const outputs: Output[] = [];
		for (const wallet of wallets) {
			// set inputs, all the same address sending tokens (cosmjs limitation anyway)
			inputs.push({
				address: signerAddress,
				coins: [{amount: wallet.refund.toString(), denom}]
			});
			outputs.push({
				address: wallet.wallet,
				coins: [{amount: wallet.refund.toString(), denom}]
			});
		}

		this._logger.log(`Total amount to send: ${inputs
			.map(i => parseInt(i.coins[0].amount))
			.reduce((previousValue, currentValue) => {
				if (isNil(previousValue)) {
					return currentValue;
				}
				return currentValue + previousValue;
			})} ${denom}`);

		// create multisend message
		const multiSendMsg: MsgMultiSend = {
			inputs,
			outputs
		};
		const message: EncodeObject = ({
			typeUrl: "/cosmos.bank.v1beta1.MsgMultiSend",
			value: MsgMultiSend.fromPartial(multiSendMsg),
		});
		const aminoMsg = this.aminoTypes.toAmino(message);

		// simulate to get gas estimation
		const gasUsed = await signingClient.simulate(signerAddress, [message], "");
		const fees = Math.trunc(registryChain.fees.fee_tokens[0].high_gas_price * gasUsed / 10) + 200;
		const gasToUse = new IntPretty(new Dec(gasUsed).mul(new Dec(1.4)))
			.maxDecimals(0)
			.locale(false)
			.toString()
		const feeAmount: StdFee = {
			amount: coins(3000, denom),
			gas: gasToUse
		};

		this._logger.log(`Calculated fees ${feeAmount.amount[0].amount} ${denom} and gas ${feeAmount.gas}`)

		const signDoc = makeSignDoc(
			[aminoMsg],
			feeAmount,
			registryChain.chain_id,
			"Slashing reimbursement from High Stakes 🇨🇭",
			accountNumber,
			sequence,
		);

		// sign message
		const txBytes = await this.signMessage(signer, signerAddress, signDoc, message, pubkey, gasToUse);
		// broadcast message
		const tx = await signingClient.broadcastTx(txBytes);
		this._logger.log(`Sent MultiSendMsg for ${wallets.length} wallets with hash ${tx.transactionHash}`);
		return tx;
	}

	private async newStargateSigningClient(chain: Chain) {
		const signer = await ChainUtils.offlineSigner(this.MNEMONIC, chain);
		const tmClient = await Tendermint37Client.connect(this._configService.get<string>('COSMOS_NETWORK_ENDPOINT'));
		const signingClient = await SigningStargateClient.createWithSigner(
			tmClient as any,
			signer);

		const accountData = await signer.getAccounts();
		const signerAddress = accountData[0].address;
		const pubkey = encodePubkey(
			encodeSecp256k1Pubkey(accountData[0].pubkey),
		);

		return {signer, signingClient, signerAddress, pubkey};
	}

	private async signMessage(signer: Secp256k1HdWallet, signerAddress: string, signDoc: StdSignDoc, message: EncodeObject, pubkey: Any, gasUsed: string) {
		// necessary stuff, however beyond understanding

		const {signature, signed} = await signer.signAmino(
			signerAddress,
			signDoc,
		);
		const signedTxBody = {
			messages: signed.msgs.map((msg) => this.aminoTypes.fromAmino(msg)),
			memo: signed.memo,
		};
		const signedTxBodyEncodeObject: TxBodyEncodeObject = {
			typeUrl: "/cosmos.tx.v1beta1.TxBody",
			value: signedTxBody,
		};
		//signedTxBodyEncodeObject.value.memo = signDoc.memo
		const registry = new Registry(defaultRegistryTypes);
		const signedTxBodyBytes = registry.encode(signedTxBodyEncodeObject);
		const signedSequence = Int53.fromString(signed.sequence).toNumber();
		const signedAuthInfoBytes = makeAuthInfoBytes(
			[{pubkey, sequence: signedSequence}],
			signed.fee.amount,
			parseInt(gasUsed),
			signed.fee.granter,
			signed.fee.payer,
			SignMode.SIGN_MODE_LEGACY_AMINO_JSON
		);
		const rawTx = TxRaw.fromPartial({
			bodyBytes: signedTxBodyBytes,
			authInfoBytes: signedAuthInfoBytes,
			signatures: [fromBase64(signature.signature)]
		});
		return TxRaw.encode(rawTx).finish();
	}

}

export interface SwapResult {
	result: "ERROR" | "SUCCESS" | "ABORTED",
	error?: string,
	tx_hash?: string
}