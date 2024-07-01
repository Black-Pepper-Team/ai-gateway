import { Entity, PrimaryColumn, Column } from "typeorm";

export enum RequestStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    DONE = 'done'
}

export enum RequestType {
    FILTERED_BY_WHITELIST = 'filtered',
    ANSWER_QUESTION_OR_REGULAR_DIALOG = 'answer_question_or_regular_dialog',
    ANSWER_CRYPTO_CRYPTOGRAPHY_OR_MATH_RELATED_QUESTION = 'answer_crypto_cryptography_or_math_related_question',
    CHECK_BALANCE = 'check_balance',
    GET_UNISWAP_PAIRS = 'get_uniswap_pairs',
    SCRIPT_WITH_FUNDS_TRANSFER = 'funds_transfer',
    SCRIPT_WITH_UNISWAP_SWAP = 'uniswap_swap',
}

@Entity({ name: 'request' })
export class RequestEntity {
    @PrimaryColumn({ name: 'id', type: 'text' })
    id: string;

    @Column({ name: 'prompt', type: 'text' })
    prompt: string;

    @Column({ name: 'status', enum: RequestStatus, default: RequestStatus.PENDING })
    status: RequestStatus;

    @Column({ name: 'key', type: 'text', nullable: true })
    key: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'request_type', enum: RequestType, nullable: true })
    requestType: RequestType;

    @Column({ name: 'file', type: 'text', nullable: true })
    file: string;

    @Column({ name: 'text', type: 'text', nullable: true })
    text: string;

    @Column({ name: 'text_to_say', type: 'text', nullable: true })
    textToSay: string;

    @Column({ name: 'contacts', type: 'text', nullable: true })
    contacts: string;
}