import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'contact' })
export class ContactEntity {
    @PrimaryColumn({ name: 'address' })
    address: string;

    @Column({ name: 'name' })
    name: string;
}