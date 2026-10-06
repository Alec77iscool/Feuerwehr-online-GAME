import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';

const menu=document.querySelector('#menu'), game=document.querySelector('#game');
const canvas=document.querySelector('#canvas'), vehiclePanel=document.querySelector('#vehiclePanel'), missionPanel=document.querySelector('#missionPanel');
const help=document.querySelector('.help');
let scene,camera,renderer,controls,raycaster,mouse,station,garageMeshes=[],roadMeshes=[],groundMesh;
let activeMission=null,incidentGroup=null,placementMode=null,lastDispatchedVehicle=null;
let deployedVehicles=new Map(),selectedVehicleIndices=new Set(),fireFlames=[],smokeMeshes=[];
let activeMode=null,animationFrame=0,lastFrameAt=0;

const vehicles=[
 ['ELW 1','ELW',2],['ELW 2','ELW',2],['DLK 1','DLK',2],['DLK 2','DLK',2],
 ['LRF 1','LRF',5],['LRF 2','LRF',5],['LRF 3','LRF',5],['LRF 4','LRF',5],
 ['HLF 1','HLF',5],['HLF 2','HLF',5],['HLF 3','HLF',5],['HLF 4','HLF',5],
 ['RTW 1','RTW',2],['RTW 2','RTW',2],['NEF 1','NEF',2]
];

const missionData=[
 {id:'bin',title:'Kleinbrand',desc:'Mülltonnenbrand an der Hauptstraße',severity:'Klein',icon:'🔥',locationName:'Hauptstraße',location:{x:18,z:7}},
 {id:'apartment',title:'Wohnungsbrand',desc:'Brand in einem Mehrfamilienhaus · Menschenleben in Gefahr',severity:'Mittel',icon:'🏠🔥',locationName:'Mehrfamilienhaus · Nordviertel',location:{x:-14,z:-29}},
 {id:'forest',title:'Waldbrand',desc:'Waldbrand am Rand des Waldstücks · Hydrant in der Nähe',severity:'Groß',icon:'🌲🔥',locationName:'Waldweg · Hydrant',location:{x:25,z:-23}},
 {id:'crash',title:'Verkehrsunfall',desc:'Verkehrsunfall mit mehreren Verletzten auf der Nordstraße',severity:'Mittel',icon:'🚗🚑',locationName:'Nordstraße',location:{x:-20,z:-12}},
 {id:'mall',title:'Großbrand Einkaufszentrum',desc:'Brand am Einkaufszentrum · mehrere Verletzte · Drehleiter empfohlen',severity:'Groß',icon:'🏬🔥',locationName:'Einkaufszentrum · Ostseite',location:{x:34,z:-26}}
];

