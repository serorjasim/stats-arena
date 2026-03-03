import React from "react";

export default function Stat({ label, value }) {
  return (
    <div className="bg-gray-800 rounded-xl py-6">
      <p className="text-3xl font-extrabold">{value !== undefined ? value : "—"}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}