"use client";

import {
  SearchResult,
  searchVideosAction,
} from "@/actions/search/search-videos";
import { SearchRequest, SearchValidator } from "@/lib/validators/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@v1/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@v1/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@v1/ui/form";
import { Input } from "@v1/ui/input";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Thumbnail } from "./summary/Thumbnail";

export const VideoSearch = () => {
  const { executeAsync, result, isPending } = useAction(searchVideosAction);
  const handleSearch = async (data: SearchRequest) => {
    await executeAsync({ query: data.query });
  };

  const form = useForm<SearchRequest>({
    resolver: zodResolver(SearchValidator),
    defaultValues: {
      query: "",
    },
  });

  const data = result?.data?.results ?? [];

  console.log(data);

  return (
    <div className="w-full space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => handleSearch(data))}>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input
                      autoComplete="off"
                      type="text"
                      placeholder="Enter your search query"
                      {...field}
                      className="flex-grow"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              isLoading={isPending}
              disabled={form?.watch("query") === "" || isPending}
            >
              {isPending ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
      </Form>
      {data.length > 0 && result?.data?.results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((result) => (
            <Card key={result?.videoId}>
              <CardHeader>
                {/* <Thumbnail videoInfo={result.videoInfo} /> */}
                <CardTitle>{result?.videoTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {result?.relevantContent?.length ?? 0 > 150
                    ? `${result?.relevantContent?.substring(0, 150)}...`
                    : result?.relevantContent}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
