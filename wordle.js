let word, splitWords;
let tries = 0;
let position = 0;
const attempts = [[], [], [], [], [], []];
let containers = document.querySelectorAll(".trial");
let backspaced = false;

init();

function init() {
    (async () => {
        [word, splitWords] = await getWord();
    })();
    clearTrials();
    document
        .querySelector(".wordle-game")
        .addEventListener("keyup", function (InputEvent) {
            handleKeyStroke(InputEvent);
        });
}

async function getWord() {
    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const processed = await res.json();
    word = processed["word"].toUpperCase();
    return [word, word.split("")];
}

async function isAWord(array) {
    const res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({ word: array.join("") }),
    });
    const processed = await res.json();
    const boolean = processed["validWord"];
    return boolean;
}

function clearTrials() {
    let trials = document.querySelectorAll(".letter");
    for (let i = 0; i < trials.length; i++) {
        trials[i].value = "";
    }
}

async function handleKeyStroke(input) {
    if (isLetter(input.key) === true) {
        handleLetter(input.key);
    } else if (input.key === "Enter") {
        await handleEnter();
    } else if (input.key === "Backspace") {
        handleBackspace();
    } else {
        input.preventDefault();
    }
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function handleLetter(letter) {
    letter = letter.toUpperCase();
    backspaced = false;

    if (position === 5) {
        return; // Validate word only on pressing enter key
    } else {
        attempts[tries][position] = letter;
        if (position >= 0 && position < 4 && tries < 6) {
            // Move to the next cell
            containers[tries][position + 1].focus();
            containers[tries][position + 1].value = "";
            position++;
        }
    }
}

function makeReadOnly(tries) {
    for (let i = 0; i < 5; i++) {
        containers[tries][i].disabled = true;
    }
}

async function handleEnter() {
    let result, hints;

    if (
        attempts[tries].length === 5 &&
        tries <= 5 &&
        (await isAWord(attempts[tries]))
    ) {
        [result, hints] = validateWord(attempts[tries]);
    } else {
        alert("Enter a valid five letter word!");
        return;
    }

    showHints(hints);
    makeReadOnly(tries);
    if (hints === "11111") {
        alert("Congrats You Win!");
        return;
    }

    // Move to the next row
    tries++;
    position = 0;

    // Game over
    if (tries > 5) {
        alert(`Game Over! The word is ${word}`);
        return;
    }

    containers[tries][position].focus();
    containers[tries][position].value = "";
}

function validateWord(array) {
    let hints = "";
    let found = [];
    for (let i = 0; i < 5; i++) {
        if (array[i] === splitWords[i]) {
            hints += "1";
            found.push(array[i]);
        } else if (
            splitWords.includes(array[i]) &&
            found.filter((x) => x === array[i]).length <
                splitWords.filter((x) => x === array[i]).length
        ) {
            hints += "2";
            found.push(array[i]);
        } else {
            hints += "0";
        }
    }
    return [true, hints];
}

function showHints(hints) {
    let color = "";
    for (let i = 0; i < 5; i++) {
        if (hints[i] === "1") {
            color = "green";
        } else if (hints[i] === "2") {
            color = "yellow";
        } else {
            color = "red";
        }

        containers[tries][i].style.backgroundColor = color;
    }
}

function handleBackspace() {
    if (position === 0) {
        alert("No letters to clear!");
    } else if (backspaced === true || isEmptyOrUndefined(tries, position)) {
        position--;
        containers[tries][position].focus();
        containers[tries][position].value = "";
    } else {
        backspaced = true;
        return;
    }
}

function isEmptyOrUndefined(tries, position) {
    // Handle wierd behaviour of attempts[tries][position] being sometimes "" or undefined or my stupidness
    if (attempts[tries][position] === undefined) {
        return true;
    }
    if (attempts[tries][position].value === "") {
        return true;
    }

    return false;
}
