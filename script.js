const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjP6NN6R8jvc26uHZsz2FrfsuWA9W-mAl0fQwTSWBew3GwiHDbzXYelbgAjJuSpAw7/exec";

const $ = (id) => document.getElementById(id);

let selectedDate = "";
let selectedShow = "";
let selectedDay = null;

const today = new Date();
today.setHours(0, 0, 0, 0);

let year = today.getFullYear();
let month = today.getMonth();
let audioContext;

// НҮҮР СОЛИХ
function showPage(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === id);
  });

  window.scrollTo(0, 0);
}

// PHOTO BOOTH МЕХАНИК ДУУ
function playPrintSound() {
  try {
    audioContext ??= new (
      window.AudioContext || window.webkitAudioContext
    )();

    audioContext.resume();

    const duration = 2.7;
    const sampleRate = audioContext.sampleRate;
    const length = Math.floor(sampleRate * duration);

    const buffer = audioContext.createBuffer(
      1, length, sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;

      const pulse = Math.sin(
        time * 2 * Math.PI * 24
      );

      const noise = Math.random() * 2 - 1;

      data[i] = (
        pulse * 0.035 +
        noise * 0.025
      ) * Math.min(1, (duration - time) * 4);
    }

    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();

    source.buffer = buffer;
    source.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.value = 0.6;
    source.start();

  } catch (error) {
    console.log("Audio unavailable");
  }
}

// PHOTO BOOTH-ООС ЗУРАГ ХЭВЛЭХ
$("printButton").addEventListener("click", () => {
  const paper = $("photoPaper");

  if (paper.classList.contains("printed")) return;

  playPrintSound();

  paper.classList.add("printed");
  $("printButton").disabled = true;

  setTimeout(() => {
    $("openButton").disabled = false;
  }, 3000);
});

// ЭХНИЙ НҮҮРЭЭС БОЛЗОО РУУ
$("openButton").addEventListener("click", () => {
  showPage("dates");
});

// 4 БОЛЗООНЫ СОНГОЛТ
document.querySelectorAll(".date-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".date-card").forEach(item => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");

    const newDate = card.dataset.date;

    if (selectedDate !== newDate) {
      selectedShow = "";
      selectedDay = null;

      document.querySelectorAll(".show-card").forEach(item => {
        item.classList.remove("selected");
      });

      $("comedyNext").disabled = true;
    }

    selectedDate = newDate;
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

// DATE SELECTION-ЭЭС БУЦАХ
$("datesBack").addEventListener("click", () => {
  showPage("home");
});

// ХОШИН ШОГИЙН 2 СОНГОЛТ
document.querySelectorAll(".show-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".show-card").forEach(item => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");
    selectedShow = card.dataset.show;
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

// КАЛЕНДАРЬ НЭЭХ
function openCalendar() {
  selectedDay = null;

  year = today.getFullYear();
  month = today.getMonth();

  $("doneButton").disabled = true;
  $("doneButton").classList.remove("hidden");
  $("calendarBox").classList.remove("hidden");
  $("calendarBack").classList.remove("hidden");
  $("confirmation").classList.add("hidden");

  renderCalendar();
  showPage("calendarPage");
}

// КАЛЕНДАРЬ ҮҮСГЭХ
function renderCalendar() {
  const calendar = $("calendarDays");
  calendar.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  $("monthTitle").textContent =
    new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric"
    }).format(new Date(year, month, 1));

  const weekNames = [
    "Sun", "Mon", "Tue", "Wed",
    "Thu", "Fri", "Sat"
  ];

  weekNames.forEach(name => {
    const label = document.createElement("div");
    label.className = "weekday";
    label.textContent = name;
    calendar.appendChild(label);
  });

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const button = document.createElement("button");

    button.className = "day";
    button.textContent = day;

    const isPast = date < today;

    const isWeekend =
      date.getDay() === 0 ||
      date.getDay() === 6;

    const isComedy =
      selectedDate === "Хошин шог үзэх";

    // Хошин шог бол зөвхөн Даваа-Баасан
    button.disabled =
      isPast || (isComedy && isWeekend);

    if (
      selectedDay &&
      date.toDateString() === selectedDay.toDateString()
    ) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      selectedDay = date;
      $("doneButton").disabled = false;
      renderCalendar();
    });

    calendar.appendChild(button);
  }

  $("prevMonth").disabled =
    year === today.getFullYear() &&
    month === today.getMonth();
}

// ӨМНӨХ САР
$("prevMonth").addEventListener("click", () => {
  if (
    year === today.getFullYear() &&
    month === today.getMonth()
  ) return;

  if (month === 0) {
    month = 11;
    year--;
  } else {
    month--;
  }

  renderCalendar();
});

// ДАРААГИЙН САР
$("nextMonth").addEventListener("click", () => {
  if (month === 11) {
    month = 0;
    year++;
  } else {
    month++;
  }

  renderCalendar();
});

// КАЛЕНДАРИАС БУЦАХ
$("calendarBack").addEventListener("click", () => {
  if (selectedDate === "Хошин шог үзэх") {
    showPage("comedy");
  } else {
    showPage("dates");
  }
});

// DONE

$("doneButton").addEventListener("click", async () => {
  if (!selectedDay || !selectedDate) return;

  const button = $("doneButton");
  button.disabled = true;
  button.textContent = "SENDING...";

  const formattedDay = [
    selectedDay.getFullYear(),
    String(selectedDay.getMonth() + 1).padStart(2, "0"),
    String(selectedDay.getDate()).padStart(2, "0")
  ].join("-");

  const data = {
    dateType: selectedDate,
    show: selectedDate === "Хошин шог үзэх"
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
    alert("Хүсэлт илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
  } finally {
    button.textContent = "DONE ♡";
    button.disabled = false;
  }
});


// DONE ХЭСГЭЭС БУЦАХ
$("resultBack").addEventListener("click", () => {
  $("confirmation").classList.add("hidden");
  $("calendarBox").classList.remove("hidden");
  $("doneButton").classList.remove("hidden");
  $("calendarBack").classList.remove("hidden");

  renderCalendar();
});

// SHARE
$("shareButton").addEventListener("click", async () => {
  const message = $("resultText").textContent;

  if (navigator.share) {
    try {
      await navigator.share({ text: message });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(message);
    $("shareButton").textContent = "COPIED ✓";
  } catch (error) {
    window.prompt("Copy your selection:", message);
  }
});
