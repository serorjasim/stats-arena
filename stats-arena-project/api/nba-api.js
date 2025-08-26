import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is running");
});

const FAKE_PLAYERS = [
  {
    id: "1",
    full_name: "LeBron James",
    position: "F",
    average: { points: 27.5, assists: 7.2, rebounds: 8.1 },
  },
  {
    id: "2",
    full_name: "Stephen Curry",
    position: "G",
    average: { points: 29.8, assists: 6.5, rebounds: 5.0 },
  },
  {
    id: "3",
    full_name: "Giannis Antetokounmpo",
    position: "F",
    average: { points: 31.1, assists: 5.5, rebounds: 12.0 },
  },
];

app.get("/api/players", (req, res) => {
  res.json(FAKE_PLAYERS);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

