"use strict";

/*
 * ==========================================
 * FEUERWEHR EINSATZLEITUNG
 * Version 0.1
 * ==========================================
 */

const state = {

  screen: "menu",

  mode: null,

  camera: {
    x: -800,
    y: -500,
    zoom: 0.65,

    dragging: false,
    lastX: 0,
    lastY: 0
  },

  freeGame: {
    timer: 240,
    timerRunning: false,
    activeMission: false
  },

  alarm: {
    active: false,
    pagerVisible: false
  },

  selectedVehicle: null,

  mission: null
};


/* ==========================================
   FAHRZEUGE
========================================== */

const vehicles = [

  {
    id: "elw1",
    type: "ELW",
    name: "ELW 1",
    count: 1,
    color: "#d71920",
    activity: "Einsatzleitung"
  },

  {
    id: "hlf1",
    type: "HLF",
    name: "HLF 10-1",
    count: 1,
    color: "#d71920",
    activity: "Brandbekämpfung / TH"
  },

  {
    id: "hlf2",
    type: "HLF",
    name: "HLF 10-2",
    count: 1,
    color: "#d71920",
    activity: "Brandbekämpfung / TH"
  },

  {
    id: "dlk1",
    type: "DLK",
    name: "DLK 1",
    count: 1,
    color: "#d71920",
    activity: "Drehleiter"
  },

  {
    id: "dlk2",
    type: "DLK",
    name: "DLK 2",
    count: 1,
    color: "#d71920",
    activity: "Drehleiter"
  },

  {
    id: "lhf1",
    type: "LHF",
    name: "LHF 1",
    count: 1,
    color: "#d71920",
    activity: "Brandbekämpfung"
  },

  {
    id: "lhf2",
    type: "LHF",
    name: "LHF 2",
    count: 1,
    color: "#d71920",
    activity: "Brandbekämpfung"
  },

  {
    id: "lhf3",
    type: "LHF",
    name: "LHF 3",
    count: 1,
    color: "#d71920",
    activity: "Brandbekämpfung"
  },

  {
    id: "rtw1",
    type: "RTW",
    name: "RTW 1",
    count: 1,
    color: "#f4f4f4",
    activity: "Patientenversorgung"
  },

  {
    id: "rtw2",
    type: "RTW",
    name: "RTW 2",
    count: 1,
    color: "#f4f4f4",
    activity: "Patientenversorgung"
  },

  {
    id: "nef1",
    type: "NEF",
    name: "NEF 1",
    count: 1,
    color: "#f4f4f4",
    activity: "Notarztversorgung"
  }

];


/* ==========================================
   EINSÄTZE
========================================== */

const missions = [

  {
    id: "traffic",
    name: "Verkehrsunfall an Kreuzung",
    category: "Klein",
    duration: "3–5 Minuten",
    description: "Verkehrsunfall mit möglicher verletzter Person.",
    icon: "🚗💥"
  },

  {
    id: "container",
    name: "Müllcontainerbrand",
    category: "Klein",
    duration: "3–5 Minuten",
    description: "Brennender Müllcontainer mit Ausbreitungsgefahr.",
    icon: "🗑️🔥"
  },

  {
    id: "kitchen",
    name: "Küchenbrand",
    category: "Klein",
    duration: "3–5 Minuten",
    description: "Brand in einer Küche mit starker Rauchentwicklung.",
    icon: "🏠🔥"
  },

  {
    id: "hall",
    name: "Hallenbrand",
    category: "Mittel",
    duration: "5–10 Minuten",
    description: "Brand in einer größeren Halle.",
    icon: "🏭🔥"
  },

  {
    id: "house",
    name: "Großbrand Familienhaus",
    category: "Groß",
    duration: "5–10 Minuten",
    description: "Großbrand in einem Familienhaus.",
    icon: "🏠🔥"
  },

  {
    id: "mall",
    name: "Einkaufszentrum – Großbrand",
    category: "Groß",
    duration: "10–20 Minuten",
    description: "Großflächiger Brand in einem Einkaufszentrum.",
    icon: "🏬🔥"
  },

  {
    id: "forest",
    name: "Waldbrand",
    category: "Groß",
    duration: "10–20 Minuten",
    description: "Dynamischer Waldbrand mit Ausbreitungsgefahr.",
    icon: "🌲🔥"
  },

  {
    id: "bigTraffic",
    name: "Verkehrsunfall an großer Kreuzung",
    category: "Groß",
    duration: "5–10 Minuten",
    description: "Mehrere Fahrzeuge und mögliche Verletzte.",
    icon: "🚗💥"
  }

];