function mat(color){return new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.05})}
function box(w,h,d,color){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color))}
function addLabel(text,x,y,z,scale=1,parent=scene){
 const c=document.createElement('canvas'); c.width=512;c.height=128; const ctx=c.getContext('2d');
 ctx.fillStyle='#ffffff';ctx.font='bold 54px Arial';ctx.textAlign='center';ctx.fillText(text,256,75);
 const tex=new THREE.CanvasTexture(c); const m=new THREE.SpriteMaterial({map:tex,transparent:true}); const s=new THREE.Sprite(m);s.position.set(x,y,z);s.scale.set(4*scale,1*scale,1);parent.add(s); return s;
}
function createScene(){
 if(animationFrame)cancelAnimationFrame(animationFrame);
 if(controls)controls.dispose();
 garageMeshes=[];roadMeshes=[];fireFlames=[];smokeMeshes=[];
 deployedVehicles.clear();selectedVehicleIndices.clear();activeMission=null;incidentGroup=null;
 scene=new THREE.Scene();scene.background=new THREE.Color(0x91c8df);
 scene.fog=new THREE.Fog(0x91c8df,70,180);
 camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,400);camera.position.set(38,42,48);
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;canvas.innerHTML='';canvas.appendChild(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.47;controls.minDistance=12;controls.maxDistance=145;
 scene.add(new THREE.HemisphereLight(0xccecff,0x31522a,2.2));const sun=new THREE.DirectionalLight(0xffffff,2.4);sun.position.set(30,60,20);sun.castShadow=true;scene.add(sun);
 groundMesh=box(150,.4,150,0x4f9549);groundMesh.position.y=-.3;groundMesh.receiveShadow=true;scene.add(groundMesh);
 // Straßen
 for(const [x,z,w,d] of [[0,5,150,9],[-20,-25,9,90],[34,20,9,100]]){const r=box(w,.05,d,0x3c4145);r.position.set(x,0,z);scene.add(r);roadMeshes.push(r)}
 // buildings
 [[-52,-40,22,18,0xd8cbb5],[-22,-43,20,16,0xcbb99d],[42,-39,24,20,0xd8d0c0],[55,5,25,18,0xc9d4d7],[-48,28,30,20,0xd4c7ad]].forEach(([x,z,w,d,c])=>{let b=box(w,7,d,c);b.position.set(x,3.5,z);b.castShadow=true;scene.add(b)});
 addLabel('MEHRFAMILIENHAUS',-22,9,-43,.55);
 addLabel('EINKAUFSZENTRUM',42,9,-39,.55);
 // park / forest
 const park=box(45,.1,28,0x3e883d);park.position.set(5,-.01,-37);scene.add(park);
 const trunkMat=mat(0x60432d),leafMat=mat(0x205c2c),leafLightMat=mat(0x2f7838);
 for(let i=0;i<24;i++){
  const tree=new THREE.Group(),height=4+Math.random()*2.5;
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.34,2.2,7),trunkMat);trunk.position.y=1.1;tree.add(trunk);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(1.1+Math.random()*.45,height,7),i%3===0?leafLightMat:leafMat);crown.position.y=2.5+height/2;tree.add(crown);
  tree.position.set(-15+Math.random()*40,0,-50+Math.random()*25);tree.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(tree);
 }
 // station
 station=new THREE.Group();station.position.set(-2,0,22);scene.add(station);
 const main=box(45,10,18,0xb7b9b8);main.position.y=5;main.castShadow=true;station.add(main);
 const roof=box(46,1,19,0xb62222);roof.position.y=10.5;station.add(roof);
 for(let i=0;i<8;i++){let door=box(4.1,7.3,.45,0x263139);door.position.set(-17.5+i*5,4,-9.2);door.userData.vehicleIndex=i;door.userData.baseY=4;door.castShadow=true;station.add(door);garageMeshes.push(door)}
 // sign
 addLabel('FEUERWEHR • RETTUNGSDIENST',0,13,20,.9);
 // hydrant
 const hydrant=box(1.1,1.5,1.1,0xc32626);hydrant.position.set(30,.75,-16);scene.add(hydrant);addLabel('HYDRANT',30,3,-16,.45);
 raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();placementMode=null;lastDispatchedVehicle=null;
 renderer.domElement.addEventListener('pointerdown',onPointer);
 addLabel('WACHE',-2,17,22,1);
 document.querySelector('#clock').textContent=activeMode==='free'?'00:10:00':'EINSATZ';
 if(help)help.textContent='Klicke auf ein Garagentor • Ziehen = Kamera drehen • Mausrad = zoomen';
 lastFrameAt=0;
 animate();
}
function onPointer(e){
 if(!renderer||!camera||!raycaster)return;
 const rect=renderer.domElement.getBoundingClientRect();
 mouse.x=((e.clientX-rect.left)/rect.width)*2-1;mouse.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(mouse,camera);
 if(placementMode!==null){
  const roadHit=raycaster.intersectObjects(roadMeshes,false)[0];
  if(roadHit){
   const truck=deployedVehicles.get(placementMode);
    if(truck){truck.position.set(roadHit.point.x,.08,roadHit.point.z);truck.userData.state='positioniert';updateMissionStatus();}
   placementMode=null;if(help)help.textContent='Klicke auf ein Garagentor • Ziehen = Kamera drehen • Mausrad = zoomen';
   renderMissionPanel();return;
  }
 }
 const hit=raycaster.intersectObjects(garageMeshes,false)[0];
 if(hit)showVehicle(hit.object.userData.vehicleIndex);
}
function showVehicle(i){
 const index=i%vehicles.length,v=vehicles[index],alreadyOut=deployedVehicles.has(index);vehiclePanel.classList.remove('hidden');
 vehiclePanel.innerHTML=`<h2>🚒 ${v[0]}</h2><p><b>${v[1]}</b> · Besatzung ${v[2]} Personen</p>
 ${activeMission?`<button class="option" id="deploy" ${alreadyOut?'disabled':''}>${alreadyOut?'✓ Bereits alarmiert':'▶ Zu diesem Einsatz alarmieren'}</button>`:'<p>Wähle zuerst einen Einsatz, damit das Fahrzeug ein Ziel erhält.</p><button class="option" id="chooseMission">🚨 Einsatz auswählen</button>'}
 <button class="option" id="closeV">Schließen</button>`;
 document.querySelector('#closeV').onclick=()=>vehiclePanel.classList.add('hidden');
 if(activeMission&&!alreadyOut)document.querySelector('#deploy').onclick=()=>{vehiclePanel.classList.add('hidden');dispatchVehicle(index);renderMissionPanel();playDispatchAlarm()};
 if(!activeMission)document.querySelector('#chooseMission').onclick=()=>{vehiclePanel.classList.add('hidden');openMissionMenu()};
}

