"use client";

import { transcribeAction } from "@/actions/transcribe/transcribe";
import { Button } from "@v1/ui/button";
export const dynamic = "force-dynamic";
const Test = () => {
  return (
    <div>
      <Button
        onClick={async () => {
          const res = await transcribeAction({ id: "dzYP01CPC6E" });
          console.log(res);
        }}
      >
        Test
      </Button>
    </div>
  );
};

export default Test;
