export const Heading = () => {
  return (
    <header className="mt-10 flex min-h-0 flex-col items-center justify-center p-4 shadow-xl">
      <h1 className="animate-fade-in translate-y-[-1rem] text-balance bg-gradient-to-t from-purple-600 to-white bg-clip-text py-6 text-center text-5xl font-medium leading-none tracking-tighter text-transparent [--animation-delay:200ms] sm:text-6xl md:text-7xl lg:text-8xl">
        TL;DW: Long Content? We&apos;ve Got the Gist
      </h1>
      <h2 className="text-balanced text-center text-xl font-semibold text-zinc-300">
        Quick video insights. More knowledge, less time.
      </h2>
    </header>
  );
};
