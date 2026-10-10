'use client';

import { useRouter } from 'next/navigation';

export function CompareSelect({
  value,
  options,
}: {
  value: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm text-slate-400">
      Compare to
      <select
        value={value}
        onChange={(e) => router.push(`/dashboard?compare=${e.target.value}`, { scroll: false })}
        className="bg-[#0F172A] border border-slate-600 text-white text-sm rounded-lg p-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}