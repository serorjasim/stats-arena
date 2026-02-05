import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { nbaTeamColors } from "./nbaTeamColors";

export default function NbaPlayersSearch() {
  const [players, setPlayers] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("http://localhost:5000/api/players");
        if (!response.ok) throw new Error("Failed to fetch players");
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchPlayers();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    setHasSearched(true);
    const searchQuery = query.toLowerCase().trim();
    if (!searchQuery) return setSearchResult(null);

    const foundPlayer = players.find((player) => {
      const lowerName = player.full_name.toLowerCase();
      return lowerName.includes(searchQuery) || lowerName.split(" ").some((namePart) => namePart.startsWith(searchQuery));
    });

    setSearchResult(foundPlayer || null);
  }

  const cardColor = searchResult
    ? nbaTeamColors[searchResult.team] || { primary: "#000000", secondary: "#333333" }
    : { primary: "#000000", secondary: "#333333" };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white flex flex-col items-center px-6">
      <header className="w-full max-w-5xl py-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          NBA Player Finder
        </h1>
        <p className="text-gray-400 mt-2">
          Search NBA player stats
        </p>
      </header>

      <form
        onSubmit={handleSearch}
        className="w-full max-w-xl flex items-center bg-white rounded-full shadow-lg overflow-hidden"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search player (LeBron, Curry, Durant…)"
          className="flex-1 px-6 py-4 text-gray-900 outline-none"
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 px-6 py-4 transition"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>

      <AnimatePresence>
        {searchResult && (
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
                background: `linear-gradient(135deg, ${cardColor.primary}, ${cardColor.secondary})`, // ← ADDED
              }}
            >
              <div className="md:col-span-1 text-center md:text-left">
                <h2 className="text-3xl font-bold">{searchResult.full_name}</h2>
                <p className="text-gray-400 uppercase tracking-wide mt-1">
                  {searchResult.position || "Unknown Position"}
                </p>
              </div>

              <div className="md:col-span-2 grid grid-cols-3 gap-4 text-center">
                <Stat label="PTS" value={searchResult && searchResult.average ? searchResult.average.points : undefined} />
                <Stat label="AST" value={searchResult && searchResult.average ? searchResult.average.assists : undefined} />
                <Stat label="REB" value={searchResult && searchResult.average ? searchResult.average.rebounds : undefined} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasSearched && searchResult === null && (
        <p className="mt-6 text-red-400">No player found</p>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-800 rounded-xl py-6">
      <p className="text-3xl font-extrabold">
        {value !== undefined ? value : "—"}
      </p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}
