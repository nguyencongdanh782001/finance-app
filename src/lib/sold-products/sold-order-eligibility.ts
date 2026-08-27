export type SoldOrderEligibilityInput = {
  source: "OFFLINE" | "ONLINE";
  status: string;
};

export const isSoldOrderEligible = ({
  source,
  status,
}: SoldOrderEligibilityInput) =>
  source === "OFFLINE"
    ? status !== "CANCELLED" && status !== "REFUNDED"
    : status === "DELIVERED";
