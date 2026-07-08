import "../App.css";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../socket";

function Host() {

  const navigate = useNavigate();
  const location = useLocation();
  const [gameCode, setGameCode] = useState("------");
  const [players, setPlayers] = useState([]);
   const [selectedGame, setSelectedGame] = useState(() => {

  if (location.pathname.includes("game2")) return "game2";

  if (location.pathname.includes("game3")) return "game3";

  if (location.pathname.includes("game4")) return "game4";

  return "game1";

});

  useEffect(() => {

    const handleConnect = () => {
      socket.emit("create-room");
    };

    const handleRoomCreated = (code) => {
      setGameCode(code);
    };

    const handlePlayerList = (list) => {
      setPlayers(list);
    };

    const handleGameStarted = (data) => {

  console.log("GAME STARTED", data);

  navigate("/" + data.game);

};

    socket.on("connect", handleConnect);

    if (socket.connected) {
      handleConnect();
    }

    socket.on("room-created", handleRoomCreated);
    socket.on("player-list", handlePlayerList);
    socket.on("game-started", handleGameStarted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("room-created", handleRoomCreated);
      socket.off("player-list", handlePlayerList);
      socket.off("game-started", handleGameStarted);
    };

  }, [navigate])
  ;
const startGame = () => {

  localStorage.setItem("roomCode", gameCode);

  localStorage.setItem("isHost", "true");

  socket.emit("start-game", {

    code: gameCode,

    game: selectedGame,

  });

};
 

  return (
    <div className="container">

      <div className="logo">

        <p
          style={{
            color: "#444",
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "10px"
          }}
        >
          Enter this Game Code
        </p>

        <h1>JOIN MAYDAY GAME</h1>

      </div>

      <div className="card">
<h2>Select Game</h2>

<select

  value={selectedGame}

  onChange={(e) =>

    setSelectedGame(e.target.value)

  }

  style={{

    width: "100%",

    padding: "12px",

    marginBottom: "20px",

    borderRadius: "10px",

    fontSize: "18px",

  }}

>

  <option value="game1">

    🎭 WHO'S THAT MIX?

  </option>

  <option value="game2">

    🐾 WILD GUESS

  </option>

  <option value="game3">

    🎬 SAY THAT LINE!

  </option>

  <option value="game4">

    👤 WHO'S THAT SHADOW?

  </option>

</select>
        <h2>Game Code</h2>

        <div className="gameCodeBox">
          {gameCode}
        </div>

        <button onClick={startGame}>
          START GAME
        </button>

        <h3
          style={{
            marginTop: "35px",
            marginBottom: "15px",
            textAlign: "center"
          }}
        >
          Players ({players.length})
        </h3>

        <div className="playersList">

          {players.length === 0 ? (

            <p style={{ textAlign: "center" }}>
              Waiting for players...
            </p>

          ) : (

            players.map((player, index) => (

              <div className="playerItem" key={index}>
                👤 {player}
              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default Host;