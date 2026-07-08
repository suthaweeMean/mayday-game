import "../App.css";
import { useEffect, useState } from "react";
import questions from "../../shared/questionsGame2";
import socket from "../socket";

function Game2() {

  const roomCode = localStorage.getItem("roomCode");

  const isHost =
    localStorage.getItem("isHost") === "true";

  const [count, setCount] = useState(3);

  const [started, setStarted] = useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [timeLeft, setTimeLeft] = useState(
    questions[0].time
  );

  const [answer, setAnswer] = useState("");

  const [locked, setLocked] = useState(false);

  const [revealed, setRevealed] =
    useState(false);

  const [leaderboard, setLeaderboard] =
    useState([]);

  const [answeredPlayers, setAnsweredPlayers] =
    useState([]);

  const [gameFinished, setGameFinished] =
    useState(false);

  // -----------------------------
  // Timer
  // -----------------------------

  useEffect(() => {

    const handleTimer = (time) => {

      setTimeLeft(time);

    };

    socket.on(
      "timer-update",
      handleTimer
    );

    return () => {

      socket.off(
        "timer-update",
        handleTimer
      );

    };

  }, []);

  // -----------------------------
  // New Question
  // -----------------------------

  useEffect(() => {

    const handleQuestion = (data) => {

      setCurrentQuestion(
        data.question
      );

      setTimeLeft(
        data.timer
      );

      setAnswer("");

      setLocked(false);

      setRevealed(false);

    };

    socket.on(
      "new-question",
      handleQuestion
    );

    return () => {

      socket.off(
        "new-question",
        handleQuestion
      );

    };

  }, []);

  // -----------------------------
  // Reveal
  // -----------------------------

  useEffect(() => {

    const handleReveal = () => {

      setRevealed(true);

    };

    socket.on(
      "show-reveal",
      handleReveal
    );

    return () => {

      socket.off(
        "show-reveal",
        handleReveal
      );

    };

  }, []);

  // -----------------------------
  // Score
  // -----------------------------

  useEffect(() => {

    const handleScore = (scores) => {

      setLeaderboard(scores);

    };

    socket.on(
      "score-update",
      handleScore
    );

    return () => {

      socket.off(
        "score-update",
        handleScore
      );

    };

  }, []);

  // -----------------------------
  // Finished
  // -----------------------------

  useEffect(() => {

    const handleFinished = (scores) => {
console.log("GAME FINISHED EVENT", isHost, scores);
      setLeaderboard(scores);

      setGameFinished(true);

    };

    socket.on(
      "game-finished",
      handleFinished
    );

    return () => {

      socket.off(
        "game-finished",
        handleFinished
      );

    };

  }, []);

  // -----------------------------
  // Players Answered
  // -----------------------------

  useEffect(() => {

    const handleAnswered = (players) => {

      setAnsweredPlayers(players);

    };

    socket.on(
      "player-answered",
      handleAnswered
    );

    return () => {

      socket.off(
        "player-answered",
        handleAnswered
      );

    };

  }, []);

  // -----------------------------
  // Countdown
  // -----------------------------

  useEffect(() => {

    const timer = setInterval(() => {

      setCount((prev) => {

        if (prev === 1) {

          clearInterval(timer);

          setStarted(true);

          return 0;

        }

        return prev - 1;

      });

    }, 1000);

    return () => clearInterval(timer);

  }, []);

  // -----------------------------
  // Submit
  // -----------------------------

  const submitAnswer = () => {

    if (locked) return;

    if (!answer.trim()) return;

    setLocked(true);

    socket.emit(
      "submit-answer",
      {

        code: roomCode,

        answer: answer.trim(),

        timeLeft,

      }
    );

  };

  // -----------------------------
  // Next Question
  // -----------------------------

  const nextQuestion = () => {

    socket.emit(
      "next-question",
      roomCode
    );

  };
    // -----------------------------
  // UI
  // -----------------------------

  if (gameFinished) {

    return (

      <div className="container">

        <div className="card">

          <h1
            style={{
              textAlign: "center",
              color: "#ef4444",
              fontSize: "28px",
              fontWeight: "700",
    whiteSpace: "nowrap",
  }}
          >
            🏆 GAME 2 FINISHED
          </h1>

          <h2>Final Leaderboard</h2>

          {leaderboard.map((player, index) => (

            <div
              key={index}
              style={{
                padding: 15,
                marginBottom: 10,
                background: "#f3f4f6",
                borderRadius: 10,
              }}
            >

              {index + 1}. {player.name}

              <span
                style={{
                  float: "right",
                }}
              >
                {player.score}
              </span>

            </div>

          ))}
          <button
  onClick={() => {

    if (isHost) {

      localStorage.removeItem("roomCode");

      window.location.href = "/host";

    } else {

      localStorage.clear();

      window.location.href = "/";

    }

  }}

  style={{
    marginTop: 20,
    background: "#3b82f6",
  }}
>

  {isHost ? "🏠 NEW GAME" : "🏠 BACK TO JOIN"}

</button>

        </div>

      </div>

    );

  }

  return (

    <div className="container">

      {!started ? (

        <div className="card">

          <h1
            style={{
              fontSize: "70px",
              color: "#ef4444",
              textAlign: "center",
            }}
          >
            {count}
          </h1>

          <h2
            style={{
              textAlign: "center",
            }}
          >
            Game is Starting...
          </h2>

        </div>

      ) : (

        <div className="card">

          <h1
            style={{
              textAlign: "center",
              color: "#ef4444",
            }}
          >
            🐾 WILD GUESS
          </h1>

          <h2
            style={{
              textAlign: "center",
            }}
          >
            Question {currentQuestion + 1}
          </h2>

          <h2
            style={{
              textAlign: "center",
              color: "#ef4444",
            }}
          >
            ⏰ {timeLeft}s
          </h2>

          {!revealed ? (

            <img
              src={
                questions[currentQuestion]
                  .questionImage
              }
              alt=""
              style={{
                width: "100%",
                borderRadius: "15px",
                marginTop: "20px",
              }}
            />

          ) : (

            <img
              src={
                questions[currentQuestion]
                  .revealImage
              }
              alt=""
              style={{
                width: "70%",
                borderRadius: "15px",
                marginTop: "20px",
              }}
            />

          )}
                    {revealed && (

            <h2
              style={{
                color: "#22c55e",
                marginTop: "20px",
                textAlign: "center",
              }}
            >
              ✅ {questions[currentQuestion].answers[0]}
            </h2>

          )}

          {revealed && (

            <div style={{ marginTop: 30 }}>

              <h2>Leaderboard</h2>

              {leaderboard.map((player, index) => (

                <div
                  key={index}
                  style={{
                    padding: 10,
                    marginBottom: 10,
                    background: "#f3f4f6",
                    borderRadius: 10,
                  }}
                >

                  {index + 1}. {player.name}

                  <span
                    style={{
                      float: "right",
                    }}
                  >
                    {player.score}
                  </span>

                </div>

              ))}

            </div>

          )}

          {revealed && isHost && !gameFinished && (

            <button
              onClick={nextQuestion}
              style={{
                marginTop: 20,
              }}
            >
              NEXT QUESTION ▶
            </button>

          )}

          {revealed && !isHost && !gameFinished && (

            <h3
              style={{
                textAlign: "center",
                marginTop: 20,
                color: "#6b7280",
              }}
            >
              Waiting for Host...
            </h3>

          )}

          {isHost && (

            <div style={{ marginTop: 20 }}>

              <h2>Players Answered</h2>

              {answeredPlayers.length === 0 ? (

                <p>Waiting for players...</p>

              ) : (

                answeredPlayers.map((player, index) => (

                  <div
                    key={index}
                    style={{
                      padding: 10,
                      marginBottom: 10,
                      borderRadius: 10,
                      background: "#f3f4f6",
                      fontWeight: "bold",
                    }}
                  >

                    {player.answered ? "🟢" : "⚪"} {player.name}

                  </div>

                ))

              )}

            </div>

          )}

          {!isHost && !revealed && (

            <div style={{ marginTop: "30px" }}>

              <input
                type="text"
                placeholder="Type your answer..."
                value={answer}
                disabled={locked}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
              />

              <button
                disabled={locked}
                onClick={submitAnswer}
                style={{
                  marginTop: 15,
                }}
              >
                SUBMIT
              </button>

            </div>

          )}

        </div>

      )}

    </div>

  );

}

export default Game2;