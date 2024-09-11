import { transcribeAction } from "@/actions/transcribe/transcribe";
import { getPosts } from "@v1/supabase/queries";

import GlobalError from "@/app/global-error";
import { AnimatedText } from "../../../../web/src/components/animated-text";
import InitialContent from "./InitialContent";

export async function SummaryServer({ id }: { id: string }) {


  const {data, error} = await transcribeAction({ id: id });
 

  return (
    <div className=" flex h-full w-full justify-between gap-2">
      {/* <ChatWindow videoId={id} /> */}
      <InitialContent
        chapters={typeof result?.data === "object" ? result?.data : undefined}
        videoInfo={result.}
      />
    </div>
  );
}
