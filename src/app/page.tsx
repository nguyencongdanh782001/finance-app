import { Suspense } from "react";
import HomeContainer from "@/container/HomeContainer";
import Navbar from "@/components/common/Navbar";

export default function Home() {
  return (
    <>
      <Suspense>
        <HomeContainer />
      </Suspense>
      <Navbar />
    </>
  );
}
