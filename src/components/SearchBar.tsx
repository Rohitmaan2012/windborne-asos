"use client";
import { useState } from "react";

type Props = {
  onChange: (q: string) => void;
};

export default function SearchBar({ onChange }: Props) {
  const [q, setQ] = useState("");
  return (
    <div className="mb-3 flex items-center gap-2">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onChange(e.target.value);
        }}
        className="w-full rounded-xl border px-3 py-2 shadow-sm"
        placeholder="Search by station id, name, city, or state..."
      />
    </div>
  );
}
