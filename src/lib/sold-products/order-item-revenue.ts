export const calculateNetOrderItemAmount = ({
  lineSubtotal,
  orderSubtotal,
  discountAmount,
}: {
  lineSubtotal: number;
  orderSubtotal: number;
  discountAmount: number;
}) => {
  if (discountAmount <= 0 || orderSubtotal <= 0) {
    return Math.max(0, Math.round(lineSubtotal));
  }

  return Math.max(
    0,
    Math.round(lineSubtotal - (discountAmount * lineSubtotal) / orderSubtotal),
  );
};
