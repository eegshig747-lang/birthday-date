
"use strict";

// =======================================
// 1. GOOGLE APPS SCRIPT
// =======================================

// Өмнө нь Gmail рүү амжилттай илгээж байсан URL
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyjP6NN6R8jvc26uHZsz2FrfsuWA9W-mAI0fQwTSWBew3GwiHDbzXYelbgAjJuSpAw7/exec";

// =======================================
// 2. HELPERS
// =======================================

const $ = (id) => document.getElementById(id);

const pages = document.querySelectorAll(".page");

function showPage(pageId) {
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === pageId);
  });

  window.scrollTo(0, 0);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =======================================
// 3. VARIABLES
// =======================================

let selectedDate = "";
let selectedShow = "";
let selectedDay = null;

let currentMonth = new Date();
currentMonth.setDate(1);

let hasPrinted = false;

// =======================================
// 4. PHOTO BOOTH
// =======================================

function playPrintSound() {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(
      90,
      audioContext.currentTime
    );

    oscillator.frequency.linearRampToValueAtTime(
      55,
      audioContext.currentTime + 0.45
    );

    gain.gain.setValueAtTime(
      0.025,
      audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.5
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);

    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    console.log("Sound unavailable:", error);
  }
}

$("printButton").addEventListener("click", () => {
  if (hasPrinted) return;

  hasPrinted = true;

  $("printButton").disabled = true;

  playPrintSound();

  $("photoPaper").classList.add("printed");

  setTimeout(() => {
    $("openButton").disabled = false;
  }, 3000);
});

$("openButton").addEventListener("click", () => {
  showPage("dates");
});

$("datesBack").addEventListener("click", () => {
  showPage("home");
});

// =======================================
// 5. DATE SELECTION
// =======================================

const dateCards = document.querySelectorAll(".date-card");

dateCards.forEach((card) => {
  card.addEventListener("click", () => {
    dateCards.forEach((item) => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");

    selectedDate = card.dataset.date;
    selectedShow = "";
    selectedDay = null;

    $("dateNext").disabled = false;
  });
});

$("dateNext").addEventListener("click", () => {
  if (!selectedDate) return;

  if (selectedDate === "Хошин шог үзэх") {
    showPage("comedy");
  } else {
    openCalendar();
  }
});

// =======================================
// 6. COMEDY SHOW SELECTION
// =======================================

const showCards = document.querySelectorAll(".show-card");

showCards.forEach((card) => {
  card.addEventListener("click", () => {
    showCards.forEach((item) => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");

    selectedShow = card.dataset.show;
    selectedDay = null;

    $("comedyNext").disabled = false;
  });
});

$("comedyNext").addEventListener("click", () => {
  if (!selectedShow) return;

  openCalendar();
});

$("comedyBack").addEventListener("click", () => {
  showPage("dates");
});

// =======================================
// 7. CALENDAR
// =======================================

const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat"
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function openCalendar() {
  const today = new Date();

  currentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  selectedDay = null;

  $("doneButton").disabled = true;
  $("doneButton").classList.remove("hidden");

  $("calendarBox").classList.remove("hidden");
  $("calendarBack").classList.remove("hidden");
  $("confirmation").classList.add("hidden");

  renderCalendar();
  showPage("calendarPage");
}

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  $("monthTitle").textContent =
    `${MONTHS[month]} ${year}`;

  const calendarDays = $("calendarDays");
  calendarDays.innerHTML = "";

  // Weekday headings
  WEEKDAYS.forEach((weekday) => {
    const heading = document.createElement("div");

    heading.className = "weekday";
    heading.textContent = weekday;

    calendarDays.appendChild(heading);
  });

  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  // Empty spaces before first date
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarDays.appendChild(empty);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calendar dates
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    const button = document.createElement("button");

    button.className = "day";
    button.textContent = day;
    button.type = "button";

    const isPast = date < today;

    const weekday = date.getDay();

    const isWeekend =
      weekday === 0 || weekday === 6;

    // Comedy date: Monday - Friday only
    const comedyWeekend =
      selectedDate === "Хошин шог үзэх" &&
      isWeekend;

    if (isPast || comedyWeekend) {
      button.disabled = true;
    }

    if (
      selectedDay &&
      formatDate(selectedDay) === formatDate(date)
    ) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      if (button.disabled) return;

      selectedDay = date;

      document.querySelectorAll(".day").forEach(
        (item) => item.classList.remove("selected")
      );

      button.classList.add("selected");

      $("doneButton").disabled = false;
    });

    calendarDays.appendChild(button);
  }

  // Disable previous months before current month
  const currentFirst = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  $("prevMonth").disabled =
    currentMonth.getTime() <= currentFirst.getTime();
}

$("prevMonth").addEventListener("click", () => {
  const today = new Date();

  const earliestMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const previousMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    1
  );

  if (previousMonth < earliestMonth) return;

  currentMonth = previousMonth;

  renderCalendar();
});

$("nextMonth").addEventListener("click", () => {
  currentMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    1
  );

  renderCalendar();
});

$("calendarBack").addEventListener("click", () => {
  if (selectedDate === "Хошин шог үзэх") {
    showPage("comedy");
  } else {
    showPage("dates");
  }
});

// =======================================
// 8. DONE + GMAIL
// =======================================

$("doneButton").addEventListener("click", async () => {
  if (!selectedDate || !selectedDay) return;

  if (
    selectedDate === "Хошин шог үзэх" &&
    !selectedShow
  ) {
    return;
  }

  const button = $("doneButton");

  button.disabled = true;
  button.textContent = "SENDING...";

  const formattedDay = formatDate(selectedDay);

  const data = {
    dateType: selectedDate,
    show:
      selectedDate === "Хошин шог үзэх"
        ? selectedShow
        : "",
    selectedDay: formattedDay
  };

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(data)
    });

    let summary = selectedDate;

    if (data.show) {
      summary += "\n" + data.show;
    }

    summary += "\n" + formattedDay;

    $("resultText").textContent = summary;

    $("calendarBox").classList.add("hidden");
    $("doneButton").classList.add("hidden");
    $("calendarBack").classList.add("hidden");

    $("confirmation").classList.remove("hidden");

  } catch (error) {
    console.error("Email request failed:", error);

    alert(
      "Мэдээлэл илгээхэд алдаа гарлаа. " +
      "Интернэт холболтоо шалгаад дахин оролдоно уу."
    );

  } finally {
    button.textContent = "DONE ♡";
    button.disabled = false;
  }
});

// =======================================
// 9. SHARE
// =======================================

$("shareButton").addEventListener("click", async () => {
  const shareText =
    "Our Date ♡\n\n" +
    $("resultText").textContent;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Birthday Date Invitation",
        text: shareText
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Date information copied ♡");
    } catch (error) {
      alert(shareText);
    }
  }
});

// =======================================
// 10. BACK FROM CONFIRMATION
// =======================================

$("resultBack").addEventListener("click", () => {
  $("confirmation").classList.add("hidden");

  $("calendarBox").classList.remove("hidden");
  $("doneButton").classList.remove("hidden");
  $("calendarBack").classList.remove("hidden");

  renderCalendar();
});

// =======================================
// 11. INITIAL STATE
// =======================================

showPage("home");
