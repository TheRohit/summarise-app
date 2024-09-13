import { InputForm } from "@/components/input-form";
import { SignOut } from "@/components/sign-out";

import { getUser } from "@v1/supabase/queries";

export const metadata = {
  title: "Home",
};

export default async function Page() {
  const { data } = await getUser();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <p>{data?.user?.email}</p>

        <InputForm />
        <SignOut />
      </div>
    </div>
  );
}
