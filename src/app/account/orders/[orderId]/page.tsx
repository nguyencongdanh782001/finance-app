import AccountCenter from "@/components/Account/AccountCenter";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const orderId = Number((await params).orderId);

  return <AccountCenter section="order-detail" orderId={orderId} />;
}
