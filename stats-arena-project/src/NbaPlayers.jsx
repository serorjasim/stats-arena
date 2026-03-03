import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { nbaTeamColors } from "./nbaTeamColors";
import PlayerCard from "./PlayerCard";
import PlayerResultsList from "./PlayerResultsList";

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
        `${process.env.REACT_APP_API_BASE_URL}/api/players?search=${encodeURIComponent(
          trimmedQuery
        )}`
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

      {hasSearched && isSearching && (
        <div className="mt-6 flex items-center gap-3 text-gray-300">
          <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Searching… (The initial search may take a few seconds)</p>
        </div>
      )}

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
        <PlayerResultsList
          results={results}
          selectedPlayer={selectedPlayer}
          onPickPlayer={handlePickPlayer}
        />
      )}

      <PlayerCard
        selectedPlayer={selectedPlayer}
        cardColor={cardColor}
        selectedTeamName={selectedTeamName}
      />
    </div>
  );
}