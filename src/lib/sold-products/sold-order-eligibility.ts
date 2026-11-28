export type SoldOrderEligibilityInput = {
  source: "OFFLINE" | "ONLINE";
  status: string;
  paymentStatus?: string;
};

export const isSoldOrderEligible = ({
  source,
  status,
  paymentStatus,
}: SoldOrderEligibilityInput) =>
  source === "OFFLINE"
    ? status !== "CANCELLED" && status !== "REFUNDED"
    : (status === "DELIVERED" || status === "COMPLETED") &&
      paymentStatus === "PAID";
