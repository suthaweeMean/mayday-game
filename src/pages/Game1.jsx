import "../App.css";
import { useEffect, useState } from "react";
import questions from "../../shared/questions.js";
import socket from "../socket.js";

function Game1() {

 const [count, setCount] = useState(3);

const [started, setStarted] = useState(false);

const [currentQuestion, setCurrentQuestion] = useState(0);

const [timeLeft, setTimeLeft] = useState(
  questions[0].time
);

const [selectedChoice, setSelectedChoice] = useState(null);

const [locked, setLocked] = useState(false);

const [revealed, setRevealed] = useState(false);

const [leaderboard, setLeaderboard] = useState([]);
const [gameFinished, setGameFinished] = useState(false);
const [answeredPlayers, setAnsweredPlayers] = useState([]);
const roomCode = localStorage.getItem("roomCode");
const isHost =
  localStorage.getItem("isHost") === "true";


useEffect(() => {

    const handleTimer = (time) => {

        setTimeLeft(time);

    };

    socket.on("timer-update", handleTimer);

    return () => {

        socket.off("timer-update", handleTimer);

    };

}, []);
useEffect(() => {
    const handlePlayerAnswered = (players) => {

        console.log("PLAYER ANSWERED", players);

        setAnsweredPlayers(players);

    };

    socket.on("player-answered", handlePlayerAnswered);

    return () => {

        socket.off("player-answered", handlePlayerAnswered);

    };

}, []);
useEffect(() => {

    const handleReveal = () => {

        setRevealed(true);

    };

    socket.on("show-reveal", handleReveal);

    return () => {

        socket.off("show-reveal", handleReveal);

    };

}, []);

useEffect(() => {

    const handleScore = (scores) => {

        setLeaderboard(scores);

    };

    socket.on("score-update", handleScore);

    return () => {

        socket.off("score-update", handleScore);

    };

}, []);

useEffect(() => {

    const handleFinished = (scores) => {
 console.log("GAME FINISHED", scores);
        setLeaderboard(scores);

        setGameFinished(true);

    };

    socket.on("game-finished", handleFinished);

    return () => {

        socket.off("game-finished", handleFinished);

    };

}, []);


useEffect(() => {

    const handleQuestion = (data) => {

        setCurrentQuestion(data.question);
        setTimeLeft(data.timer);

        setLocked(false);
        setSelectedChoice(null);
        setRevealed(false);

    };

    socket.on("new-question", handleQuestion);

    return () => {

        socket.off("new-question", handleQuestion);

    };

}, []);

  // Countdown
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

  // Question Timer
  const nextQuestion = () => {

    socket.emit(
        "next-question",
        roomCode
    );

};

  const selectChoice = (index) => {
 console.log("CLICK");

    console.log("ROOM =", roomCode);

    console.log("CONNECTED =", socket.connected);

    if (locked) return;

    setSelectedChoice(index);

    setLocked(true);

    socket.emit("submit-answer", {
    code: roomCode,
    answer: index,
    timeLeft,
});
  console.log("EMIT");
};
if (gameFinished) {

  return (

    <div className="container">

      <div className="card">

        <h1
        style={{
    textAlign: "center",
    color: "#ef4444",
    fontSize: "clamp(25px, 7vw, 34px)",
    lineHeight: "1.3",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }}
        >
          🏆 GAME 1 FINISHED
        </h1>

        <h2
          style={{
            textAlign:"center",
            marginTop:15
          }}
        >
          Final Leaderboard
        </h2>

        {leaderboard.map((player,index)=>(

          <div
            key={index}
            style={{
              padding:15,
              marginBottom:10,
              background:"#f3f4f6",
              borderRadius:10
            }}
          >

            {index+1}. {player.name}

            <span style={{float:"right"}}>

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
              textAlign: "center",
              fontSize: "70px",
              color: "#ef4444"
            }}
          >
            {count}
          </h1>

          <h2 style={{ textAlign: "center" }}>
            Game is Starting...
          </h2>

        </div>

      ) : (

        <div className="card">

          <h1
  style={{
    textAlign: "center",
    color: "#ef4444",
    fontSize: "clamp(28px, 5vw, 48px)",
    whiteSpace: "nowrap",
  }}
>
  🎭 WHO'S THAT MIX?
</h1>

          <h2
            style={{
              textAlign: "center",
              marginTop: "20px"
            }}
          >
            Question {currentQuestion + 1}
          </h2>

          <h2
            style={{
              textAlign: "center",
              color: "#ef4444",
              marginTop: "10px"
            }}
          >
            ⏰ {timeLeft}s
          </h2>

          {!revealed ? (

  <img
    src={questions[currentQuestion].questionImage}
    alt="Question"
    style={{
      width: "100%",
      borderRadius: "15px",
      marginTop: "20px"
    }}
  />

) : (

<div
  style={{
    display: "flex",
    gap: "20px",
    marginTop: "20px",
    justifyContent: "center"
  }}
>

  <img
    src={questions[currentQuestion].revealLeft}
    alt=""
    style={{
      width: "28%",
      borderRadius: "15px"
    }}
  />

  <img
    src={questions[currentQuestion].questionImage}
    alt=""
    style={{
      width: "30%",
      borderRadius: "15px",
      border: "3px solid #ef4444"
    }}
  />

  <img
    src={questions[currentQuestion].revealRight}
    alt=""
    style={{
      width: "28%",
      borderRadius: "15px"
    }}
  />

</div>

)}

  


{revealed && (

  <h2
    style={{
      color: "#22c55e",
      marginTop: "20px",
      textAlign: "center"
    }}
  >
    ✅ {questions[currentQuestion].choices[questions[currentQuestion].answer]}
  </h2>

)}
{revealed && (

<div
    style={{
        marginTop:30
    }}
>

<h2>Leaderboard</h2>

{leaderboard.map((player,index)=>(

<div
key={index}
style={{
padding:10,
marginBottom:10,
background:"#f3f4f6",
borderRadius:10
}}
>

{index+1}. {player.name}

<span
style={{
float:"right"
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
marginTop:20
}}
>

NEXT QUESTION ▶

</button>

)}
{revealed && !isHost && !gameFinished && (

<h3
style={{
textAlign:"center",
marginTop:20,
color:"#6b7280"
}}
>

Waiting for Host...

</h3>

)}
         {isHost && (

<div
    style={{
        marginTop:20
    }}
>

<h2>Players Answered</h2>

<div>

{answeredPlayers.length === 0 ? (

    <p>Waiting for players...</p>

) : (

    answeredPlayers.map((player,index)=>(

        <div
            key={index}
            style={{
                padding:10,
                marginBottom:10,
                borderRadius:10,
                background:"#f3f4f6",
                fontWeight:"bold"
            }}
        >

            {player.answered ? "🟢" : "⚪"} {player.name}

        </div>

    ))

)}

</div>

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

  {questions[currentQuestion].choices.map((choice, index) => (

   <button
  key={index}
  disabled={locked}
  onClick={() => selectChoice(index)}
  style={{
    background:
  revealed
    ? index === questions[currentQuestion].answer
      ? "#22c55e" // คำตอบถูก = เขียว
      : selectedChoice === index
      ? "#3b82f6" // ตัวเองเลือก = น้ำเงิน
      : "#ef4444" // ข้ออื่น = แดง
    : selectedChoice === index
      ? "#3b82f6"
      : "#ef4444",
   opacity:
  locked && !revealed && selectedChoice !== index
    ? 0.7
    : 1,

    transition: ".25s",

    textAlign: "left",
    fontSize: "17px",
    padding: "16px 20px",
    whiteSpace: "normal",
    wordBreak: "break-word",
  }}
>
   {String.fromCharCode(65 + index)}. {choice}
    </button>

  ))}

</div>
)}
        </div>

      )}

    </div>

  );

}

export default Game1;