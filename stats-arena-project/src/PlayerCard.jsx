import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Stat from "./Stat";

export default function PlayerCard({ selectedPlayer, cardColor, selectedTeamName }) {
  const avg =
    selectedPlayer && selectedPlayer.average ? selectedPlayer.average : null;

  const points = avg ? avg.points : undefined;
  const assists = avg ? avg.assists : undefined;
  const rebounds = avg ? avg.rebounds : undefined;

  return (
    <AnimatePresence>
      {selectedPlayer && (
        <motion.div
          className="mt-12 w-full max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div
            className="rounded-2xl shadow-2xl p-8 grid md:grid-cols-3 gap-6 items-center"
            style={{
              background: `linear-gradient(135deg, ${cardColor.primary}, ${cardColor.secondary})`,
            }}
          >
            <div className="md:col-span-1 text-center md:text-left">
              <h2 className="text-3xl font-bold">{selectedPlayer.full_name}</h2>
              <p className="text-gray-300 uppercase tracking-wide mt-1">
                {selectedTeamName !== "N/A" ? selectedTeamName : "Team loading…"}
              </p>
              <p className="text-gray-400 uppercase tracking-wide mt-1">
                {selectedPlayer.position || "Unknown Position"}
              </p>
            </div>

            <div className="md:col-span-2 grid grid-cols-3 gap-4 text-center">
              <Stat label="PTS" value={points} />
              <Stat label="AST" value={assists} />
              <Stat label="REB" value={rebounds} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}