// --- Navigation ------------------------------------------------------------
function enterGame(mode){
  destroyScene();
  activeMode=mode;
  activeMission=null;
  remaining=600;
  menu.classList.remove('active');
  game.classList.add('active');
  createScene();
  if(mode==='missions') setTimeout(openMissionMenu,250);
}

document.querySelector('#freePlay').addEventListener('click',()=>enterGame('free'));
document.querySelector('#missions').addEventListener('click',()=>enterGame('missions'));

document.querySelector('#back').addEventListener('click',()=>{
  game.classList.remove('active');
  menu.classList.add('active');
  vehiclePanel.classList.add('hidden');
  missionPanel.classList.add('hidden');
  destroyScene();
  activeMode=null;
});

function destroyScene(){
  if(animationFrame)cancelAnimationFrame(animationFrame);
  animationFrame=0;
  if(controls){controls.dispose();controls=null}
  if(renderer){renderer.dispose();renderer.domElement?.remove();renderer=null}
  scene=null;camera=null;raycaster=null;station=null;groundMesh=null;
  garageMeshes=[];roadMeshes=[];incidentGroup=null;deployedVehicles.clear();
}

// --- Einsatzmenü -----------------------------------------------------------
function openMissionMenu(){
  vehiclePanel.classList.add('hidden');
  missionPanel.classList.remove('hidden');
  missionPanel.innerHTML=`
    <h2>🚨 Einsatz auswählen</h2>
    <p>Jeder Einsatz hat einen eigenen Ort und eine passende Lage auf der 3D-Karte.</p>
    ${missionData.map((m,i)=>`
      <button class="option mission" data-i="${i}">
        ${m.icon} <b>${m.title}</b> <span class="tag">${m.severity}</span><br>
        <small>${m.desc}</small>
      </button>`).join('')}
    <button class="option" id="closeM">← Zurück</button>`;
  document.querySelectorAll('.mission').forEach(b=>{
    b.addEventListener('click',()=>activateMission(missionData[Number(b.dataset.i)]));
  });
  document.querySelector('#closeM').addEventListener('click',()=>missionPanel.classList.add('hidden'));
}

document.querySelector('#missionBtn').addEventListener('click',openMissionMenu);

