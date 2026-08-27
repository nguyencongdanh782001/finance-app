import { Suspense } from "react";
import HomeContainer from "@/container/HomeContainer";

export default function AdminHome() {
  return (
    <Suspense>
      <HomeContainer />
    </Suspense>
  );
}
