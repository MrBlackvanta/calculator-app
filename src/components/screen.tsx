import { groupThousands } from "@/lib/display";

export default function Screen({ value }: { value: string }) {
  return (
    <output
      role="status"
      aria-label="Result"
      className="bg-screen rounded-panel flex h-22 items-end justify-end overflow-hidden px-6 pb-5 md:h-32 md:px-8 md:pb-8.5"
    >
      <span className="max-xs:text-readout-sm text-readout md:text-readout-lg pe-[0.0167em] tracking-tight">
        {groupThousands(value)}
      </span>
    </output>
  );
}
