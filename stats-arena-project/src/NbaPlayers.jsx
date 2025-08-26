import React, { useEffect, useState } from "react";

export default function NbaPlayers() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("http://localhost:5000/api/players");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players list:", error);
      }
    }

    fetchPlayers();
  }, []);

  return (
    <div>
      <h1>NBA Players</h1>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.full_name} – {player.position} – {player.average.points || "N/A"}
          </li>
        ))}
      </ul>
    </div>
  );
}
