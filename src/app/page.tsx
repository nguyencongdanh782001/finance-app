import { Suspense } from "react";
import HomeContainer from "@/container/HomeContainer";

export default function Home() {
  return (
    <Suspense>
      <HomeContainer />
    </Suspense>
  );
}