// --- Einsätze: eigene Orte, Szenen und Aktionen ---------------------------
function activateMission(m){
  activeMission=m;placementMode=null;selectedVehicleIndices.clear();lastDispatchedVehicle=null;
  for(const truck of deployedVehicles.values())scene.remove(truck);
  deployedVehicles.clear();
  if(incidentGroup)scene.remove(incidentGroup);
  fireFlames=[];smokeMeshes=[];
  createIncident(m);
  const midX=(station.position.x+m.location.x)/2,midZ=(station.position.z+m.location.z)/2;
  controls.target.set(midX,0,midZ);
  camera.position.set(midX+42,48,midZ+50);
  controls.update();
  renderMissionPanel();
}

function renderMissionPanel(){
  if(!activeMission)return;
  const arrived=[...deployedVehicles.values()].filter(truck=>truck.userData.state==='vor Ort'||truck.userData.state==='positioniert').length;
  missionPanel.classList.remove('hidden');
  missionPanel.innerHTML=`
    <h2>${activeMission.icon} ${activeMission.title}</h2>
    <p>${activeMission.desc}</p>
    <div class="alarm" id="missionStatus">EINSATZORT: <b>${activeMission.locationName}</b><br>Alarmiert: <b>${deployedVehicles.size}</b> · am Ort: <b>${arrived}</b></div>
    <button class="option" id="chooseVehicle">🚒 Fahrzeuge auswählen / alarmieren</button>
    <button class="option" id="position" ${deployedVehicles.size?'':'disabled'}>📍 Letztes Fahrzeug auf der Straße positionieren</button>
    <button class="option" id="focusSite">🎯 Einsatzort ansehen</button>
    <button class="option" id="closeM">Schließen</button>`;
  document.querySelector('#closeM').onclick=()=>missionPanel.classList.add('hidden');
  document.querySelector('#chooseVehicle').onclick=openVehicleAlarm;
  const positionButton=document.querySelector('#position');
  if(deployedVehicles.size)positionButton.onclick=startPositioning;
  document.querySelector('#focusSite').onclick=focusMissionSite;
}

function updateMissionStatus(){
  const status=document.querySelector('#missionStatus');
  if(!status||!activeMission)return;
  const arrived=[...deployedVehicles.values()].filter(truck=>truck.userData.state==='vor Ort'||truck.userData.state==='positioniert').length;
  status.innerHTML=`EINSATZORT: <b>${activeMission.locationName}</b><br>Alarmiert: <b>${deployedVehicles.size}</b> · am Ort: <b>${arrived}</b>`;
}

function focusMissionSite(){
  if(!activeMission||!controls)return;
  controls.target.set(activeMission.location.x,0,activeMission.location.z);
  camera.position.set(activeMission.location.x+28,34,activeMission.location.z+34);
  controls.update();
}

function startPositioning(){
  if(!deployedVehicles.size)return;
  const index=lastDispatchedVehicle??deployedVehicles.keys().next().value;
  placementMode=index;missionPanel.classList.add('hidden');
  if(help)help.textContent=`Klicke auf eine Straße, um ${vehicles[index][0]} dort abzustellen.`;
}

