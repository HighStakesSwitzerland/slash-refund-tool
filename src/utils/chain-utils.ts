import {HdPath, stringToPath} from "@cosmjs/crypto";
import {Secp256k1HdWallet} from "@cosmjs/amino";
import {Chain} from "@chain-registry/types";

export class ChainUtils {

	static offlineSigner = async (memonic: string, chain: Chain) => Secp256k1HdWallet.fromMnemonic(
		memonic,
		{
			hdPaths: [ChainUtils.getHdPathForChain(chain)],
			prefix: chain.bech32_prefix
		}
	);

	static getHdPathForChain(chain: Chain): HdPath {
		switch (chain.bech32_prefix) {
			case 'band':
				return stringToPath("m/44'/494'/0'/0/0");
			case 'inj':
				return stringToPath("m/44'/60'/0'/0/0");
			case 'terra':
				return stringToPath("m/44'/330'/0'/0/0");
			case 'secret':
				return stringToPath("m/44'/529'/0'/0/0");
			case 'panacea':
				return stringToPath("m/44'/371'/0'/0/0");
			case 'desmos':
				return stringToPath("m/44'/852'/0'/0/0");

			default:
				return stringToPath("m/44'/118'/0'/0/0");
		}
	}

}