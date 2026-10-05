"use strict";

const state={
  screen:"menu",mode:null,
  camera:{x:-350,y:-180,zoom:.72,dragging:false,lastX:0,lastY:0},
  freeGame:{timer:240,timerRunning:false,activeMission:false},
  alarm:{active:false,pagerVisible:false},
  selectedVehicle:null,mission:null,deployedVehicles:new Set()
};

const vehicles=[
{id:"elw1",type:"ELW",name:"ELW 1",color:"#d71920",activity:"Einsatzleitung"},
{id:"hlf1",type:"HLF",name:"HLF 10-1",color:"#d71920",activity:"Brandbekämpfung / TH"},
{id:"hlf2",type:"HLF",name:"HLF 10-2",color:"#d71920",activity:"Brandbekämpfung / TH"},
{id:"dlk1",type:"DLK",name:"DLK 1",color:"#d71920",activity:"Drehleiter"},
{id:"dlk2",type:"DLK",name:"DLK 2",color:"#d71920",activity:"Drehleiter"},
{id:"lhf1",type:"LHF",name:"LHF 1",color:"#d71920",activity:"Brandbekämpfung"},
{id:"lhf2",type:"LHF",name:"LHF 2",color:"#d71920",activity:"Brandbekämpfung"},
{id:"lhf3",type:"LHF",name:"LHF 3",color:"#d71920",activity:"Brandbekämpfung"},
{id:"rtw1",type:"RTW",name:"RTW 1",color:"#f4f4f4",activity:"Patientenversorgung"},
{id:"rtw2",type:"RTW",name:"RTW 2",color:"#f4f4f4",activity:"Patientenversorgung"},
{id:"nef1",type:"NEF",name:"NEF 1",color:"#f4f4f4",activity:"Notarztversorgung"}
];

const missions=[
{id:"traffic",name:"Verkehrsunfall an Kreuzung",category:"Klein",duration:"3–5 Minuten",description:"Verkehrsunfall mit möglicher verletzter Person.",icon:"🚗💥",x:1160,y:720},
{id:"container",name:"Müllcontainerbrand",category:"Klein",duration:"3–5 Minuten",description:"Brennender Müllcontainer mit Ausbreitungsgefahr.",icon:"🗑️🔥",x:1520,y:380},
{id:"kitchen",name:"Küchenbrand",category:"Klein",duration:"3–5 Minuten",description:"Brand in einer Küche mit starker Rauchentwicklung.",icon:"🏠🔥",x:430,y:350},
{id:"hall",name:"Hallenbrand",category:"Mittel",duration:"5–10 Minuten",description:"Brand in einer größeren Halle.",icon:"🏭🔥",x:1740,y:820},
{id:"house",name:"Großbrand Familienhaus",category:"Groß",duration:"5–10 Minuten",description:"Großbrand in einem Familienhaus.",icon:"🏠🔥",x:520,y:850},
{id:"mall",name:"Einkaufszentrum – Großbrand",category:"Groß",duration:"10–20 Minuten",description:"Großflächiger Brand in einem Einkaufszentrum.",icon:"🏬🔥",x:1840,y:300},
{id:"forest",name:"Waldbrand",category:"Groß",duration:"10–20 Minuten",description:"Dynamischer Waldbrand mit Ausbreitungsgefahr.",icon:"🌲🔥",x:2050,y:980},
{id:"bigTraffic",name:"Verkehrsunfall an großer Kreuzung",category:"Groß",duration:"5–10 Minuten",description:"Mehrere Fahrzeuge und mögliche Verletzte.",icon:"🚗💥",x:1300,y:1050}
];

