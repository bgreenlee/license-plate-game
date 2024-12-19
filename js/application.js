"use strict";
import { Words } from "./words.js";

(function () {
  const commonWordset = new Set(Words.common.split(" "));
  const uncommonWordset = new Set(Words.uncommon.split(" "));

  let timer;
  let timeLeft = 60;
  let currentLetters = [];
  let currentLetterString = "";
  let allLetters = [];
  let score = 0;

  const wordInput = document.getElementById("wordInput");
  const submitButton = document.getElementById("submitButton");
  const skipButton = document.getElementById("skipButton");
  const startButton = document.getElementById("startGame");
  const shareButton = document.getElementById("shareButton");
  const copiedResults = document.getElementById("copiedResults");
  const timerDisplay = document.querySelector(".timer");
  const scoreDisplay = document.querySelector(".score");
  const licensePlate = document.querySelector(".license-plate");
  const wordHistory = document.getElementById("wordHistory");
  const gameContainer = document.getElementById("game-container");

  // use our own random number generator so we can seed it (Math.random() can't be seeded)
  // from https://stackoverflow.com/a/47593316/69721
  function splitmix32(a) {
    return function () {
      a |= 0;
      a = (a + 0x9e3779b9) | 0;
      let t = a ^ (a >>> 16);
      t = Math.imul(t, 0x21f0aaad);
      t = t ^ (t >>> 15);
      t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
    };
  }

  function newSeed() {
    return (Math.random() * 2 ** 32) >>> 0;
  }

  let seed = location.hash == "" ? newSeed() : parseInt(location.hash.substring(1), 10);
  let random = splitmix32(seed);

  // regex to match words that contain the given letters in order
  function validWordRegExp(letters, flags = "i") {
    return new RegExp(`[^\\s]*?${letters.join("[^\\s]*?")}[^\\s]*`, flags);
  }

  function generateLicensePlate() {
    let alphabet = Array(26)
      .fill()
      .map((_, i) => String.fromCharCode("A".charCodeAt(0) + i));
    let letters;

    // generate three random letters until we find at least one word containing those letters
    while (true) {
      letters = [...Array(3).keys()].map(() => alphabet[Math.floor(random() * 26)]);

      if (Words.common.match(validWordRegExp(letters))) {
        break;
      }
    }

    currentLetters = letters;
    currentLetterString = letters.join("");
    // Generate 3-4 random numbers
    const numlen = Math.floor(3.5 + random());
    const numbers = Math.floor(random() * Math.pow(10, numlen))
      .toString()
      .padStart(numlen, "0");

    return `${currentLetterString}-${numbers}`;
  }

  function updateTimer() {
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    } else {
      timeLeft--;
    }
  }

  function startGame() {
    if (startButton.innerText == "New Game") {
      let seed = newSeed();
      random = splitmix32(seed);
    }

    timeLeft = 60;
    score = 0;
    wordHistory.innerHTML = "";
    scoreDisplay.textContent = `Score: ${score}`;

    wordInput.value = "";
    wordInput.disabled = false;
    submitButton.disabled = false;
    skipButton.disabled = false;
    startButton.disabled = true;
    shareButton.style.display = "none";

    showNewPlate();
    wordInput.focus();
    timer = setInterval(updateTimer, 1000);
  }

  function endGame() {
    clearInterval(timer);
    wordInput.disabled = true;
    submitButton.disabled = true;
    skipButton.disabled = true;
    startButton.innerText = "New Game";
    startButton.disabled = false;
    shareButton.style.display = "inline-block";
    timerDisplay.textContent = "Game Over!";

    // Add to history
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    let validWords = getValidWords(currentLetters);
    let helpText = `Answer(s): ${validWords[0]}${
      validWords.length > 1 ? ` and ${validWords.length - 1} more.` : ""
    }`;
    historyItem.textContent = `${currentLetterString}: <TIME> - ${helpText}`;
    wordHistory.insertBefore(historyItem, wordHistory.firstChild);
  }

  function showNewPlate() {
    const plate = generateLicensePlate();
    licensePlate.textContent = plate;
    allLetters.push(currentLetterString);
  }

  function checkWord(word, letters) {
    return (
      word.match(validWordRegExp(letters)) &&
      (commonWordset.has(word.toLowerCase()) || uncommonWordset.has(word.toLowerCase()))
    );
  }

  function calculatePoints(word) {
    return Math.max(20 - word.length * 2, 1); // Shorter words get more points
  }

  function getValidWords(letters) {
    let allWordsRE = validWordRegExp(letters, "ig");
    let matchingWords = Words.common.match(allWordsRE).concat(Words.uncommon.match(allWordsRE));
    matchingWords.sort((a, b) => a.length > b.length);
    return matchingWords;
  }

  // Submit
  submitButton.addEventListener("click", () => {
    const word = wordInput.value.trim();

    if (!checkWord(word, currentLetters)) {
      // add the "wrong" class to the game-container briefly
      gameContainer.classList.add("wrong");
      setTimeout(() => {
        gameContainer.classList.remove("wrong");
      }, 100);
      wordInput.value = "";
    } else {
      gameContainer.classList.add("correct");
      setTimeout(() => {
        gameContainer.classList.remove("correct");
      }, 100);

      const points = calculatePoints(word);
      score += points;
      scoreDisplay.textContent = `Score: ${score}`;

      // Add to history
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";
      let validWords = getValidWords(currentLetters);
      let helpText = validWords[0].length < word.length ? ` - Better: ${validWords[0]}` : "";
      historyItem.textContent = `${currentLetterString}: ${word} (+${points} points)${helpText}`;
      wordHistory.insertBefore(historyItem, wordHistory.firstChild);

      // Show new plate
      showNewPlate();
      wordInput.focus();
      wordInput.value = "";
    }
  });

  // Skip
  skipButton.addEventListener("click", () => {
    let skipPenalty = 1;
    score -= skipPenalty;
    scoreDisplay.textContent = `Score: ${score}`;

    // Add to history
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    let validWords = getValidWords(currentLetters);
    let helpText = `Answer(s): ${validWords[0]}${
      validWords.length > 1 ? ` and ${validWords.length - 1} more.` : ""
    }`;
    historyItem.textContent = `${currentLetterString}: <SKIP> (-${skipPenalty} points) - ${helpText}`;
    wordHistory.insertBefore(historyItem, wordHistory.firstChild);

    showNewPlate();
    wordInput.focus();
    wordInput.value = "";
  });

  // Hotkeys
  wordInput.addEventListener("keyup", (e) => {
    switch (e.key) {
      case "Enter":
        submitButton.click();
        break;
      case "Escape":
        skipButton.click();
        break;
    }
  });

  // Start game
  startButton.addEventListener("click", startGame);

  // Share
  shareButton.addEventListener("click", () => {
    // copy results to clipboard
    const text = `I got ${score} points in License Plate Game! Try it yourself at https://licenseplategame.fun#${seed}`;
    try {
      navigator.clipboard.writeText(text);
      copiedResults.style.display = "block";
      setTimeout(() => {
        copiedResults.style.display = "none";
      }, 3000);
    } catch (error) {
      console.error(error.message);
    }
  });
})();
