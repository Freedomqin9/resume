import { cn, scoreTone } from "@/lib/utils";

export function ScoreRing({
  score,
  label = "综合匹配分",
}: {
  score: number;
  label?: string;
}) {
  const background = `conic-gradient(#2563EB ${score * 3.6}deg, #E2E8F0 0deg)`;

  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-28 w-28 place-items-center rounded-full"
        style={{ background }}
      >
        <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
          <span className="text-2xl font-bold text-slate-950">{score}</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <span
          className={cn(
            "mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold",
            scoreTone(score),
          )}
        >
          {score} / 100
        </span>
      </div>
    </div>
  );
}
