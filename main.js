import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';

const menu=document.querySelector('#menu'), game=document.querySelector('#game');
const canvas=document.querySelector('#canvas'), vehiclePanel=document.querySelector('#vehiclePanel'), missionPanel=document.querySelector('#missionPanel');
let scene,camera,renderer,controls,raycaster,mouse,station,garageMeshes=[];

const vehicles=[
 ['ELW 1','ELW',2],['ELW 2','ELW',2],['DLK 1','DLK',2],['DLK 2','DLK',2],
 ['LRF 1','LRF',5],['LRF 2','LRF',5],['LRF 3','LRF',5],['LRF 4','LRF',5],
 ['HLF 1','HLF',5],['HLF 2','HLF',5],['HLF 3','HLF',5],['HLF 4','HLF',5],
 ['RTW 1','RTW',2],['RTW 2','RTW',2],['NEF 1','NEF',2]
];

function mat(color){return new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.05})}
function box(w,h,d,color){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color))}
function addLabel(text,x,y,z,scale=1){
 const c=document.createElement('canvas'); c.width=512;c.height=128; const ctx=c.getContext('2d');
 ctx.fillStyle='#ffffff';ctx.font='bold 54px Arial';ctx.textAlign='center';ctx.fillText(text,256,75);
 const tex=new THREE.CanvasTexture(c); const m=new THREE.SpriteMaterial({map:tex,transparent:true}); const s=new THREE.Sprite(m);s.position.set(x,y,z);s.scale.set(4*scale,1*scale,1);scene.add(s); return s;
}
function createScene(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x91c8df);
 scene.fog=new THREE.Fog(0x91c8df,70,180);
 camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,400);camera.position.set(38,42,48);
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;canvas.innerHTML='';canvas.appendChild(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.47;controls.minDistance=20;controls.maxDistance=115;
 scene.add(new THREE.HemisphereLight(0xccecff,0x31522a,2.2));const sun=new THREE.DirectionalLight(0xffffff,2.4);sun.position.set(30,60,20);sun.castShadow=true;scene.add(sun);
 const ground=box(150,.4,150,0x4f9549);ground.position.y=-.3;ground.receiveShadow=true;scene.add(ground);
 // Straßen
 for(const [x,z,w,d] of [[0,5,150,9],[-20,-25,9,90],[34,20,9,100]]){const r=box(w,.05,d,0x3c4145);r.position.set(x,0,z);scene.add(r)}
 // buildings
 [[-52,-40,22,18,0xd8cbb5],[-22,-43,20,16,0xcbb99d],[42,-39,24,20,0xd8d0c0],[55,5,25,18,0xc9d4d7],[-48,28,30,20,0xd4c7ad]].forEach(([x,z,w,d,c])=>{let b=box(w,7,d,c);b.position.set(x,3.5,z);b.castShadow=true;scene.add(b)});
 // park / forest
 const park=box(45,.1,28,0x3e883d);park.position.set(5,-.01,-37);scene.add(park);
 for(let i=0;i<24;i++){let t=box(1.2,4+Math.random()*3,1.2,0x205c2c);t.position.set(-15+Math.random()*40,2, -50+Math.random()*25);scene.add(t)}
 // station
 station=new THREE.Group();station.position.set(-2,0,22);scene.add(station);
 const main=box(45,10,18,0xb7b9b8);main.position.y=5;main.castShadow=true;station.add(main);
 const roof=box(46,1,19,0xb62222);roof.position.y=10.5;station.add(roof);
 for(let i=0;i<8;i++){let door=box(4.1,7.3,.45,0x263139);door.position.set(-17.5+i*5,4,-9.2);door.userData.vehicleIndex=i;door.castShadow=true;station.add(door);garageMeshes.push(door)}
 // sign
 addLabel('FEUERWEHR • RETTUNGSDIENST',0,13,20,.9);
 // hydrant
 const hydrant=box(1.1,1.5,1.1,0xc32626);hydrant.position.set(28,.75,-8);scene.add(hydrant);addLabel('HYDRANT',28,3,-8,.45);
 raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();
 renderer.domElement.addEventListener('pointerdown',onPointer);
 addLabel('WACHE',-2,17,22,1);
 animate();
}
function onPointer(e){
 mouse.x=(e.clientX/innerWidth)*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(mouse,camera);
 const hits=raycaster.intersectObjects(garageMeshes);if(hits.length){showVehicle(hits[0].object.userData.vehicleIndex);return}
}
function showVehicle(i){
 const v=vehicles[i%vehicles.length];vehiclePanel.classList.remove('hidden');
 vehiclePanel.innerHTML=`<h2>🚒 ${v[0]}</h2><p><b>${v[1]}</b> · Besatzung ${v[2]} Personen</p>
 <button class="option" id="deploy">▶ Ausrücken</button><button class="option" id="closeV">Schließen</button>`;
 document.querySelector('#closeV').onclick=()=>vehiclePanel.classList.add('hidden');
 document.querySelector('#deploy').onclick=()=>{vehiclePanel.classList.add('hidden');showMission('Einsatzort erreicht','Fahrzeug kann jetzt positioniert werden.','🚒')};
}
const missionData=[
 ['Kleinbrand','Mülltonnenbrand','Klein','🔥'],['Wohnungsbrand','Brand in einem Mehrfamilienhaus','Mittel','🏠🔥'],
 ['Waldbrand','Waldbrand an einer Landstraße · Hydrant erforderlich','Groß','🌲🔥'],['Verkehrsunfall','Verkehrsunfall mit mehreren Verletzten','Mittel','🚗🚑'],
 ['Großbrand Einkaufszentrum','Großbrand · mehrere Verletzte · Drehleiter erforderlich','Groß','🏬🔥']
];
function showMission(title,desc,icon='🚨'){
 missionPanel.classList.remove('hidden');missionPanel.innerHTML=`<h2>${icon} ${title}</h2><p>${desc}</p><button class="option" id="position">📍 Fahrzeug positionieren</button><button class="option" id="hose">💧 Schlauchleitung</button><button class="option" id="ladder">🪜 DLK ausfahren / Personen retten</button><button class="option" id="closeM">Schließen</button>`;
 document.querySelector('#closeM').onclick=()=>missionPanel.classList.add('hidden');
 document.querySelector('#position').onclick=()=>alert('Positionierungsmodus: In der nächsten Ausbaustufe wird das Fahrzeug per Klick auf Straße/Seitenstreifen gesetzt.');
 document.querySelector('#hose').onclick=()=>alert('Schlauchmodus: Hydrant → Fahrzeug. Schnellangriff und weitere Schlaucharten folgen.');
 document.querySelector('#ladder').onclick=()=>alert('DLK: Leiter wird in der nächsten Ausbaustufe animiert ausgefahren.');
}
document.querySelector('#freePlay').onclick=()=>{menu.classList.remove('active');game.classList.add('active');createScene()};
document.querySelector('#missions').onclick=()=>{menu.classList.remove('active');game.classList.add('active');createScene();setTimeout(()=>{missionPanel.classList.remove('hidden');missionPanel.innerHTML='<h2>🚨 Einsatz auswählen</h2>'+missionData.map((m,i)=>`<button class="option mission" data-i="${i}">${m[3]} ${m[0]} <span class="tag">${m[2]}</span><br><small>${m[1]}</small></button>`).join('')+'<button class="option" id="closeM">Schließen</button>';document.querySelectorAll('.mission').forEach(b=>b.onclick=()=>{let m=missionData[b.dataset.i];showMission(m[0],m[1],m[3])});document.querySelector('#closeM').onclick=()=>missionPanel.classList.add('hidden')},300)};
document.querySelector('#missionBtn').onclick=()=>{missionPanel.classList.remove('hidden');missionPanel.innerHTML='<h2>🚨 Einsatzarten</h2>'+missionData.map((m,i)=>`<button class="option mission" data-i="${i}">${m[3]} ${m[0]} <span class="tag">${m[2]}</span></button>`).join('')+'<button class="option" id="closeM">Schließen</button>';document.querySelectorAll('.mission').forEach(b=>b.onclick=()=>{let m=missionData[b.dataset.i];showMission(m[0],m[1],m[3])});document.querySelector('#closeM').onclick=()=>missionPanel.classList.add('hidden')};
document.querySelector('#back').onclick=()=>{game.classList.remove('active');menu.classList.add('active');if(renderer){renderer.dispose();canvas.innerHTML=''}};
let remaining=240;setInterval(()=>{if(game.classList.contains('active')){remaining--;if(remaining<0)remaining=240;let m=Math.floor(remaining/60),s=remaining%60;document.querySelector('#clock').textContent=`00:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}},1000);
function animate(){requestAnimationFrame(animate);if(!renderer)return;controls.update();renderer.render(scene,camera)}
addEventListener('resize',()=>{if(camera&&renderer){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}});
