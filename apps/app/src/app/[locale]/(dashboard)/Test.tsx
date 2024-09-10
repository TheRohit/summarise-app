"use client";

import { transcribe } from "@/app/api/actions";
import { Button } from "@v1/ui/button";
export const dynamic = "force-dynamic";
const Test = () => {
  return (
    <div>
      <Button
        onClick={async () => {
          const res = await transcribe("dzYP01CPC6E");
          console.log(res);
        }}
      >
        Test
      </Button>
    </div>
  );
};

export default Test;