const $=id=>document.getElementById(id);
const mainMenu=$("mainMenu"),missionMenu=$("missionMenu"),gameScreen=$("gameScreen");
const freeGameBtn=$("freeGameBtn"),missionSelectBtn=$("missionSelectBtn"),backFromMissions=$("backFromMissions"),backToMenu=$("backToMenu");
const missionList=$("missionList"),worldViewport=$("worldViewport"),world=$("world"),vehicleArea=$("vehicleArea");
const timerPanel=$("timerPanel"),freeTimer=$("freeTimer"),missionInfo=$("missionInfo"),missionTitle=$("missionTitle"),missionDescription=$("missionDescription"),missionLocation=$("missionLocation");
const pager=$("pager"),pagerMission=$("pagerMission"),pagerButton=$("pagerButton"),vehiclePanel=$("vehiclePanel"),selectedVehicleName=$("selectedVehicleName"),vehicleActions=$("vehicleActions"),closeVehiclePanel=$("closeVehiclePanel"),gameStatus=$("gameStatus");

function showScreen(screen){
  [mainMenu,missionMenu,gameScreen].forEach(e=>e&&e.classList.remove("active"));
  screen&&screen.classList.add("active");
}

function setStatus(t){if(gameStatus)gameStatus.textContent=t;}

function startGame(){
  showScreen(gameScreen);
  state.selectedVehicle=null;
  state.deployedVehicles.clear();
  state.mission=null;
  state.freeGame.activeMission=false;
  state.alarm.active=false;
  state.alarm.pagerVisible=false;
  missionInfo&&missionInfo.classList.add("hidden");
  missionLocation&&missionLocation.classList.add("hidden");
  pager&&pager.classList.add("hidden");
  vehiclePanel&&vehiclePanel.classList.add("hidden");
  setStatus("Wache bereit");
  createMap();
  createVehicles();
  resetCamera();
}

function renderMissionList(){
  if(!missionList)return;
  missionList.innerHTML="";
  missions.forEach(m=>{
    const card=document.createElement("div");
    card.className="mission-card";
    card.innerHTML=`<h3>${m.icon} ${m.name}</h3><p><strong>Kategorie:</strong> ${m.category}<br><strong>Dauer:</strong> ${m.duration}</p><p>${m.description}</p><button data-mission="${m.id}">🚒 Einsatz starten</button>`;
    missionList.appendChild(card);
  });
  missionList.querySelectorAll("[data-mission]").forEach(b=>b.addEventListener("click",()=>{
    const m=missions.find(x=>x.id===b.dataset.mission);
    if(m)startSelectedMission(m);
  }));
}

function startSelectedMission(m){
  state.mode="mission";
  startGame();
  state.mission=m;
  startMission(m);
}

function createMap(){
  if(!world)return;
  world.querySelectorAll(".map-object,.mission-marker").forEach(e=>e.remove());

  const roads=[
    ["horizontal",0,570,2400,150],
    ["horizontal",0,970,2400,110],
    ["horizontal",0,300,2400,80],
    ["horizontal",0,1200,2400,80],
    ["vertical",650,0,140,1400],
    ["vertical",1500,0,120,1400]
  ];
  roads.forEach(r=>createMapObject("road "+r[0],r[1],r[2],r[3],r[4]));

  createMapObject("water",1770,520,500,250);
  createMapObject("water",50,1040,390,180);

  createBuilding("🚒 FEUERWEHRWACHE",700,440,500,300,"station");
  createBuilding("🏠 Wohngebiet",200,100,330,190,"house");
  createBuilding("🏠 Wohnhaus",200,780,330,160,"house");
  createBuilding("🏫 Schule",900,100,300,180);
  createBuilding("🏥 Krankenhaus",1330,150,320,220);
  createBuilding("🏬 Einkaufszentrum",1730,130,400,260,"mall");
  createBuilding("🏭 Industriehalle",1740,830,380,240,"factory");
  createBuilding("🏭 Lagerhalle",1080,1120,320,170,"factory");

  [[70,100],[130,170],[570,90],[610,190],[70,760],[120,850],[580,800],[620,900],[1450,60],[2160,70],[2220,430],[2250,900],[1570,1120],[1630,1190],[800,1120],[930,1080],[2050,1120],[2150,1190]].forEach(p=>createTree(p[0],p[1]));

  [["NORDSTADT",230,55],["ZENTRUM",1080,360],["GEWERBEGEBIET",1740,790],["SÜDSTADT",300,1020]].forEach(p=>createLabel(p[0],p[1],p[2],"map-label"));
  [["Hauptstraße",1000,525],["Feuerwehrstraße",760,915],["Industriestraße",1660,1085],["Nordallee",1520,45]].forEach(p=>createLabel(p[0],p[1],p[2],"street-name"));

  if(gameScreen&&!gameScreen.querySelector(".map-compass")){
    const c=document.createElement("div");c.className="map-compass";c.textContent="N";gameScreen.appendChild(c);
    const h=document.createElement("div");h.className="map-help";h.textContent="Mausrad: Zoom • Ziehen: Karte • WASD/Pfeile: bewegen";gameScreen.appendChild(h);
  }
}

