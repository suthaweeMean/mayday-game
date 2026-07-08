import "../App.css";
import { useEffect, useState } from "react";
import questions from "../../shared/questionsGame4";
import socket from "../socket";

function Game4() {

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

  const [selectedChoice, setSelectedChoice] =
    useState(null);

  const [locked, setLocked] =
    useState(false);

  const [revealed, setRevealed] =
    useState(false);

  const [leaderboard, setLeaderboard] =
    useState([]);

  const [answeredPlayers, setAnsweredPlayers] =
    useState([]);

  const [gameFinished, setGameFinished] =
    useState(false);

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

  useEffect(() => {

    const handleQuestion = (data) => {

      setCurrentQuestion(
        data.question
      );

      setTimeLeft(
        data.timer
      );

      setSelectedChoice(null);

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

    useEffect(() => {

    const handleFinished = (scores) => {

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

    const selectChoice = (index) => {

    if (locked) return;

    setSelectedChoice(index);

    setLocked(true);

    socket.emit(
      "submit-answer",
      {

        code: roomCode,

        answer: index,

        timeLeft,

      }
    );

  };

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
            🏆 GAME 4 FINISHED
          </h1>

          <h2
            style={{
              textAlign: "center",
              marginTop: 15,
            }}
          >
            Final Leaderboard
          </h2>

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
    fontSize: "clamp(24px, 4vw, 36px)",
    whiteSpace: "nowrap",
  }}
>
  👤 WHO'S THAT SHADOW?
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
              src={questions[currentQuestion].questionImage}
              alt=""
              style={{
                width: "100%",
                borderRadius: "15px",
                marginTop: "20px",
              }}
            />

          ) : (

            <img
              src={questions[currentQuestion].revealImage}
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
              ✅ {questions[currentQuestion].choices[
                questions[currentQuestion].answer
              ]}
            </h2>

          )}

         

          {revealed && (

            <div
              style={{
                marginTop: 30,
              }}
            >

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

            <div
              style={{
                marginTop: 20,
              }}
            >

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

          {!isHost && (

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                marginTop: "25px",
              }}
            >

              {questions[currentQuestion].choices.map(

                (choice, index) => (

                  <button
                    key={index}
                    disabled={locked || revealed}
                    onClick={() => selectChoice(index)}
                    style={{
                      background:
                        revealed
                          ? index === questions[currentQuestion].answer
                             ? "#22c55e"   // เขียว = คำตอบถูก
                            : selectedChoice === index
                            ? "#3b82f6"   // น้ำเงิน = คำตอบที่เลือก
                            : "#ef4444"   // แดง = ข้ออื่น
                            : selectedChoice === index
                            ? "#3b82f6"
                            : "#ef4444",

                        opacity:
                            locked && !revealed && selectedChoice !== index
                                ? 0.7
                                 : 1,

                       transition: ".25s",
  
                        display: "block",
                        width: "100%",
                         textAlign: "left",
                        fontSize: "17px",
                        padding: "16px 20px",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                    }}
                  >

                    {choice}

                  </button>

                )

              )}

            </div>

          )}

        </div>

      )}

    </div>

  );

}

export default Game4;