/* ==========================================
   DOM
========================================== */

const mainMenu = document.getElementById("mainMenu");
const missionMenu = document.getElementById("missionMenu");
const gameScreen = document.getElementById("gameScreen");

const freeGameBtn = document.getElementById("freeGameBtn");
const missionSelectBtn = document.getElementById("missionSelectBtn");

const backFromMissions = document.getElementById("backFromMissions");
const backToMenu = document.getElementById("backToMenu");

const missionList = document.getElementById("missionList");

const worldViewport = document.getElementById("worldViewport");
const world = document.getElementById("world");

const vehicleArea = document.getElementById("vehicleArea");

const timerPanel = document.getElementById("timerPanel");
const freeTimer = document.getElementById("freeTimer");

const missionInfo = document.getElementById("missionInfo");
const missionTitle = document.getElementById("missionTitle");
const missionDescription = document.getElementById("missionDescription");

const missionLocation = document.getElementById("missionLocation");

const pager = document.getElementById("pager");
const pagerMission = document.getElementById("pagerMission");
const pagerButton = document.getElementById("pagerButton");

const vehiclePanel = document.getElementById("vehiclePanel");
const selectedVehicleName = document.getElementById("selectedVehicleName");
const vehicleActions = document.getElementById("vehicleActions");
const closeVehiclePanel = document.getElementById("closeVehiclePanel");

const gameStatus = document.getElementById("gameStatus");


/* ==========================================
   MENÜ
========================================== */

function showScreen(screen) {

  mainMenu.classList.remove("active");
  missionMenu.classList.remove("active");
  gameScreen.classList.remove("active");

  screen.classList.add("active");
}


freeGameBtn.addEventListener("click", () => {

  state.mode = "free";

  startGame();

  timerPanel.classList.remove("hidden");

  startFreeGameTimer();
});


missionSelectBtn.addEventListener("click", () => {

  showScreen(missionMenu);

  renderMissionList();

});


backFromMissions.addEventListener("click", () => {

  showScreen(mainMenu);

});


backToMenu.addEventListener("click", () => {

  location.reload();

});


/* ==========================================
   EINSATZAUSWAHL
========================================== */

function renderMissionList() {

  missionList.innerHTML = "";

  missions.forEach(mission => {

    const card = document.createElement("div");

    card.className = "mission-card";

    card.innerHTML = `
      <h3>${mission.icon} ${mission.name}</h3>

      <p>
        <strong>Kategorie:</strong> ${mission.category}<br>
        <strong>Dauer:</strong> ${mission.duration}
      </p>

      <p>${mission.description}</p>

      <button data-mission="${mission.id}">
        Einsatz starten
      </button>
    `;

    missionList.appendChild(card);

  });

  document
    .querySelectorAll("[data-mission]")
    .forEach(button => {

      button.addEventListener("click", () => {

        const mission = missions.find(
          m => m.id === button.dataset.mission
        );

        startSelectedMission(mission);

      });

    });

}


/* ==========================================
   SPIEL START
========================================== */

function startGame() {

  showScreen(gameScreen);

  resetCamera();

  createVehicles();

  gameStatus.textContent = "Wache bereit";

  missionInfo.classList.add("hidden");
  missionLocation.classList.add("hidden");
  pager.classList.add("hidden");

}


function startSelectedMission(mission) {

  state.mode = "mission";

  state.freeGame.activeMission = true;

  state.mission = mission;

  startGame();

  startMission(mission);

}


/* ==========================================
   FAHRZEUGE ERSTELLEN
========================================== */

