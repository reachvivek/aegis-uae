"use client";

interface PopularQuery {
  query: string;
  count: number;
}

interface QueriesPanelProps {
  queries: PopularQuery[];
}

export default function QueriesPanel({ queries }: QueriesPanelProps) {
  const maxCount = Math.max(...queries.map((q) => q.count), 1);

  return (
    <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1E1E28]">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A]">Most Asked Questions ({queries.length})</p>
      </div>
      <div className="divide-y divide-[#1E1E28]/30">
        {queries.map((q, i) => {
          const pct = (q.count / maxCount) * 100;
          return (
            <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-[#12121A] transition-colors relative">
              {/* Background bar */}
              <div
                className="absolute inset-0 bg-[#00E5B8]/[0.03] rounded-none"
                style={{ width: `${pct}%` }}
              />
              <span className="text-sm font-bold font-mono text-[#7C7C8A] w-6 text-right relative z-10">{i + 1}</span>
              <span className="text-xs text-white flex-1 relative z-10">{q.query}</span>
              <span className="text-xs font-mono text-[#00E5B8] shrink-0 bg-[#00E5B8]/10 px-2 py-0.5 rounded relative z-10">{q.count}x</span>
            </div>
          );
        })}
        {queries.length === 0 && <p className="text-xs text-[#7C7C8A] p-6 text-center">No queries yet</p>}
      </div>
    </div>
  );
}