function createMapObject(cls,x,y,w,h){
  const e=document.createElement("div");e.className=`map-object ${cls}`;
  Object.assign(e.style,{left:x+"px",top:y+"px",width:w+"px",height:h+"px"});
  world.insertBefore(e,vehicleArea);return e;
}

function createBuilding(name,x,y,w,h,type=""){
  const e=document.createElement("div");e.className=`map-object building ${type}`;e.textContent=name;
  Object.assign(e.style,{left:x+"px",top:y+"px",width:w+"px",height:h+"px"});
  world.insertBefore(e,vehicleArea);
  if(type==="station"){
    for(let i=0;i<4;i++){
      const d=document.createElement("div");d.className="station-door";d.style.left=(25+i*115)+"px";e.appendChild(d);
    }
  }
}

function createTree(x,y){
  const e=document.createElement("div");e.className="map-object tree";e.style.left=x+"px";e.style.top=y+"px";world.insertBefore(e,vehicleArea);
}

function createLabel(text,x,y,cls){
  const e=document.createElement("div");e.className=`map-object ${cls}`;e.textContent=text;e.style.left=x+"px";e.style.top=y+"px";world.insertBefore(e,vehicleArea);
}

function createVehicles(){
  if(!vehicleArea)return;
  vehicleArea.innerHTML="";
  vehicles.forEach((v,i)=>{
    const e=document.createElement("div");
    e.className="vehicle"+(v.color==="#f4f4f4"?" white":"");
    e.dataset.vehicle=v.id;e.style.background=v.color;
    const col=i%4,row=Math.floor(i/4);
    e.style.left=(790+col*105)+"px";e.style.top=(765+row*58)+"px";
    e.innerHTML=`<div class="blue-light"></div>${v.name}`;
    vehicleArea.appendChild(e);
    e.addEventListener("click",ev=>{ev.stopPropagation();selectVehicle(v,e)});
  });
}

function selectVehicle(v,e){
  state.selectedVehicle=v;
  selectedVehicleName.textContent=`${v.name} – ${v.activity}`;
  vehicleActions.innerHTML="";
  getVehicleActions(v).forEach(a=>{
    const b=document.createElement("button");b.className="vehicle-action";b.textContent=a.name;b.addEventListener("click",()=>a.run(v,e));vehicleActions.appendChild(b);
  });
  vehiclePanel.classList.remove("hidden");
}