function createVehicles() {

  vehicleArea.innerHTML = "";

  vehicles.forEach((vehicle, index) => {

    const element = document.createElement("div");

    element.className = "vehicle";

    element.dataset.vehicle = vehicle.id;

    element.style.background = vehicle.color;

    /*
     * 4 Stellplätze pro Reihe.
     */

    const column = index % 4;
    const row = Math.floor(index / 4);

    element.style.left = `${45 + column * 100}px`;
    element.style.top = `${250 + row * 65}px`;

    element.innerHTML = `
      <div class="blue-light"></div>
      ${vehicle.name}
    `;

    vehicleArea.appendChild(element);

    element.addEventListener("click", event => {

      event.stopPropagation();

      selectVehicle(vehicle, element);

    });

  });

}


/* ==========================================
   FAHRZEUG AUSWÄHLEN
========================================== */

function selectVehicle(vehicle, element) {

  state.selectedVehicle = vehicle;

  selectedVehicleName.textContent = vehicle.name;

  vehicleActions.innerHTML = "";

  const actions = getVehicleActions(vehicle);

  actions.forEach(action => {

    const button = document.createElement("button");

    button.className = "vehicle-action";

    button.textContent = action.name;

    button.addEventListener("click", () => {

      action.run(vehicle, element);

    });

    vehicleActions.appendChild(button);

  });

  vehiclePanel.classList.remove("hidden");

}


closeVehiclePanel.addEventListener("click", () => {

  vehiclePanel.classList.add("hidden");

});


/* ==========================================
   FAHRZEUGFUNKTIONEN
========================================== */

