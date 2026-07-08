import "../App.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

function Join() {

  const navigate = useNavigate();

  const [code,setCode]=useState(

    localStorage.getItem("roomCode") || ""

);
  const [name, setName] = useState(
    localStorage.getItem("playerName") || ""
  );

  useEffect(() => {

    const handleGameStarted = (data) => {

  console.log("START GAME", data);

  navigate("/" + data.game);

};

    const handleJoinError = () => {
      alert("Game Code not found");
    };

    socket.on("game-started", handleGameStarted);
    socket.on("join-error", handleJoinError);

    return () => {
      socket.off("game-started", handleGameStarted);
      socket.off("join-error", handleJoinError);
    };

  }, [navigate]);

  const joinGame = () => {

    if (!code.trim() || !name.trim()) {
      alert("Please enter Game Code and Name");
      return;
    }

   const roomCode = code.trim();

localStorage.setItem("roomCode",roomCode);
localStorage.setItem("isHost", "false");
localStorage.setItem(
    "playerName",
    name.trim()
);

socket.emit("join-room", {
  code: roomCode,
  name: name.trim(),
});
console.log("JOIN", {
    code: roomCode,
    name: name.trim(),
});
  };

  return (

    <div className="container">

      <div className="logo">
        🎮 MAYDAY GAME
      </div>

      <div className="card">

        <h2>Join Game</h2>

        <input
          placeholder="Enter Game Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <input
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={joinGame}>
          JOIN GAME
        </button>

        <div className="games">

          <div className="gameBox">
            🎭<br />
            WHO'S THAT MIX?
          </div>

          <div className="gameBox">
            🐾<br />
            WILD GUESS
          </div>

          <div className="gameBox">
            📺<br />
            SAY THAT LINE!
          </div>

          <div className="gameBox">
            🌑<br />
            WHO'S THAT SHADOW?
          </div>

        </div>

      </div>

    </div>

  );
}

export default Join;