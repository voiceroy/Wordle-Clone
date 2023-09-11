const letters = document.querySelectorAll(".letter"); // Array of letters
const loadingDiv = document.querySelector(".indicator");
const loadingSymbols = document.querySelector(".dot");

const MAX_LENGTH = 5;
const MAX_ROUNDS = 5;

let row = 0;
let guess = "";
let word;
let wordArray;

let done = false;
let isLoading;

init();

async function init() {
    isLoading = true;
    setLoading(isLoading);

    // Get today's word
    word = await getWord();
    wordArray = word.split("");
    wordCount = getCount(word);

    isLoading = false;
    setLoading(isLoading);

    document.addEventListener("keydown", function handleKeyPress(InputEvent) {
        if (done || isLoading) {
            return; // do nothing
        }

        const action = InputEvent.key;

        if (action === "Enter") {
            submit();
        } else if (action === "Backspace") {
            backspace();
        } else if (isLetter(action)) {
            inputLetter(action.toUpperCase());
        } else {
            // do nothing
        }
    });
}

async function getWord() {
    const promise = await fetch("https://words.dev-apis.com/word-of-the-day");
    const json = await promise.json();
    return json.word.toUpperCase();
}

function setLoading(isLoading) {
    loadingDiv.classList.toggle("hidden", !isLoading);
    loadingSymbols.classList.toggle("upndowndot", isLoading);
}

function isLetter(key) {
    return /^[a-zA-Z]$/.test(key);
}

function inputLetter(letter) {
    if (guess.length < MAX_LENGTH) {
        guess += letter;
        letters[5 * row + guess.length - 1].innerText = letter; // Emulate a 6x5 grid
    } else {
        // do nothing
    }
}

async function submit() {
    if (guess.length != MAX_LENGTH) {
        // do nothing
        return;
    } else {
        const isValid = await validateWord(guess);
        if (!isValid) {
            markInvalidWord();
            return;
        }

        const guessArray = guess.split("");
        const wordCount = getCount(word);

        // Set any correct letters to correct
        for (let i = 0; i < MAX_LENGTH; i++) {
            if (guessArray[i] === wordArray[i]) {
                letters[row * MAX_LENGTH + i].classList.add("correct");
                wordCount[guessArray[i]]--; // Reduce the count of letter
            }
        }

        // Set any close or wrong letters to close or wrong
        for (let i = 0; i < MAX_LENGTH; i++) {
            if (guessArray[i] === wordArray[i]) {
                // do nothing
            } else if (wordCount[guessArray[i]] > 0) {
                letters[row * MAX_LENGTH + i].classList.add("close");
                wordCount[guessArray[i]]--;
            } else {
                letters[row * MAX_LENGTH + i].classList.add("wrong");
            }
        }

        // Win
        if (guess === word) {
            isLoading = true;
            loadingDiv.innerHTML = "You Win!";
            loadingDiv.style = "font-family: Inter; font-size: 48px;";
            setLoading(isLoading);

            done = true;
            return;
        }

        // Lose
        if (row >= MAX_ROUNDS) {
            isLoading = true;
            loadingDiv.innerHTML = `You Lose! The word is ${word}`;
            loadingDiv.style = "font-family: Inter; font-size: 48px;";
            setLoading(isLoading);
            done = true;
            return;
        }

        row++; // Move to next row
        guess = ""; // New attempt
    }
}

async function validateWord(guess) {
    isLoading = true;
    setLoading(isLoading);

    const promise = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({ word: guess }),
    });

    const json = await promise.json();

    isLoading = false;
    setLoading(isLoading);

    return json.validWord;
}

function markInvalidWord() {
    for (let i = 0; i < MAX_LENGTH; i++) {
        letters[row * MAX_LENGTH + i].classList.add("invalid");
        setTimeout(function () {
            letters[row * MAX_LENGTH + i].classList.remove("invalid");
        }, 500);
    }
}

function backspace() {
    if (guess.length > 0) {
        letters[5 * row + guess.length - 1].innerText = "";
        guess = guess.substring(0, guess.length - 1);
    } else {
        // do nothing
    }
}

function getCount(array) {
    const count = {};
    for (let i = 0; i < array.length; i++) {
        if (count[array[i]] > 0) {
            count[array[i]] += 1;
        } else {
            count[array[i]] = 1;
        }
    }

    return count;
}
