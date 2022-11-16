const mainEl = document.querySelector("main");
const timeEl = document.querySelector("#time span");

const questions = [
    { question: "In which layer of the atmosphere does most of the weather occur?", options: ["stratosphere",'troposphere','termosphere','mesosphere'], answerIndex: 2 },
    { question: "Different species of birds live in different climates. What does climate event mean?", options: ["The height to which Red will be able to fly.","The weather this week.","The long-term average of weather conditions.","The change in the atmosphere."], answerIndex: 3 },
    { question: "There are a lot of changes ahead! What is climate change", options: ["A change in the weather during the day.","A long-term change in temperature and weather patterns.","Extreme weather conditions like hurricanes or flooding.","An increase in plant species."], answerIndex: 2 },
    { question: "Global warming is...", options: ["...the general increase in the Earth's average temperature.","...the temperature changes during the day."], answerIndex: 1 },
    { question: "The greenhouse effect is a process...", options: ["...of growing your own plants in a greenhouse.","...where heat isn't released back to space due to greenhouse gases.","...of making the Earth more green.","...of the Sun releasing more heat than normally."], answerIndex: 1 },
];

let interval;

async function getNewScore() {
    mainEl.innerHTML = `
    <div class="pre-complete">
        <h1>Your name:</h1>
        <input type="text">
        <button>Submit</button>
    </div>`;

    const inputEl = mainEl.querySelector('input')
    
    await new Promise((res) => {
        inputEl.onkeydown = (e) =>{ e.key === 'Enter' && res()}
        mainEl.querySelector('button').onclick = res
    });

    return { name: inputEl.textContent, score: +timeEl.textContent };
}

/** @param {boolean} timeout */
async function quizEnded(timeout) {
    clearInterval(interval);

    const newScore = {}??await getNewScore();

    const highestscores = JSON.parse(localStorage.getItem("highestscores") ?? "[]");
    highestscores.push(newScore);
    highestscores.sort((a, b) => a.score - b.score);
    highestscores.slice(0, 10);
    localStorage.setItem("highestscores", JSON.stringify(highestscores));

    mainEl.innerHTML = `<div class="complete">
                            <h1>${
                                highestscores[0] === newScore
                                    ? "You achieved the top rankings! 🥳"
                                    : "Better luck next time 🐨"
                            }</h1>
                            <div class="highestscores">
                            ${
                                highestscores.reduce(
                                    (previous, current) => {
                                        const isNewScore = newScore === current;
                                        previous.index++;
                                        previous.string += `<div class="player ${isNewScore ? "new-score" : ""}">
                                                        <span>${previous.index}</span>
                                                        <span>${current.name}</span>
                                                        <span>${current.score}</span>
                                                     </div>`;
                                        return previous;
                                    },
                                    { index: 0, string: "" }
                                ).string
                            }
                            </div>
                        </div>`;

    if (!highestscores.includes(newScore))
        mainEl.querySelector("h1").insertAdjacentHTML(
            "afterend",
            `<div class="player new-score">
                <span>${highestscores.length + 1}</span>
                <span>${newScore.name}</span>
                <span>${newScore.score}</span>
             </div>`
        );
}


async function startQuiz() {
    clearInterval(interval);

    timeEl.parentElement.classList.remove("incorrect");

    timeEl.textContent = 100;
    interval = setInterval(() => (timeEl.textContent === 0 ? quizEnded(true) : (timeEl.textContent -= 1)), 1000);

    mainEl.innerHTML = `<div class="quiz"><h1 class="question"></h1><div class="options"></div></div>`;

    const questionEl = mainEl.querySelector("h1.question");
    const optionsEl = mainEl.querySelector(".options");

    for await (const { question, options, answerIndex } of questions) {
        questionEl.textContent = question;
        optionsEl.innerHTML = "";

        options.forEach((option, index) => {
            optionsEl.insertAdjacentHTML("beforeend", `<button data-index="${index + 1}">${option}</button>`);
        });

        await new Promise((res) => {
            optionsEl.onclick = (e) => {
                if (e.target === e.currentTarget) return;

                const isCorrect = +e.target.dataset.index === answerIndex ? true : false;
                if (!isCorrect) {
                    timeEl.textContent -= 10;
                    setTimeout(() => timeEl.parentElement.classList.remove("incorrect"), 1000);
                    timeEl.parentElement.classList.add("incorrect");
                }

                e.target.classList.add(isCorrect ? "correct" : "incorrect");
                setTimeout(res, 200);
            };
        });
    }

    quizEnded(false);
}