function getVehicleActions(v){
  const a=[];
  if(v.type==="ELW")a.push({name:"📡 Einsatzleitung",run:()=>setStatus(`${v.name}: Einsatzleitung aktiv`)});
  if(v.type==="HLF"||v.type==="LHF"){
    a.push({name:"💧 Hydrant anschließen",run:()=>setStatus(`${v.name}: Hydrant angeschlossen`)});
    a.push({name:"🚿 Schnellangriff",run:()=>setStatus(`${v.name}: Schnellangriff eingesetzt`)});
    a.push({name:"🔥 Strahlrohr einsetzen",run:()=>setStatus(`${v.name}: Strahlrohr aktiv`)});
  }
  if(v.type==="HLF")a.push({name:"🛠️ Technische Hilfeleistung",run:()=>setStatus(`${v.name}: Technische Hilfeleistung`)});
  if(v.type==="DLK"){
    a.push({name:"🪜 Leiter ausfahren",run:()=>setStatus(`${v.name}: Leiter wird ausgefahren`)});
    a.push({name:"↔️ Leiter positionieren",run:()=>setStatus(`${v.name}: Leiter positioniert`)});
    a.push({name:"💧 Wasser über DLK",run:()=>setStatus(`${v.name}: Wasserabgabe aktiviert`)});
  }
  if(v.type==="RTW"){
    a.push({name:"🩺 Patientenversorgung",run:()=>setStatus(`${v.name}: Patientenversorgung`)});
    a.push({name:"🚑 Patient aufnehmen",run:()=>setStatus(`${v.name}: Patient aufgenommen`)});
  }
  if(v.type==="NEF"){
    a.push({name:"👨‍⚕️ Notarzt aussteigen",run:()=>setStatus(`${v.name}: Notarzt im Einsatz`)});
    a.push({name:"🩺 Notfallversorgung",run:()=>setStatus(`${v.name}: Notfallversorgung`)});
  }
  a.push({name:"🚒 Ausrücken",run:()=>deployVehicle(v)});
  return a;
}

function deployVehicle(v){
  const e=document.querySelector(`[data-vehicle="${v.id}"]`);
  if(!e)return;
  if(!state.mission){setStatus(`${v.name}: Kein Einsatz aktiv`);return}
  state.deployedVehicles.add(v.id);e.classList.add("driving");vehiclePanel.classList.add("hidden");
  setStatus(`${v.name} rückt aus 🚒`);
  setTimeout(()=>{e.style.left="1240px";e.style.top="760px"},100);
  setTimeout(()=>{e.style.left=state.mission.x+"px";e.style.top=state.mission.y+"px"},1600);
}

function startMission(m){
  state.mission=m;state.freeGame.activeMission=true;
  missionTitle.textContent=`${m.icon} ${m.name}`;
  missionDescription.textContent=m.description;
  missionInfo.classList.remove("hidden");
  missionLocation.textContent=`📍 Einsatzstelle: ${m.name}`;
  missionLocation.classList.remove("hidden");
  createMissionMarker(m);
  setStatus(`Einsatz läuft: ${m.name}`);
  setTimeout(()=>focusMission(m),300);
}

function createMissionMarker(m){
  world.querySelectorAll(".mission-marker").forEach(e=>e.remove());
  const e=document.createElement("div");e.className="mission-marker";e.style.left=m.x+"px";e.style.top=m.y+"px";
  e.innerHTML=`🚨<div class="mission-marker-label">${m.name}</div>`;
  world.appendChild(e);
}

let timerInterval=null;

function startFreeGameTimer(){
  clearInterval(timerInterval);
  state.freeGame.timer=240;state.freeGame.timerRunning=true;state.freeGame.activeMission=false;
  timerPanel.classList.remove("hidden");updateFreeTimer();
  timerInterval=setInterval(()=>{
    if(!state.freeGame.timerRunning||state.freeGame.activeMission)return;
    state.freeGame.timer--;updateFreeTimer();
    if(state.freeGame.timer<=0){clearInterval(timerInterval);createRandomMission()}
  },1000);
}

function updateFreeTimer(){
  const m=Math.floor(state.freeGame.timer/60),s=state.freeGame.timer%60;
  freeTimer.textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function createRandomMission(){
  if(state.freeGame.activeMission)return;
  const m=missions[Math.floor(Math.random()*missions.length)];
  startAlarmSequence(m);
}

function startAlarmSequence(m){
  state.alarm.active=true;state.mission=m;state.freeGame.activeMission=true;setStatus("🚨 EINSATZALARM");playAlarmTone();
  setTimeout(()=>speakMission(m),1200);
  setTimeout(()=>showPager(m),3500);
}

function showPager(m){
  pagerMission.textContent=`${m.icon} ${m.name}`;pager.classList.remove("hidden");state.alarm.pagerVisible=true;setStatus("📟 Einsatzmelder alarmiert");
}

function speakMission(m){
  if(!("speechSynthesis"in window))return;
  speechSynthesis.cancel();
  const s=new SpeechSynthesisUtterance(`Einsatz für die Feuerwehr. ${m.name}.`);
  s.lang="de-DE";s.rate=.85;s.pitch=.8;s.volume=1;speechSynthesis.speak(s);
}

function playAlarmTone(){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    const audio=new AC(),o=audio.createOscillator(),g=audio.createGain();
    o.type="sine";o.frequency.setValueAtTime(180,audio.currentTime);o.frequency.exponentialRampToValueAtTime(80,audio.currentTime+1.4);
    g.gain.setValueAtTime(.001,audio.currentTime);g.gain.exponentialRampToValueAtTime(.55,audio.currentTime+.08);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+1.5);
    o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+1.6);
  }catch(e){console.log("Audio konnte nicht gestartet werden.",e)}
}

