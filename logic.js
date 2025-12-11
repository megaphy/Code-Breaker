/* ========== GLOBAL VARIABLES ========== */

let secretCode = [];
let attempts = [];
let currentAttempt = 0;
const maxAttempts = 10;
let maxSequential = 0;
let gameOver = false;
let playerName = "";

/* ========== MAIN GAME LOGIC ========== */

/* --------- HANDLE GUESS SUBMISSION --------- */
function handleCheckGuess() {
  if (gameOver) {
    return;
  }
 
  let inputs = document.querySelectorAll(".digit-input");
  let guess = [];

  for (let i = 0; i < inputs.length; i++) {
  let numbers = inputs[i].value;
  if (numbers === "") {
    showMessage("Please enter all 4 digits.");
    return;
  }
  let num = parseInt(numbers, 10);
  guess.push(num);
}
  let result = checkGuess(guess);
  const { black, white } = result;
  attempts.push({
    guess: guess,
    black: black,
    white: white   
  });
  
  currentAttempt++;
  if (result.sequential > maxSequential) {
    maxSequential = result.sequential;
  }

  updateBoard();

  if (result.black === 4) {
    gameOver = true;
    showMessage("You cracked the code in " + currentAttempt + " tries! Press Reset to play again.");
    disableInputs();
    endGameScoring();
  } else if (currentAttempt >= maxAttempts) {
    gameOver = true;
    showMessage("No more attempts. Code was: " + secretCode.join("") + ". Press Reset to play again.");
    disableInputs();
    endGameScoring();
  } else {
    clearInputs();
    showMessage(
      "Black pegs = " + result.black +
      ", White pegs = " + result.white +
      ". Attempts left: " + (maxAttempts - currentAttempt)
    );
  }
}

/* --------- COMPARE GUESS WITH SECRET CODE --------- */
function checkGuess(playerGuess) {
  let black = 0;
  let white = 0;
  
  let codeCopy = secretCode.slice();
  let pGuessCopy = playerGuess.slice();

  // check for black pegs
  for (let i = 0; i < 4; i++) {
    if (pGuessCopy[i] === codeCopy[i]) {
      black++;
      pGuessCopy[i] = null;
      codeCopy[i] = null;
    }
  }

  // check for white pegs
  for (let i = 0; i < 4; i++) {
    if (pGuessCopy[i] !== null) {
      let index = codeCopy.indexOf(pGuessCopy[i]);
      if (index !== -1) {
        white++;
        codeCopy[index] = null;
      }
    }
  }

  let sequential = 0;
  for (let k = 0; k < 4; k++) {
    if (playerGuess[k] === secretCode[k]) {
      sequential++;
    } else {
      break;
    }
  }

  return { black: black, white: white, sequential: sequential };
}

/* ========== UTILITY FUNCTIONS ========== */

/* --------- GENERATE A RANDOM 4-DIGIT CODE --------- */
function generateCode() {
  secretCode = [];
  for (let i = 0; i < 4; i++) {
    let digit = Math.floor(Math.random() * 10);
    secretCode.push(digit);
  }
}

/* --------- CLEAR INPUTS --------- */
function clearInputs() {
  let inputs = document.querySelectorAll(".digit-input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
    inputs[i].disabled = false;
  }
  document.getElementById("checkBtn").disabled = false;
}

/* --------- DISABLE INPUTS WHEN GAME IS OVER --------- */
function disableInputs() {
  let inputs = document.querySelectorAll(".digit-input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
    inputs[i].disabled = true;
  }
  document.getElementById("checkBtn").disabled = true;
}

/* --------- MESSAGE FUNCTION --------- */
function showMessage(text) {
  document.getElementById("message").textContent = text;
}

/* --------- REDRAW PREVIOUS GUESSES ON THE BOARD --------- */
function updateBoard() {
  let historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";

  for (let i = 0; i < attempts.length; i++) {
    let row = document.createElement("div");
    row.className = "history-row";

    let digitsDiv = document.createElement("div");
    digitsDiv.className = "history-digits";

    for (let j = 0; j < 4; j++) {
      let box = document.createElement("div");
      box.className = "history-box";
      box.textContent = attempts[i].guess[j];
      digitsDiv.appendChild(box);
    }
    let pegsDiv = document.createElement("div");
    pegsDiv.className = "pegs";

    // adds black pegs
    for (let b = 0; b < attempts[i].black; b++) {
      let pegBlack = document.createElement("div");
      pegBlack.className = "peg black";
      pegsDiv.appendChild(pegBlack);
    }
    // adds white pegs
    for (let w = 0; w < attempts[i].white; w++) {
      let pegWhite = document.createElement("div");
      pegWhite.className = "peg white";
      pegsDiv.appendChild(pegWhite);
    }
    row.appendChild(digitsDiv);
    row.appendChild(pegsDiv);
    historyDiv.appendChild(row);
  }
}