function createIncident(mission){
  incidentGroup=new THREE.Group();scene.add(incidentGroup);
  const {x,z}=mission.location;
  const marker=new THREE.Mesh(new THREE.CylinderGeometry(6.8,6.8,.08,32),new THREE.MeshStandardMaterial({color:0xd7442e,transparent:true,opacity:.2}));
  marker.position.set(x,.08,z);incidentGroup.add(marker);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(6.1,.12,8,48),new THREE.MeshStandardMaterial({color:0xffd358,emissive:0x8a4c05}));
  ring.rotation.x=Math.PI/2;ring.position.set(x,.2,z);incidentGroup.add(ring);
  addLabel(`EINSATZ: ${mission.title.toUpperCase()}`,x,11,z,.62,incidentGroup);
  if(mission.id==='bin'){
    const bin=box(1.5,1.3,1.1,0x33454a);bin.position.set(x,0.7,z+1);incidentGroup.add(bin);
    addFireEffect(incidentGroup,x,z,.75);
  }else if(mission.id==='apartment'){
    addFireEffect(incidentGroup,x+4,z-5,1.15);
    addFireEffect(incidentGroup,x+5,z-3,.75);
  }else if(mission.id==='forest'){
    addFireEffect(incidentGroup,x-2,z,1);
    addFireEffect(incidentGroup,x+2,z+3,.8);
    addFireEffect(incidentGroup,x+4,z-2,.65);
  }else if(mission.id==='crash'){
    addCivilianCar(incidentGroup,x-2,z,0x315b86,-.16);
    addCivilianCar(incidentGroup,x+2,z+2,0x9c3030,.55);
    for(let i=0;i<3;i++){
      const cone=new THREE.Mesh(new THREE.ConeGeometry(.38,.9,6),mat(0xff8d22));
      cone.position.set(x-4+i*4,.45,z+5);incidentGroup.add(cone);
    }
  }else if(mission.id==='mall'){
    addFireEffect(incidentGroup,x+7,z-5,1.5);
    addFireEffect(incidentGroup,x+5,z-2,1.1);
    addFireEffect(incidentGroup,x+8,z-1,.8);
  }
}

function addFireEffect(parent,x,z,scale=1){
  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.8*scale,2.2*scale,.12,16),mat(0x2c2722));
  base.position.set(x,.1,z);parent.add(base);
  const fire=new THREE.Group();fire.position.set(x,0,z);parent.add(fire);
  for(let i=0;i<3;i++){
    const color=i===1?0xffc23a:0xff5a16;
    const flame=new THREE.Mesh(new THREE.ConeGeometry((.48+i*.09)*scale,(2.1+i*.3)*scale,7),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.5}));
    flame.position.set((i-1)*.48*scale,1.05*scale,((i%2)*.35-.15)*scale);fire.add(flame);fireFlames.push(flame);
  }
  for(let i=0;i<3;i++){
    const smoke=new THREE.Mesh(new THREE.SphereGeometry((.65+i*.13)*scale,8,8),new THREE.MeshStandardMaterial({color:0x55545a,transparent:true,opacity:.56}));
    smoke.position.set((i-1)*.32*scale,(2.4+i*.72)*scale,0);smoke.userData.baseY=smoke.position.y;smoke.userData.phase=i*.9;fire.add(smoke);smokeMeshes.push(smoke);
  }
}

function addCivilianCar(parent,x,z,color,rotation){
  const car=new THREE.Group(),shell=box(1.8,.9,3.6,color);shell.position.y=.75;car.add(shell);
  const roof=box(1.5,.8,1.75,0x26343d);roof.position.set(0,1.55,.05);car.add(roof);
  for(const sx of [-.92,.92])for(const sz of [-1.08,1.08]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.22,10),mat(0x17191b));wheel.rotation.z=Math.PI/2;wheel.position.set(sx,.35,sz);car.add(wheel);
  }
  car.position.set(x,0,z);car.rotation.y=rotation;car.traverse(o=>{if(o.isMesh)o.castShadow=true});parent.add(car);
}

// Fahrzeuge für den Einsatz auswählen
function openVehicleAlarm(){
  if(!activeMission){openMissionMenu();return}
  selectedVehicleIndices.clear();
  missionPanel.classList.remove('hidden');
  missionPanel.innerHTML=`
    <h2>🚒 Fahrzeuge alarmieren</h2>
    <p>Wähle Fahrzeuge. Sie fahren auf der 3D-Karte vom Gerätehaus zum Einsatzort.</p>
    <div class="vehicle-list">${vehicles.map((v,i)=>{
      const out=deployedVehicles.has(i);
      return `<button class="option vehicleAlarm" data-i="${i}" ${out?'disabled':''}>${out?'✓':'🚒'} <b>${v[0]}</b> · ${v[1]} · ${v[2]} Einsatzkräfte${out?' · bereits unterwegs':''}</button>`;
    }).join('')}</div>
    <button class="option" id="dispatchSelected" disabled>🚨 Auswahl alarmieren (0)</button>
    <button class="option" id="cancelAlarm">← Zurück zum Einsatz</button>`;
  const dispatchButton=document.querySelector('#dispatchSelected');
  document.querySelectorAll('.vehicleAlarm').forEach(button=>{
    button.onclick=()=>{
      const index=Number(button.dataset.i);
      if(selectedVehicleIndices.has(index)){
        selectedVehicleIndices.delete(index);button.classList.remove('selected');button.setAttribute('aria-pressed','false');
      }else{
        selectedVehicleIndices.add(index);button.classList.add('selected');button.setAttribute('aria-pressed','true');
      }
      dispatchButton.disabled=selectedVehicleIndices.size===0;
      dispatchButton.textContent=`🚨 Auswahl alarmieren (${selectedVehicleIndices.size})`;
    };
  });
  dispatchButton.onclick=dispatchSelectedVehicles;
  document.querySelector('#cancelAlarm').onclick=renderMissionPanel;
}

