/* ==========================================
   KARTE ERSTELLEN
========================================== */

function createMap() {

  if (!world) return;

  // Alte Karte löschen
  world.querySelectorAll(".map-object").forEach(el => {
    el.remove();
  });

  // Hintergrund
  world.style.width = "2400px";
  world.style.height = "1400px";

  // Straßen
  createMapObject(
    "road horizontal",
    0, 570, 2400, 150
  );

  createMapObject(
    "road horizontal",
    0, 970, 2400, 110
  );

  createMapObject(
    "road vertical",
    650, 0, 140, 1400
  );

  createMapObject(
    "road vertical",
    1500, 0, 120, 1400
  );

  // Gebäude
  createBuilding(
    "🚒 FEUERWEHRWACHE",
    700, 440, 500, 300,
    "station"
  );

  createBuilding(
    "🏠 Wohngebiet",
    200, 100, 330, 190
  );

  createBuilding(
    "🏠 Wohnhaus",
    200, 780, 330, 160
  );

  createBuilding(
    "🏫 Schule",
    900, 100, 300, 180
  );

  createBuilding(
    "🏥 Krankenhaus",
    1330, 150, 320, 220
  );

  createBuilding(
    "🏬 Einkaufszentrum",
    1730, 130, 400, 260
  );

  createBuilding(
    "🏭 Industriehalle",
    1740, 830, 380, 240
  );

  createBuilding(
    "🏭 Lagerhalle",
    1080, 1120, 320, 170
  );

  // Wasser
  createMapObject(
    "water",
    1770, 520, 500, 250
  );

  // Bäume
  const trees = [
    [70, 100],
    [130, 170],
    [570, 90],
    [610, 190],
    [70, 760],
    [120, 850],
    [580, 800],
    [620, 900],
    [1450, 60],
    [2160, 70],
    [2220, 430],
    [2250, 900],
    [1570, 1120],
    [1630, 1190],
    [800, 1120],
    [930, 1080],
    [2050, 1120],
    [2150, 1190]
  ];

  trees.forEach(([x, y]) => {
    createTree(x, y);
  });

  // Straßenbeschriftungen
  createLabel(
    "Hauptstraße",
    1000,
    525
  );

  createLabel(
    "Feuerwehrstraße",
    760,
    915
  );

  createLabel(
    "Industriestraße",
    1660,
    1085
  );

  createLabel(
    "Nordallee",
    1520,
    45
  );
}


/* ==========================================
   KARTENOBJEKT
========================================== */

function createMapObject(
  className,
  x,
  y,
  width,
  height
) {

  const object =
    document.createElement("div");

  object.className =
    `map-object ${className}`;

  object.style.position = "absolute";

  object.style.left =
    `${x}px`;

  object.style.top =
    `${y}px`;

  object.style.width =
    `${width}px`;

  object.style.height =
    `${height}px`;

  world.insertBefore(
    object,
    vehicleArea
  );

  return object;
}


/* ==========================================
   GEBÄUDE
========================================== */

function createBuilding(
  name,
  x,
  y,
  width,
  height,
  type = ""
) {

  const building =
    document.createElement("div");

  building.className =
    `map-object building ${type}`;

  building.style.position =
    "absolute";

  building.style.left =
    `${x}px`;

  building.style.top =
    `${y}px`;

  building.style.width =
    `${width}px`;

  building.style.height =
    `${height}px`;

  building.style.display =
    "flex";

  building.style.alignItems =
    "center";

  building.style.justifyContent =
    "center";

  building.style.textAlign =
    "center";

  building.style.color =
    "white";

  building.style.fontWeight =
    "bold";

  building.style.fontSize =
    "16px";

  building.style.background =
    type === "station"
      ? "#252c35"
      : "#414b56";

  building.style.border =
    type === "station"
      ? "4px solid #d71920"
      : "3px solid #606b77";

  building.style.borderRadius =
    "8px";

  building.style.boxShadow =
    "0 10px 25px rgba(0,0,0,.35)";

  building.textContent =
    name;

  world.insertBefore(
    building,
    vehicleArea
  );

  // Bei der Feuerwehrwache zusätzlich Tore
  if (type === "station") {

    for (let i = 0; i < 4; i++) {

      const door =
        document.createElement("div");

      door.className =
        "garage-door";

      door.style.position =
        "absolute";

      door.style.bottom =
        "15px";

      door.style.left =
        `${25 + i * 115}px`;

      door.style.width =
        "90px";

      door.style.height =
        "120px";

      door.style.background =
        "#11161c";

      door.style.border =
        "2px solid #65717d";

      door.style.borderRadius =
        "5px";

      building.appendChild(
        door
      );
    }
  }
}


/* ==========================================
   BÄUME
========================================== */

function createTree(x, y) {

  const tree =
    document.createElement("div");

  tree.className =
    "map-object tree";

  tree.style.position =
    "absolute";

  tree.style.left =
    `${x}px`;

  tree.style.top =
    `${y}px`;

  tree.style.width =
    "32px";

  tree.style.height =
    "32px";

  tree.style.borderRadius =
    "50%";

  tree.style.background =
    "#207346";

  tree.style.border =
    "4px solid #2c985d";

  tree.style.boxShadow =
    "0 5px 10px rgba(0,0,0,.35)";

  world.insertBefore(
    tree,
    vehicleArea
  );
}


/* ==========================================
   BESCHRIFTUNG
========================================== */

function createLabel(
  text,
  x,
  y
) {

  const label =
    document.createElement("div");

  label.className =
    "map-object";

  label.style.position =
    "absolute";

  label.style.left =
    `${x}px`;

  label.style.top =
    `${y}px`;

  label.style.color =
    "rgba(255,255,255,.45)";

  label.style.fontSize =
    "13px";

  label.style.fontWeight =
    "bold";

  label.style.letterSpacing =
    "2px";

  label.textContent =
    text;

  world.insertBefore(
    label,
    vehicleArea
  );
}
