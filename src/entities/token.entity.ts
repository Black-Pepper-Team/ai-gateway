import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'token' })
export class TokenEntity {
    @PrimaryColumn()
    address: string;

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'symbol' })
    symbol: string;

    @Column({ name: 'network' })
    network: string;

    @Column({ name: 'is_native' })
    isNative: boolean;
}