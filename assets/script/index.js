let currentDate = { datestring: new Date().toDateString(), localstorage: {} };

const todays_date = document.querySelector("header todays-date");
const scheduler_wrapper = document.querySelector(".scheduler_wrapper");

function loadDate(dateString = currentDate.datestring) {
    // clears scheduler wrapper
    scheduler_wrapper.textContent = "";

    currentDate = {
        datestring: dateString,
        localstorage: {
            9: undefined,
            10: undefined,
            11: undefined,
            12: undefined,
            13: undefined,
            14: undefined,
            ...JSON.parse(localStorage.getItem(dateString) || "{}"),
        },
    };

    function isNoteUpdated() {
        const { activeElement } = document;

        if (!activeElement.matches(".scheduler_wrapper .item .note")) return;

        const hour = activeElement.parentElement.dataset.hour;
        const noteValue = activeElement.value;

        if (currentDate.localstorage[hour] !== (noteValue || undefined))
            return activeElement.parentElement.classList.add("obselete");
        activeElement.parentElement.classList.remove("obselete");
    }
    scheduler_wrapper.oninput = isNoteUpdated;

    const formatMeridiem = (hour) => {
        return (hour % 12 || 12) + " " + (hour < 12 ? "AM" : "PM");
    };

    Object.entries(currentDate.localstorage)
        .sort(([hour], [secondHour]) => hour - secondHour)
        .forEach(([hour, note]) => {
            console.log(currentDate);
            scheduler_wrapper.insertAdjacentHTML(
                "beforeend",
                `<div class="item" data-hour="${hour}">
                            <div class="time">${formatMeridiem(hour)}</div>
                            <input type="text" class="note" value="${note ?? ""}"/>
                            <button class="save"></button>
                        </div>`
            );
        });
}

loadDate();
scheduler_wrapper.onclick = (e) => {
    if (!e.target.matches(".item .save")) return;

    const parentElement = e.target.parentElement;

    const hour = e.target.parentElement.dataset.hour;
    const note = e.target.parentElement.querySelector(".note").value;

    currentDate.localstorage[hour] = note;

    localStorage.setItem(currentDate.datestring, JSON.stringify(currentDate.localstorage));

    parentElement.classList.remove("obselete");
};
