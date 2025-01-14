const wrapper = document.querySelector(".wrapper");
const searchInput = wrapper.querySelector("input");
const infoText = wrapper.querySelector(".info-text");
const synonymsContainer = wrapper.querySelector(".synonyms .list");
const wordElement = wrapper.querySelector(".word p");
const definitionElement = wrapper.querySelector(".meaning span");
const exampleElement = wrapper.querySelector(".example span");

// Debounce function to optimize API calls
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

searchInput.addEventListener("input", debounce((e) => {
    const word = e.target.value.trim();
    if (!word) {
        updateInfoText("Please enter a word to search.");
        wrapper.classList.remove("active");
        return;
    }

    if (word.length === 1) {
        updateInfoText("Single-letter words may not be found. Try a longer word.");
        wrapper.classList.remove("active");
        return;
    }

    updateInfoText(`Searching for: <span>"${word}"</span>`);
    fetchWordData(word);
}, 500)); // Debounce with a delay of 500ms

function fetchWordData(word) {
    const cleanedWord = word.replace(/[^a-zA-Z]/g, ""); // Remove special characters
    const apiURL = `https://api.dictionaryapi.dev/api/v2/entries/en/${cleanedWord}`;

    fetch(apiURL)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch data from the API.");
            }
            return response.json();
        })
        .then((data) => {
            if (data.title) {
                updateInfoText(`Can't find the meaning of "<b>${cleanedWord}</b>". Please try another word.`);
                wrapper.classList.remove("active");
            } else {
                displayWordData(data);
            }
        })
        .catch((error) => {
            updateInfoText(`An error occurred: ${error.message}`);
            wrapper.classList.remove("active");
        });
}

function displayWordData(data) {
    try {
        const wordInfo = data[0];
        const meanings = wordInfo.meanings[0];
        const definition = meanings.definitions[0]?.definition || "No definition available.";
        const example = meanings.definitions[0]?.example || "No example available.";
        const synonyms = meanings.synonyms || [];

        wordElement.innerText = wordInfo.word;
        definitionElement.innerText = definition;
        exampleElement.innerText = example;

        synonymsContainer.innerHTML = ""; // Clear previous synonyms
        synonyms.forEach((syn) => {
            const span = document.createElement("span");
            span.classList.add("synonym");
            span.innerText = syn;
            synonymsContainer.appendChild(span);
        });

        wrapper.classList.add("active");
        infoText.innerHTML = ""; // Clear info text
    } catch (error) {
        console.error("Error processing data:", error);
        updateInfoText("Unexpected data format. Please try another word.");
        wrapper.classList.remove("active");
    }
}

function updateInfoText(message) {
    infoText.innerHTML = message;
}