function dispatchSelectedVehicles(){
  const chosen=[...selectedVehicleIndices];selectedVehicleIndices.clear();
  if(!chosen.length)return;
  chosen.forEach(dispatchVehicle);
  playDispatchAlarm();renderMissionPanel();
}

function dispatchVehicle(index){
  if(!activeMission||deployedVehicles.has(index)||!scene)return false;
  const bay=garageMeshes[index%garageMeshes.length];
  station.updateMatrixWorld(true);bay.updateWorldMatrix(true,false);
  const start=new THREE.Vector3();bay.getWorldPosition(start);start.set(start.x,0,start.z-2.6);
  const truck=createVehicleModel(index,start);
  const slots=[[-5,3],[5,3],[-5,-3],[5,-3],[0,7],[0,-7],[9,0],[-9,0]];
  const slot=slots[deployedVehicles.size%slots.length];
  const destination=new THREE.Vector3(activeMission.location.x+slot[0],0,activeMission.location.z+slot[1]);
  const route=[start.clone(),new THREE.Vector3(start.x,0,6.5)];
  if(Math.abs(activeMission.location.z-5)<8){
    route.push(new THREE.Vector3(destination.x,0,6.5));
  }else{
    const roadX=Math.abs(activeMission.location.x+20)<Math.abs(activeMission.location.x-34)?-20:34;
    route.push(new THREE.Vector3(roadX,0,6.5),new THREE.Vector3(roadX,0,activeMission.location.z));
  }
  route.push(destination);
  truck.userData.route=route;truck.userData.routeIndex=1;truck.userData.speed=16;truck.userData.state='rückt aus';
  scene.add(truck);deployedVehicles.set(index,truck);lastDispatchedVehicle=index;
  bay.userData.openUntil=performance.now()+2200;
  return true;
}

function createVehicleModel(index,start){
  const spec=vehicles[index],group=new THREE.Group(),isMedical=spec[1]==='RTW'||spec[1]==='NEF';
  const body=box(2.2,1.2,4.4,isMedical?0xe6e8e9:0xc62828);body.position.y=.95;group.add(body);
  const cab=box(2.05,1.25,1.9,isMedical?0xf4f4f0:0xe5e7e7);cab.position.set(0,1.72,-1.1);group.add(cab);
  const windshield=new THREE.Mesh(new THREE.BoxGeometry(1.72,.65,.08),mat(0x233945));windshield.position.set(0,1.92,-2.07);group.add(windshield);
  const stripe=box(2.22,.18,3.6,isMedical?0xe33b31:0xf2f2e9);stripe.position.set(0,1.12,.05);group.add(stripe);
  const wheelMat=mat(0x171c20);
  for(const x of [-1.08,1.08])for(const z of [-1.35,1.35]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.3,12),wheelMat);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.47,z);group.add(wheel);
  }
  const blueMat=new THREE.MeshStandardMaterial({color:0x248bff,emissive:0x126bff,emissiveIntensity:.6});
  const redMat=new THREE.MeshStandardMaterial({color:0xff2828,emissive:0xff1717,emissiveIntensity:.6});
  const blue=new THREE.Mesh(new THREE.BoxGeometry(.72,.2,.25),blueMat);blue.position.set(-.42,2.4,-.9);group.add(blue);
  const red=new THREE.Mesh(new THREE.BoxGeometry(.72,.2,.25),redMat);red.position.set(.42,2.4,-.9);group.add(red);
  group.position.copy(start);group.userData.flashers=[blue,red];group.userData.name=spec[0];
  group.traverse(o=>{if(o.isMesh)o.castShadow=true});
  return group;
}

