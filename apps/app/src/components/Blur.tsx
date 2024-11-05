export function Blur() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
    >
      {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
      <div className="fix-safari-blur h-56 bg-gradient-to-br from-violet-500 to-purple-400 blur-[106px] dark:from-fuchsia-700"></div>

      {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
      <div className="fix-safari-blur h-32 bg-gradient-to-r from-fuchsia-400 to-purple-300 blur-[106px] dark:to-violet-600"></div>
    </div>
  );
}