/* ========== GAME STATE & SCORING ========== */

/* --------- START A BRAND-NEW GAME --------- */
function newGame() {
  generateCode();
  attempts = [];
  currentAttempt = 0;
  maxSequential = 0;
  gameOver = false;
  clearInputs();
  updateBoard();
  showMessage("New code generated. You have 10 attempts.");
}

/* --------- SAVE GAME STATE --------- */
function saveGame() {
  let data = {
    playerName: playerName,
    secretCode: secretCode,
    attempts: attempts,
    currentAttempt: currentAttempt,
    maxSequential: maxSequential,
    gameOver: gameOver
  };
  localStorage.setItem("codeBreakerSave", JSON.stringify(data));
}

/* --------- LOAD GAME STATE --------- */
function loadGameForPlayer() {

  let saveData = localStorage.getItem("codeBreakerSave");

  if (!saveData) {
    newGame();
    return;
  }

  let data = JSON.parse(saveData);

  if (data.playerName !== playerName) {
    newGame();
    return;
  }
 
  secretCode = data.secretCode || [];
  attempts = data.attempts || [];
  currentAttempt = data.currentAttempt || 0;
  maxSequential = data.maxSequential || 0;
  gameOver = data.gameOver || false;

  updateBoard();

  if (!gameOver) {
    showMessage(
      "Loaded saved game. Attempts left: " +
      (maxAttempts - currentAttempt)
    );
  } else {
    showMessage(
      "Press Reset for a new game."
    );
  }
}

/* --------- LOADS HIGH SCORES FROM LOCAL STORAGE --------- */
function loadScores() {
  let scoreData = localStorage.getItem("codeBreakerScores");

  if (!scoreData) {
    return [];
  }
  return JSON.parse(scoreData);
}

/* --------- RENDER HIGH SCORE TABLE --------- */
function renderScoreTable() {

  let scores = loadScores();
  let tbody = document.getElementById("scoreBody");
  tbody.innerHTML = "";

  for (let i = 0; i < scores.length; i++) {
    let tr = document.createElement("tr");

    let tdRank = document.createElement("td");
    tdRank.textContent = i + 1;

    let tdName = document.createElement("td");
    tdName.textContent = scores[i].name;

    let tdScore = document.createElement("td");
    tdScore.textContent = scores[i].score;

    tr.appendChild(tdRank);
    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    tbody.appendChild(tr);
  }
  updateClearButton();
}

/* --------- SCORING + SAVE TO HIGH-SCORE TABLE --------- */
function endGameScoring() {

  let score = maxSequential * 100 - (currentAttempt - 1) * 10;
  if (score < 0) {
    score = 0;
  }
  let scores = loadScores();
  scores.push({ name: playerName, score: score });
  scores.sort(function (a, b) {
    return b.score - a.score;
  });

  localStorage.setItem("codeBreakerScores", JSON.stringify(scores));
  renderScoreTable();
}

/* --------- CLEAR SCOREBOARD --------- */
function clearScoreboard() {

  localStorage.removeItem("codeBreakerScores");

  renderScoreTable();
  updateClearButton();
}

/* --------- UPDATE CLEAR BUTTON STATE --------- */
function updateClearButton() {

  let scores = loadScores();
  let clearBtn = document.getElementById("clearScoreBtn");
  if (clearBtn) {
    clearBtn.disabled = scores.length === 0;
  }
}

/* ========== INITIALIZATION ========== */
window.onload = function () {

  document.getElementById("startBtn").onclick = function () {

    let input = document.getElementById("playerNameInput").value.trim();
    if (input === "") {
      document.getElementById("nameMessage").textContent = "Please enter a name.";
      return;
    }
    playerName = input;
    document.getElementById("nameScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";

    loadGameForPlayer();
    renderScoreTable();
  };

  document.getElementById("checkBtn").onclick = handleCheckGuess;
  document.getElementById("resetBtn").onclick = function () {
    newGame();
  };

  document.getElementById("saveBtn").onclick = function () {
    saveGame();
    showMessage("Game saved.");
  };

  document.getElementById("clearScoreBtn").onclick = function () {
    clearScoreboard();
    showMessage("Scoreboard cleared.");
  };
};
