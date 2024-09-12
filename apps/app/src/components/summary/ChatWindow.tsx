"use client";

import { generateStream } from "@/actions/stream/generate-stream";
import { Button } from "@v1/ui/button";
import { cn } from "@v1/ui/cn";
import { Input } from "@v1/ui/input";
import { ScrollArea } from "@v1/ui/scroll-area";
import { TextEffect } from "@v1/ui/text-effect";
import { readStreamableValue } from "ai/rsc";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface GenerationData {
  tldr: string;
  fullResponse: string;
}

const ChatWindow = ({ videoId }: { videoId: string }) => {
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");
  const [generation, setGeneration] = useState<GenerationData>({
    tldr: "",
    fullResponse: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    setGeneration({ tldr: "", fullResponse: "" });
    setTitle(input);
    setInput("");
    setIsExpanded(true);
    const { output } = await generateStream(input, videoId);

    for await (const delta of readStreamableValue(output)) {
      setGeneration((currentGeneration) => ({
        tldr: currentGeneration?.tldr + (delta?.tldr ?? ""),
        fullResponse:
          currentGeneration?.fullResponse + (delta?.fullResponse ?? ""),
      }));
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={containerRef}
      className="flex h-full w-[60%] flex-col gap-4 p-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <TextEffect
            className="text-2xl font-extrabold"
            per="char"
            preset="fade"
          >
            {title}
          </TextEffect>
        </motion.div>
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-grow overflow-hidden"
      >
        <ScrollArea className="h-full w-full rounded-md border-2 border-dashed border-muted-foreground p-4">
          <motion.div
            animate={{
              minHeight: isExpanded ? 200 : 0,
              padding: isExpanded ? 12 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
            className={cn(
              "w-full rounded-lg ",
              isExpanded
                ? "bg-neutral-200 dark:bg-neutral-800"
                : "bg-transparent"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={generation.fullResponse}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-2">
                  {generation.tldr && (
                    <h1 className="font-serif text-6xl font-bold">TL;DR</h1>
                  )}
                  <ReactMarkdown className="text-2xl font-semibold">
                    {generation?.tldr}
                  </ReactMarkdown>
                </div>
                <ReactMarkdown className="font-mono text-xl">
                  {generation?.fullResponse}
                </ReactMarkdown>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </ScrollArea>
      </motion.div>
      <motion.div
        className="flex w-full items-center justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-[60%]"
          onKeyDown={handleKeyDown}
          autoComplete="off"
          placeholder="Ask Something about the video"
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ChatWindow;