function resetCamera(){state.camera.x=-350;state.camera.y=-180;state.camera.zoom=.72;updateCamera()}
function updateCamera(){world.style.transform=`translate(${state.camera.x}px,${state.camera.y}px) scale(${state.camera.zoom})`}

function setupCamera(){
  worldViewport.addEventListener("wheel",e=>{
    e.preventDefault();state.camera.zoom+=e.deltaY<0?.08:-.08;state.camera.zoom=Math.max(.35,Math.min(1.5,state.camera.zoom));updateCamera();
  },{passive:false});
  worldViewport.addEventListener("pointerdown",e=>{
    if(e.target.closest(".vehicle")||e.target.closest("button"))return;
    state.camera.dragging=true;state.camera.lastX=e.clientX;state.camera.lastY=e.clientY;worldViewport.classList.add("dragging");
  });
  worldViewport.addEventListener("pointermove",e=>{
    if(!state.camera.dragging)return;
    state.camera.x+=e.clientX-state.camera.lastX;state.camera.y+=e.clientY-state.camera.lastY;state.camera.lastX=e.clientX;state.camera.lastY=e.clientY;updateCamera();
  });
  ["pointerup","pointercancel"].forEach(x=>worldViewport.addEventListener(x,()=>{state.camera.dragging=false;worldViewport.classList.remove("dragging")}));
}

function focusMission(m){
  const startX=state.camera.x,startY=state.camera.y;
  const vw=worldViewport.clientWidth,vh=worldViewport.clientHeight;
  const tx=vw/2-m.x*state.camera.zoom,ty=vh/2-m.y*state.camera.zoom,start=performance.now(),duration=1100;
  function anim(now){
    const p=Math.min((now-start)/duration,1),e=1-Math.pow(1-p,3);
    state.camera.x=startX+(tx-startX)*e;state.camera.y=startY+(ty-startY)*e;updateCamera();
    if(p<1)requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
}

function setup(){
  freeGameBtn.addEventListener("click",()=>{state.mode="free";startGame();startFreeGameTimer()});
  missionSelectBtn.addEventListener("click",()=>{showScreen(missionMenu);renderMissionList()});
  backFromMissions.addEventListener("click",()=>showScreen(mainMenu));
  backToMenu.addEventListener("click",()=>{clearInterval(timerInterval);showScreen(mainMenu)});
  closeVehiclePanel.addEventListener("click",()=>vehiclePanel.classList.add("hidden"));
  pagerButton.addEventListener("click",()=>{pager.classList.add("hidden");state.alarm.pagerVisible=false;state.alarm.active=false;startMission(state.mission)});
  setupCamera();

  window.addEventListener("keydown",e=>{
    if(!gameScreen.classList.contains("active"))return;
    const speed=28;
    switch(e.key.toLowerCase()){
      case"w":case"arrowup":state.camera.y+=speed;break;
      case"s":case"arrowdown":state.camera.y-=speed;break;
      case"a":case"arrowleft":state.camera.x+=speed;break;
      case"d":case"arrowright":state.camera.x-=speed;break;
      case"+":state.camera.zoom=Math.min(1.5,state.camera.zoom+.08);break;
      case"-":state.camera.zoom=Math.max(.35,state.camera.zoom-.08);break;
      default:return;
    }
    e.preventDefault();updateCamera();
  });
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup);else setup();
