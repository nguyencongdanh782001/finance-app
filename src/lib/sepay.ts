export type SepayTransaction = {
  id?: number | string;
  accountNumber?: string;
  subAccount?: string;
  code?: string | null;
  content?: string;
  transferType?: string;
  transferAmount?: number;
  referenceCode?: string;
  [key: string]: unknown;
};

export function getSepayTransactionId(transaction: SepayTransaction) {
  const value = transaction.id ?? transaction.referenceCode;
  return value == null ? null : String(value);
}

export function extractOrderNumber(transaction: SepayTransaction) {
  const value = transaction.code || transaction.content || "";
  const match = value.match(/\bQN-\d+-\d{3}\b/i);
  return match?.[0]?.toUpperCase() || null;
}
