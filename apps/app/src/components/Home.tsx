import Image from "next/image";
import LandingImage from "../asserts/summarise-home.jpeg";

import { Blur } from "./Blur";
import { Heading } from "./Heading";
import { BorderBeam } from "./border-beam";
import { GoogleSignin } from "./google-signin";

const Home = () => {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <main className="flex-1">
        <article className="flex w-full flex-col items-center justify-center gap-10">
          <Heading />
          <section className="flex w-full items-center justify-center">
            {/* <ChatCompletion /> */}
            <GoogleSignin />
          </section>

          <section className="relative mx-auto mb-16 w-full max-w-5xl px-4">
            <Blur />
            <div
              className="relative aspect-[16/9] overflow-hidden rounded-lg border border-white/10"
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 70%, transparent 100%), linear-gradient(to bottom, black 70%, transparent 100%)",
              }}
            >
              <Image
                priority
                src={LandingImage}
                objectFit="cover"
                className="rounded-lg"
                alt="TL;DW: Long Content? We've Got the Gist - Quick video insights"
                width={1280}
                height={720}
              />
              {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
              <div
                className="absolute inset-0 overflow-hidden rounded-lg"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 70%, transparent 100%)",
                }}
              >
                <BorderBeam />
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
};

export default Home;
