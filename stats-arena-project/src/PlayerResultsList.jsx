import React from "react";

export default function PlayerResultsList({
  results,
  selectedPlayer,
  onPickPlayer,
}) {
  return (
    <div className="w-full max-w-xl mt-6 space-y-2">
      {results.map((player) => {
        const isSelected = selectedPlayer && selectedPlayer.id === player.id;

        return (
          <button
            key={player.id}
            type="button"
            onClick={() => onPickPlayer(player)}
            className={`w-full text-left rounded-xl px-4 py-3 transition ${
              isSelected
                ? "bg-gray-700 border border-gray-500"
                : "bg-gray-900 hover:bg-gray-800 border border-transparent"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{player.full_name}</span>
              <span className="text-sm text-gray-400">
                {player.position || "N/A"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}