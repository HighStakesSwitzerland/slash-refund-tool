import {Column, Entity, PrimaryColumn} from "typeorm";

/**
 * Update table name below
 */
@Entity({name: 'COSMOS_REFUND'})
export class WalletsKeyValuePairs {

	@PrimaryColumn({type: 'int', generated: "increment"})
	id: number;

	@Column({type: 'varchar', length: 100})
	wallet: string;

	@Column({type: "varchar", length: 10})
	refund: string;

	@Column({type: 'varchar', length: 150})
	txhash: string;

}