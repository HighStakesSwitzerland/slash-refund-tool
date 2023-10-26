export enum ChainName {
	COSMOSHUB = 'COSMOSHUB',
	SECRET = 'SECRET',
	TERRA2 = 'TERRA2',
	INJECTIVE = 'INJECTIVE',
	SHENTU = 'SHENTU',
	BANDCHAIN = 'BANDCHAIN',
	PANACEA = 'PANACEA',
	PERSISTENCE = 'PERSISTENCE',
	IRISNET = 'IRISNET',
	PROVENANCE = 'PROVENANCE',
	FETCHHUB = 'FETCHHUB',
	DESMOS = 'DESMOS',
	TERITORI = 'TERITORI',
	MIGALOO = 'MIGALOO',
	UMEE = 'UMEE',
	JUNO = "JUNO"
}

export const SupportedChains = Object.keys(ChainName);

export enum AssetPrefix {
	COSMOS = 'cosmos',
	SECRET = 'secret',
	TERRA2 = 'terra',
	INJECTIVE = 'inj',
	SHENTU = 'cert',
	BAND = 'band',
	MEDIBLOC = 'med',
	PERSISTENCE = 'per',
	IRIS = 'iris',
	PROVENANCE = 'provenance',
	FETCH = 'fet',
	DESMOS = 'des',
	TERITORI = 'tori',
	MIGALOO = 'migaloo',
	UMEE = 'umee',
	JUNO = 'juno'
}

export enum AssetMicroDenom {
	COSMOS = 'uatom',
	SECRET = 'uscrt',
	TERRA2 = 'uluna',
	INJECTIVE = 'uinj',
	SHENTU = 'uctk',
	BAND = 'uband',
	MEDIBLOC = 'umed',
	PERSISTENCE = 'uxprt',
	IRIS = 'uiris',
	PROVENANCE = 'hash',
	FETCH = 'afet',
	DESMOS = 'udsm',
	TERITORI = 'utori',
	MIGALOO = 'uwhale',
	UMEE = 'umee',
	JUNO = "ujuno"
}

export enum AssetDenom {
	COSMOS = 'atom',
	SECRET = 'scrt',
	TERRA = 'luna',
	INJECTIVE = 'inj',
	SHENTU = 'ctk',
	BAND = 'band',
	MEDIBLOC = 'med',
	PERSISTENCE = 'xprt',
	IRIS = 'iris',
	PROVENANCE = 'hash',
	FETCH = 'fet',
	DESMOS = 'dsm',
	TERITORI = 'tori',
	MIGALOO = 'whale',
	UMEE = 'umee'
}
