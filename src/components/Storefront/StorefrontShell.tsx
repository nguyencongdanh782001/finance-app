import StorefrontHeader from "@/components/Storefront/StorefrontHeader";
import StorefrontFooter from "@/components/Storefront/StorefrontFooter";
import CustomerChatAssistant from "@/components/Storefront/CustomerChatAssistant";
import { Suspense } from "react";

export default function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF8F8] text-[#2D2226]">
      <Suspense
        fallback={
          <div className="h-16 border-b border-[#EAE1E4] bg-[#FAF8F8]" />
        }
      >
        <StorefrontHeader />
      </Suspense>
      {children}
      <StorefrontFooter />
      <CustomerChatAssistant />
    </div>
  );
}
