import { PolicyForm } from "@/components/Admin/Content/PolicyManagementClient";
export default async function EditPolicyPage({ params }: { params: Promise<{ id: string }> }) { return <PolicyForm id={(await params).id} />; }