function playDispatchAlarm(){
  const AudioContextType=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextType)return;
  try{
    const context=new AudioContextType(),now=context.currentTime;
    [740,520,740].forEach((frequency,i)=>{
      const oscillator=context.createOscillator(),gain=context.createGain(),start=now+i*.28;
      oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,start);
      gain.gain.exponentialRampToValueAtTime(.12,start+.025);gain.gain.exponentialRampToValueAtTime(.0001,start+.21);
      oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+.23);
    });
    setTimeout(()=>context.close(),1100);
  }catch(error){console.warn('Einsatzsignal konnte nicht abgespielt werden.',error)}
}

function updateMovingVehicles(delta,time){
  for(const door of garageMeshes){
    if(!door.userData.openUntil)continue;
    const targetY=time*1000<door.userData.openUntil?door.userData.baseY+6.5:door.userData.baseY;
    door.position.y+=(targetY-door.position.y)*Math.min(1,delta*5);
    if(time*1000>=door.userData.openUntil&&Math.abs(door.position.y-door.userData.baseY)<.05){
      door.position.y=door.userData.baseY;door.userData.openUntil=0;
    }
  }
  for(const [index,truck] of deployedVehicles){
    const route=truck.userData.route;
    if(truck.userData.routeIndex<route.length){
      let budget=truck.userData.speed*delta;
      while(budget>0&&truck.userData.routeIndex<route.length){
        const target=route[truck.userData.routeIndex],direction=target.clone().sub(truck.position),distance=direction.length();
        if(distance<.08){truck.position.copy(target);truck.userData.routeIndex++;continue}
        direction.normalize();const step=Math.min(distance,budget);truck.position.addScaledVector(direction,step);budget-=step;
        truck.rotation.y=Math.atan2(-direction.x,-direction.z);
        if(step===distance)truck.userData.routeIndex++;
      }
      if(truck.userData.routeIndex>=route.length&&truck.userData.state!=='vor Ort'){truck.userData.state='vor Ort';updateMissionStatus()}
    }
    const flash=Math.floor(time*5+index)%2===0;
    truck.userData.flashers.forEach((light,i)=>{light.visible=flash===(i===0)});
  }
  fireFlames.forEach((flame,i)=>{
    const pulse=1+Math.sin(time*5+i)*.12;
    flame.scale.set(pulse,1+Math.sin(time*6+i)*.16,pulse);
  });
  smokeMeshes.forEach(smoke=>{
    smoke.position.y=smoke.userData.baseY+((time*.55+smoke.userData.phase)%1.8);
    smoke.scale.setScalar(.75+((time+smoke.userData.phase)%1.4)*.24);
  });
}

function animate(time=0){
  animationFrame=requestAnimationFrame(animate);
  if(!renderer||!controls)return;
  const delta=lastFrameAt?Math.min((time-lastFrameAt)/1000,.1):0;lastFrameAt=time;
  controls.update();updateMovingVehicles(delta,time/1000);renderer.render(scene,camera);
}

// --- Bereitschafts-Timer: 10 Minuten im freien Spiel ---------------------
let remaining=600;
setInterval(()=>{
  if(game.classList.contains('active')&&activeMode==='free'&&remaining>0){
    remaining--;
    const m=Math.floor(remaining/60),s=remaining%60;
    document.querySelector('#clock').textContent=
      `00:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
},1000);

addEventListener('resize',()=>{if(camera&&renderer){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}});