function getVehicleActions(vehicle) {

  const actions = [];

  if (vehicle.type === "ELW") {

    actions.push({
      name: "📡 Einsatzleitung",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Einsatzleitung aktiv`;

      }
    });

  }

  if (
    vehicle.type === "HLF" ||
    vehicle.type === "LHF"
  ) {

    actions.push({
      name: "💧 Hydrant anschließen",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Hydrant angeschlossen`;

      }
    });

    actions.push({
      name: "🚿 Schnellangriff",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Schnellangriff eingesetzt`;

      }
    });

    actions.push({
      name: "🔥 Strahlrohr einsetzen",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Strahlrohr aktiv`;

      }
    });

  }

  if (vehicle.type === "HLF") {

    actions.push({
      name: "🛠️ Technische Hilfeleistung",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Technische Hilfeleistung`;

      }
    });

  }

  if (vehicle.type === "DLK") {

    actions.push({
      name: "🪜 Leiter ausfahren",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Leiter wird ausgefahren`;

      }
    });

    actions.push({
      name: "↔️ Leiter positionieren",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Leiter positioniert`;

      }
    });

    actions.push({
      name: "💧 Wasser über DLK",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Wasserabgabe aktiviert`;

      }
    });

  }

  if (vehicle.type === "RTW") {

    actions.push({
      name: "🩺 Patientenversorgung",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Patientenversorgung`;

      }
    });

    actions.push({
      name: "🚑 Patient aufnehmen",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Patient aufgenommen`;

      }
    });

  }

  if (vehicle.type === "NEF") {

    actions.push({
      name: "👨‍⚕️ Notarzt aussteigen",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Notarzt im Einsatz`;

      }
    });

    actions.push({
      name: "🩺 Notfallversorgung",
      run: () => {

        gameStatus.textContent =
          `${vehicle.name}: Notfallversorgung`;

      }
    });

  }

  actions.push({
    name: "🚒 Ausrücken",
    run: () => {

      deployVehicle(vehicle);

    }
  });

  return actions;
}


/* ==========================================
   FAHRZEUG AUSFAHREN
========================================== */

function deployVehicle(vehicle) {

  const element =
    document.querySelector(
      `[data-vehicle="${vehicle.id}"]`
    );

  if (!element) return;

  openGarageDoorForVehicle(vehicle);

  element.classList.add("driving");

  gameStatus.textContent =
    `${vehicle.name} rückt aus`;

  /*
   * Fahrzeug fährt zunächst aus der Halle.
   */

  setTimeout(() => {

    element.style.left = "480px";
    element.style.top = "170px";

  }, 100);

  /*
   * Danach fährt es Richtung Einsatz.
   */

  setTimeout(() => {

    if (state.mission) {

      element.style.left = "1400px";
      element.style.top = "500px";

    }

  }, 1800);

}


function openGarageDoorForVehicle(vehicle) {

  /*
   * Vereinfachte Torzuordnung.
   */

  const index = vehicles.findIndex(
    v => v.id === vehicle.id
  );

  const doorIndex =
    Math.min(
      Math.floor(index / 3),
      3
    );

  const doors =
    document.querySelectorAll(".garage-door");

  if (doors[doorIndex]) {

    doors[doorIndex].classList.add("open");

  }

}


/* ==========================================
   FREIES SPIEL
========================================== */

let timerInterval = null;

function startFreeGameTimer() {

  clearInterval(timerInterval);

  state.freeGame.timer = 240;

  updateFreeTimer();

  state.freeGame.timerRunning = true;

  timerInterval = setInterval(() => {

    if (
      !state.freeGame.timerRunning ||
      state.freeGame.activeMission
    ) {

      return;

    }

    state.freeGame.timer--;

    updateFreeTimer();

    if (state.freeGame.timer <= 0) {

      clearInterval(timerInterval);

      createRandomMission();

    }

  }, 1000);

}


function updateFreeTimer() {

  const minutes =
    Math.floor(state.freeGame.timer / 60);

  const seconds =
    state.freeGame.timer % 60;

  freeTimer.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


/* ==========================================
   ZUFÄLLIGER EINSATZ
========================================== */

function createRandomMission() {

  if (state.freeGame.activeMission) {
    return;
  }

  const mission =
    missions[
      Math.floor(
        Math.random() * missions.length
      )
    ];

  startAlarmSequence(mission);

}


/* ==========================================
   ALARMIERUNG
========================================== */

function startAlarmSequence(mission) {

  state.alarm.active = true;

  state.mission = mission;

  state.freeGame.activeMission = true;

  gameStatus.textContent =
    "🚨 ALARM";

  /*
   * 1. GONG
   */

  playAlarmTone();

  /*
   * 2. DURCHSAGE
   */

  setTimeout(() => {

    speakMission(mission);

  }, 2200);

  /*
   * 3. MELDER NACH 30 SEKUNDEN
   */

  setTimeout(() => {

    showPager(mission);

  }, 30000);

}


/* ==========================================
   MELDER
========================================== */

function showPager(mission) {

  pagerMission.textContent =
    mission.name;

  pager.classList.remove("hidden");

  state.alarm.pagerVisible = true;

  gameStatus.textContent =
    "📟 Einsatzmelder alarmiert";

}


pagerButton.addEventListener("click", () => {

  pager.classList.add("hidden");

  state.alarm.pagerVisible = false;

  state.alarm.active = false;

  gameStatus.textContent =
    "🚒 Einsatz kann abgearbeitet werden";

  startMission(state.mission);

});


/* ==========================================
   DURCHSAGE
========================================== */

function speakMission(mission) {

  if (!("speechSynthesis" in window)) {
    return;
  }

  const text =
    `Einsatz für die Feuerwehr. ${mission.name}.`;

  const speech =
    new SpeechSynthesisUtterance(text);

  speech.lang = "de-DE";

  speech.rate = 0.85;
  speech.pitch = 0.8;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);

}


/* ==========================================
   ALARMTON
========================================== */

function playAlarmTone() {

  /*
   * Browser erlauben Audio normalerweise erst,
   * nachdem der Benutzer vorher geklickt hat.
   *
   * Deshalb erzeugen wir den Gong hier über Web Audio.
   */

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    const audio =
      new AudioContext();

    const oscillator =
      audio.createOscillator();

    const gain =
      audio.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      180,
      audio.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      80,
      audio.currentTime + 1.4
    );

    gain.gain.setValueAtTime(
      0.001,
      audio.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.6,
      audio.currentTime + 0.1
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audio.currentTime + 1.5
    );

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.start();

    oscillator.stop(
      audio.currentTime + 1.6
    );

  } catch (error) {

    console.log(
      "Audio konnte nicht gestartet werden.",
      error
    );

  }

}


/* ==========================================
   EINSATZ STARTEN
========================================== */

function startMission(mission) {

  state.mission = mission;

  state.freeGame.activeMission = true;

  missionTitle.textContent =
    `${mission.icon} ${mission.name}`;

  missionDescription.textContent =
    mission.description;

  missionInfo.classList.remove("hidden");

  missionLocation.classList.remove("hidden");

  gameStatus.textContent =
    `Einsatz läuft: ${mission.name}`;

  /*
   * Kamera zur Einsatzstelle bewegen.
   */

  setTimeout(() => {

    focusMission();

  }, 500);

}


/* ==========================================
   KAMERA
========================================== */

function resetCamera() {

  state.camera.x = -800;
  state.camera.y = -500;
  state.camera.zoom = 0.65;

  updateCamera();

}


function updateCamera() {

  world.style.transform =
    `translate(${state.camera.x}px, ${state.camera.y}px) scale(${state.camera.zoom})`;

}


/* =========================
   MAUSRAD
========================= */

worldViewport.addEventListener(
  "wheel",
  event => {

    event.preventDefault();

    const zoomSpeed = 0.08;

    if (event.deltaY < 0) {

      state.camera.zoom += zoomSpeed;

    } else {

      state.camera.zoom -= zoomSpeed;

    }

    state.camera.zoom =
      Math.max(
        0.35,
        Math.min(1.5, state.camera.zoom)
      );

    updateCamera();

  },
  { passive: false }
);


/* =========================
   KAMERA DRAG
========================= */

worldViewport.addEventListener(
  "pointerdown",
  event => {

    /*
     * Nicht ziehen, wenn direkt ein Fahrzeug
     * oder Button angeklickt wurde.
     */

    if (
      event.target.closest(".vehicle") ||
      event.target.closest("button")
    ) {
      return;
    }

    state.camera.dragging = true;

    state.camera.lastX = event.clientX;
    state.camera.lastY = event.clientY;

    worldViewport.classList.add("dragging");

  }
);


worldViewport.addEventListener(
  "pointermove",
  event => {

    if (!state.camera.dragging) {
      return;
    }

    const dx =
      event.clientX - state.camera.lastX;

    const dy =
      event.clientY - state.camera.lastY;

    state.camera.x += dx;
    state.camera.y += dy;

    state.camera.lastX = event.clientX;
    state.camera.lastY = event.clientY;

    updateCamera();

  }
);


worldViewport.addEventListener(
  "pointerup",
  stopCameraDrag
);

worldViewport.addEventListener(
  "pointercancel",
  stopCameraDrag
);


function stopCameraDrag() {

  state.camera.dragging = false;

  worldViewport.classList.remove("dragging");

}


/* ==========================================
   WASD / PFEILTASTEN
========================================== */

window.addEventListener("keydown", event => {

  if (!gameScreen.classList.contains("active")) {
    return;
  }

  const speed = 25;

  switch (event.key.toLowerCase()) {

    case "w":
    case "arrowup":
      state.camera.y += speed;
      break;

    case "s":
    case "arrowdown":
      state.camera.y -= speed;
      break;

    case "a":
    case "arrowleft":
      state.camera.x += speed;
      break;

    case "d":
    case "arrowright":
      state.camera.x -= speed;
      break;

    default:
      return;

  }

  event.preventDefault();

  updateCamera();

});


/* ==========================================
   ZUR EINSATZSTELLE
========================================== */

function focusMission() {

  /*
   * Einfache Kamerafahrt.
   */

  const startX = state.camera.x;
  const startY = state.camera.y;

  const targetX = -1450;
  const targetY = -300;

  const duration = 1800;

  const startTime = performance.now();

  function animate(now) {

    const progress =
      Math.min(
        (now - startTime) / duration,
        1
      );

    const eased =
      1 - Math.pow(1 - progress, 3);

    state.camera.x =
      startX +
      (targetX - startX) * eased;

    state.camera.y =
      startY +
      (targetY - startY) * eased;

    updateCamera();

    if (progress < 1) {

      requestAnimationFrame(animate);

    }

  }

  requestAnimationFrame(animate);

}


/* ==========================================
   START
========================================== */

showScreen(mainMenu);
