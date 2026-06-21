export interface Account {
    id: number;
    accountNumber: string;
    username: string;
    holderName: string;
    balance: number;
    status: string;
}

export interface CreateAccountRequest {
    username: string;
    password: string;
    holderName: string;
    initialBalance: number;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface TransferRequest {
    fromAccountId: number;
    toAccountId: number;
    amount: number;
    idempotencyKey: string;
}

export interface TransferResponse {
    transactionId: string;
    status: string;
    message: string;
    debitedFrom: number;
    creditedTo: number;
    amount: number;
}

export interface Transaction {
    id: string;
    fromAccountId: number;
    toAccountId: number;
    amount: number;
    status: string;
    createdOn: string;
}

// ── Reward Module ─────────────────────────────────────────────────────────────

export interface RewardEntry {
    id: number;
    transactionId: string;
    pointsEarned: number;
    createdOn: string;
}

export interface RewardSummary {
    accountId: number;
    totalPoints: number;
    history: RewardEntry[];
}

export interface RewardRedemptionRequest {
    points: number;
}

export interface RewardRedemptionResponse {
    accountId: number;
    redeemedAmount: number;
    remainingPoints: number;
    newBalance: number;
}
