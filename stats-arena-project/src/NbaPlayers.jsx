import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { nbaTeamColors } from "./nbaTeamColors";

export default function NbaPlayersSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [isListVisible, setIsListVisible] = useState(true);
  const [hintMessage, setHintMessage] = useState("");

  const selectedPlayerId =
    selectedPlayer && selectedPlayer.id ? selectedPlayer.id : null;

  useEffect(() => {
    if (!selectedPlayerId) return;

    async function fetchStats() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/player-stats/${selectedPlayerId}`
        );
        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();

        setSelectedPlayer((prev) => {
          if (!prev || prev.id !== selectedPlayerId) return prev;

          return {
            ...prev,
            team: data && data.team ? data.team : prev.team,
            average: data ? data.average : prev.average,
          };
        });
      } catch (err) {
        console.error(err);
      }
    }

    fetchStats();
  }, [selectedPlayerId]);

  async function handleSearch(e) {
    e.preventDefault();
    setHasSearched(true);
    setIsSearching(true);
    setHintMessage("");

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setSelectedPlayer(null);
      setIsListVisible(true);
      setIsSearching(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/players?search=${encodeURIComponent(trimmedQuery)}`
      );
      if (!response.ok) throw new Error("Failed to fetch players");

      const data = await response.json();

      let playersArray = [];
      let hint = "";

      if (Array.isArray(data)) {
        playersArray = data;
      } else if (data && typeof data === "object") {
        if (Array.isArray(data.results)) playersArray = data.results;
        if (typeof data.hint === "string") hint = data.hint;
      }

      setHintMessage(hint);

      setResults(playersArray);

      if (playersArray.length === 0) {
        setSelectedPlayer(null);
        setIsListVisible(true);
      } else if (playersArray.length === 1) {
        // Specific match: auto-select and hide list
        setSelectedPlayer(playersArray[0]);
        setIsListVisible(false);
      } else {
        setSelectedPlayer(playersArray[0]);
        setIsListVisible(true);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
      setSelectedPlayer(null);
      setIsListVisible(true);
    } finally {
      setIsSearching(false);
    }
  }

  function handlePickPlayer(player) {
    setSelectedPlayer(player);
    setIsListVisible(false);
  }

  const selectedTeamName =
    selectedPlayer && selectedPlayer.team ? selectedPlayer.team : "N/A";

  const defaultColors = { primary: "#000000", secondary: "#333333" };
  const cardColor = selectedPlayer
    ? nbaTeamColors[selectedTeamName] || defaultColors
    : defaultColors;


  const avg = selectedPlayer && selectedPlayer.average ? selectedPlayer.average : null;
  const points = avg ? avg.points : undefined;
  const assists = avg ? avg.assists : undefined;
  const rebounds = avg ? avg.rebounds : undefined;

  const shouldShowList =
    isListVisible && results.length > 1 && !isSearching && !!selectedPlayer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white flex flex-col items-center px-6">
      <header className="w-full max-w-5xl py-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          NBA Player Finder
        </h1>
        <p className="text-gray-400 mt-2">Search NBA player stats</p>
      </header>

      <form
        onSubmit={handleSearch}
        className="w-full max-w-xl flex items-center bg-white rounded-full shadow-lg overflow-hidden"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search player (last name or full name works best)"
          className="flex-1 px-6 py-4 text-gray-900 outline-none"
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 px-6 py-4 transition"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>

      {hasSearched && !isSearching && hintMessage && (
        <p className="mt-4 text-yellow-300 text-sm max-w-xl text-center">
          {hintMessage}
        </p>
      )}

      {hasSearched && isSearching && <p className="mt-6 text-gray-300">Searching…</p>}

      {hasSearched && !isSearching && results.length === 0 && !hintMessage && (
        <p className="mt-6 text-red-400">No player found</p>
      )}

      {selectedPlayer && results.length > 1 && !shouldShowList && (
        <button
          type="button"
          onClick={() => setIsListVisible(true)}
          className="mt-4 text-sm text-gray-300 hover:text-white underline"
        >
          Change player
        </button>
      )}

      {shouldShowList && (
        <div className="w-full max-w-xl mt-6 space-y-2">
          {results.map((player) => {
            const isSelected = selectedPlayer && selectedPlayer.id === player.id;
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => handlePickPlayer(player)}
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
      )}

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
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-800 rounded-xl py-6">
      <p className="text-3xl font-extrabold">{value !== undefined ? value : "—"}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}
