import { redirect } from "next/navigation";

export default async function LegacyPolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  redirect(`/policies?policy=${encodeURIComponent((await params).slug)}`);
}
