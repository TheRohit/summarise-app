"use client";

import { LinkRequest, LinkValidator } from "@/lib/validators/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@v1/ui/button";
import { cn } from "@v1/ui/cn";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@v1/ui/form";
import { Input } from "@v1/ui/input";
import getYouTubeID from "get-youtube-id";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const InputForm = () => {
  const router = useRouter();
  const form = useForm<LinkRequest>({
    resolver: zodResolver(LinkValidator),
    defaultValues: {
      url: "",
    },
  });

  const goToSummary = (data: LinkRequest) => {
    const url = data.url;
    const videoId = getYouTubeID(url);
    router.push(`/summary/${videoId}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => goToSummary(data))}>
        <div className="flex w-full gap-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    autoComplete="off"
                    placeholder="youtube.com/watch?v=dQw4w9WgXcQ"
                    {...field}
                    className="min-w-52"
                    aria-label="Enter YouTube video URL"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            variant={"ghost"}
            disabled={form?.watch("url") === ""}
            className={cn(
              "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800",
              "flex-shrink-0"
            )}
            aria-label="Generate summary"
          >
            <span>✨ Generate</span>
          </Button>
        </div>
      </form>
    </Form>
  );
};
