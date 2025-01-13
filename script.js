const wrapper = document.querySelector(".wrapper");
const searchInput = wrapper.querySelector("input");
const infoText = wrapper.querySelector(".info-text");
const synonymsContainer = wrapper.querySelector(".synonyms .list");
const wordElement = wrapper.querySelector(".word p");
const definitionElement = wrapper.querySelector(".meaning span");
const exampleElement = wrapper.querySelector(".example span");

searchInput.addEventListener("input", (e) => {
    const word = e.target.value.trim();
    if (!word) {
        infoText.innerHTML = "Please enter a word to search.";
        wrapper.classList.remove("active");
        return;
    }

    // Special handling for single-letter words
    if (word.length === 1) {
        infoText.innerHTML = `Single-letter words may not be found in the dictionary. Please try a longer word.`;
        wrapper.classList.remove("active");
        return;
    }

    infoText.innerHTML = `Searching for: <span>"${word}"</span>`;
    fetchWordData(word);
});

function fetchWordData(word) {
    const sanitizedWord = word.replace(/[^a-zA-Z]/g, ""); // Remove special characters
    const apiURL = `https://api.dictionaryapi.dev/api/v2/entries/en/${sanitizedWord}`;

    fetch(apiURL)
        .then((response) => response.json())
        .then((data) => {
            if (data.title) {
                // Handle cases where the word is not found
                infoText.innerHTML = `Can't find the meaning of "<b>${sanitizedWord}</b>". Please try another word.`;
                wrapper.classList.remove("active");
            } else {
                displayWordData(data);
            }
        })
        .catch((error) => {
            infoText.innerHTML = `An error occurred: ${error.message}`;
            wrapper.classList.remove("active");
        });
}

function displayWordData(data) {
    try {
        const wordInfo = data[0]; // Get the first word entry
        const meanings = wordInfo.meanings[0];
        const definition = meanings.definitions[0]?.definition || "No definition available.";
        const example = meanings.definitions[0]?.example || "No example available.";
        const synonyms = meanings.synonyms?.join(", ") || "No synonyms available.";

        wordElement.innerText = wordInfo.word;
        definitionElement.innerText = definition;
        exampleElement.innerText = example;

        // Clear and update synonyms
        synonymsContainer.innerHTML = "";
        synonyms.split(", ").forEach((syn) => {
            const span = document.createElement("span");
            span.innerText = syn;
            synonymsContainer.appendChild(span);
        });

        wrapper.classList.add("active");
        infoText.innerHTML = ""; // Clear info text on success
    } catch (error) {
        console.error("Error processing data:", error);
        infoText.innerHTML = "Unexpected data format. Please try another word.";
        wrapper.classList.remove("active");
    }
}
