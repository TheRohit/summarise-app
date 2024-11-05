import { Blur } from "@/components/Blur";
import Home from "@/components/Home";
import { GoogleSignin } from "@/components/google-signin";
import Meteors from "@/components/meteors";
import Particles from "@/components/particles";
import Image from "next/image";

export const metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center overflow-hidden">
      <Blur />
      {/* <Meteors number={30} /> */}
      <Particles
        className="absolute inset-0 -z-50"
        quantity={50}
        ease={80}
        color={"#ffffff"}
        refresh
      />
      <Home />
    </div>
  );
}
