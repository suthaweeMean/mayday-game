import { useNavigate } from "react-router-dom";

function HostMenu() {

  const navigate = useNavigate();

  return (
    <div className="container">

      <div className="card">

        <h1
          style={{
            color: "#ef4444",
            textAlign: "center",
          }}
        >
          MAYDAY GAME
        </h1>

        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Choose a Game
        </h2>

        <button
          onClick={() => navigate("/host/game1")}
          style={{ marginBottom: "15px" }}
        >
          🎭 WHO'S THAT MIX?
        </button>

        <button
          onClick={() => navigate("/host/game2")}
          style={{ marginBottom: "15px" }}
        >
          🐾 WILD GUESS
        </button>

        <button
          onClick={() => navigate("/host/game3")}
          style={{ marginBottom: "15px" }}
        >
          🎬 SAY THAT LINE!
        </button>

        <button
          onClick={() => navigate("/host/game4")}
        >
          👤 WHO'S THAT SHADOW?
        </button>

      </div>

    </div>
  );

}

export default HostMenu;