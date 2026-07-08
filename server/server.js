import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import questions from "../shared/questions.js";
import questionsGame2 from "../shared/questionsGame2.js";
import questionsGame3 from "../shared/questionsGame3.js";
import questionsGame4 from "../shared/questionsGame4.js";

const app = express();

app.use(
  cors({
    origin: [
      "https://mayday-game.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://mayday-game.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const rooms = {};

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function startQuestion(code) {

  if (!rooms[code]) return;

  const room = rooms[code];
if (room.game.timer) {
  clearInterval(room.game.timer);
}
  room.game.answers = {};
  room.game.revealed = false;

  room.players.forEach(player => {
    player.answered = false;
  });
io.to(room.host).emit(
  "player-answered",
  room.players.map(player => ({
    name: player.name,
    answered: false,
  }))
);

  let currentQuestions;

switch (room.game.selectedGame) {

  case "game2":
    currentQuestions = questionsGame2;
    break;

  case "game3":
    currentQuestions = questionsGame3;
    break;

    case "game4":
    currentQuestions = questionsGame4;
    break;

  default:
    currentQuestions = questions;
    break;

}

let timer =
  currentQuestions[room.game.currentQuestion].time;

  io.to(code).emit("new-question", {
    question: room.game.currentQuestion,
    timer,
  });

  room.game.timer = setInterval(() => {

    timer--;

    io.to(code).emit("timer-update", timer);

    if (timer <= 0) {

      clearInterval(room.game.timer);

      room.game.revealed = true;

      io.to(code).emit("show-reveal");

    }

  }, 1000);

}

io.on("connection", (socket) => {

  console.log("🟢 Connected:", socket.id);

  // ==========================
  // CREATE ROOM
  // ==========================

  socket.on("create-room", () => {
    
    console.log("CREATE ROOM EVENT");
    
    const code = generateCode();

   rooms[code] = {
  host: socket.id,

  players: [],

  game: {
    started: false,
    selectedGame: "game1",
    currentGame: 0,
    currentQuestion: 0,
    revealed: false,
    answers: {},
    scores: {},
  },
};

    socket.join(code);

    console.log("🏠 Room Created:", code);
    console.log("SEND ROOM CODE:", code);
    socket.emit("room-created", code);

  });

  // ==========================
  // JOIN ROOM
  // ==========================

  socket.on("join-room", ({ code, name }) => {

console.log("JOIN EVENT", code, name);

    if (!rooms[code]) {
      socket.emit("join-error");
      return;
    }

    socket.join(code);

   const oldPlayer = rooms[code].players.find(
  p => p.name.toLowerCase() === name.toLowerCase()
);

if (oldPlayer) {

  oldPlayer.id = socket.id;
  oldPlayer.answered = false;

} else {

  rooms[code].players.push({
    id: socket.id,
    name,
    answered: false,
    score: 0,
  });

} 
    console.log(`👤 ${name} joined ${code}`);

    io.to(rooms[code].host).emit(
      "player-list",
      rooms[code].players.map(player => player.name)
    );

  });

  // ==========================
  // START GAME
  // ==========================

 socket.on("start-game", ({ code, game }) => {

  if (!rooms[code]) return;

  const room = rooms[code];

  room.game.selectedGame = game;

  room.game.started = true;
  room.game.currentQuestion = 0;
  room.game.revealed = false;
  room.game.answers = {};

  room.players.forEach(player => {
    player.answered = false;
  });

  console.log("🎮 Start Game:", code);

  io.to(code).emit("game-started", {
  game: room.game.selectedGame,
});

  startQuestion(code);

});
  

// ==========================
// SUBMIT ANSWER
// ==========================
socket.on("submit-answer", ({ code, answer, timeLeft }) => {

  if (!rooms[code]) return;

  const room = rooms[code];

  if (room.game.answers[socket.id] !== undefined) return;

  room.game.answers[socket.id] = {
    answer,
    timeLeft,
  };

  const player = room.players.find(
    p => p.id === socket.id
  );

  if (player) {

    player.answered = true;

   if (room.game.selectedGame === "game1") {

  const correctAnswer =
    questions[room.game.currentQuestion].answer;

  if (answer === correctAnswer) {

    player.score += Math.max(timeLeft * 100, 100);

  }

}

else if (room.game.selectedGame === "game2") {

  const correctAnswers =
    questionsGame2[
      room.game.currentQuestion
    ].answers;

  const isCorrect =
    correctAnswers.some(

      a =>
        a.toLowerCase() ===
        answer.trim().toLowerCase()

    );

  if (isCorrect) {

    player.score += Math.max(timeLeft * 100, 100);

  }

}

else if (room.game.selectedGame === "game3") {

  const correctAnswer =
    questionsGame3[
      room.game.currentQuestion
    ].answer;

  if (answer === correctAnswer) {

    player.score += Math.max(timeLeft * 100, 100);

  }

}

else if (room.game.selectedGame === "game4") {

  const correctAnswer =
    questionsGame4[
      room.game.currentQuestion
    ].answer;

  if (answer === correctAnswer) {

    player.score += Math.max(timeLeft * 100, 100);

  }

}
  }

  console.log("emit player-answered", room.players);

  io.to(room.host).emit(
    "player-answered",
    room.players.map(player => ({
      name: player.name,
      answered: player.answered,
    }))
  );

  const leaderboard = [...room.players].sort(
    (a, b) => b.score - a.score
  );

  io.to(code).emit(
    "score-update",
    leaderboard.map(player => ({
      name: player.name,
      score: player.score,
    }))
  );

});

// ==========================
// NEXT QUESTION
// ==========================

socket.on("next-question", (code) => {

  if (!rooms[code]) return;

  const room = rooms[code];

  room.game.currentQuestion++;

let totalQuestions;

if (room.game.selectedGame === "game1") {

  totalQuestions = questions.length;

}

else if (room.game.selectedGame === "game2") {

  totalQuestions = questionsGame2.length;

}

else if (room.game.selectedGame === "game3") {

  totalQuestions = questionsGame3.length;

}

else if (room.game.selectedGame === "game4") {

  totalQuestions = questionsGame4.length;

}

else {

  totalQuestions = questionsGame3.length;

}

if (room.game.currentQuestion >= totalQuestions)
   {

    const leaderboard = [...room.players].sort(
      (a, b) => b.score - a.score
    );

    io.to(code).emit(
      "game-finished",
      leaderboard
    );

    return;
  }

  startQuestion(code);

});


// ==========================
// NEXT GAME
// ==========================

socket.on("next-game", (code) => {

  if (!rooms[code]) return;

  const room = rooms[code];

room.game.currentQuestion = 0;
room.game.answers = {};
room.game.revealed = false;

io.to(code).emit("next-game");

startQuestion(code);

});

  // ==========================
  // DISCONNECT
  // ==========================

  socket.on("disconnect", () => {

    console.log("🔴 Disconnected:", socket.id);

    for (const code in rooms) {

      const room = rooms[code];

      room.players = room.players.filter(
        player => player.id !== socket.id
      );

      if (room.host === socket.id) {
        delete rooms[code];
      } else {
        io.to(room.host).emit(
          "player-list",
          room.players.map(player => player.name)
        );
      }

    }

  });
});

 const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
});