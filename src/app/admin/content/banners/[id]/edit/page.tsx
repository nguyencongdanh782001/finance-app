import { BannerForm } from "@/components/Admin/Content/BannerManagementClient";
export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) { return <BannerForm id={(await params).id} />; }
