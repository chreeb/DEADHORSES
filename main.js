let scene, camera, renderer, cube;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
    75, // FOV IN DEGREES
    window.innerWidth / window.innerHeight, // ASPECT OF VIEW
    0.1, // NEAR PLANE
    1000); // FAR PLANE

    renderer = new THREE.WebGLRenderer({antialias: true});

    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    camera.position.z = 5; 
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
}

window.addEventListener('resize',onWindowResize, false);

function addLighting() {
    const light = new THREE.AmbientLight(0xFFFFFF);
    scene.add(light);

    const spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(0,3,0);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);
}

init();

import {OrbitControls} from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
const controls = new OrbitControls(camera,renderer.domElement);
controls.target.set(0,0,0);
controls.update();

addLighting();

const boidGeo = new THREE.BoxBufferGeometry(0.2,0.2,0.2);
const boidMat = new THREE.MeshStandardMaterial(0xFFFFFF);

let nullVector = new THREE.Vector3(0,0,0);
let boidArr = [];



class Boid {
    constructor() {
        this.self = new THREE.Mesh(boidGeo,boidMat);
        this.self.position.x = returnReducedRand(3);
        let magStr = 1;
        this.magnitude = new THREE.Vector3(returnRand(magStr),returnRand(magStr),returnRand(magStr));
        scene.add(this.self);
    }

    checkLimits() {
        if (distanceVector(this.self.position,nullVector) > 3) {
            this.magnitude.x = -this.magnitude.x;
            this.magnitude.y = -this.magnitude.y;
            this.magnitude.z = -this.magnitude.z;
        }
    }

    update(boidArr) {
        let moveAwayVector = new THREE.Vector3(0,0,0);
        let numNeighbors = 0;

        boidArr.forEach((other) => {
            if (other == this) { return; }

            let distance = this.self.position.distanceToSquared(other.self.position);
            if (distance < 0.3) {
                let otherPos = other.self.position;
                moveAwayVector.add(otherPos);
                numNeighbors++;
            }
        });

        if (numNeighbors != 0) {
            moveAwayVector.divideScalar(numNeighbors);
            return moveAwayVector
        } else {
            return false;
        }
    }

    move(boidArr) {
        let moveAwayVec = this.update(boidArr);
        if (moveAwayVec) {
            moveAwayVec.subVectors(moveAwayVec,this.self.position);
            moveAwayVec.divideScalar(800);
            this.magnitude.sub(moveAwayVec);
        }

        this.magnitude.normalize();
        this.magnitude.divideScalar(100);

        this.self.position.add(this.magnitude);
        this.checkLimits();
    }
}

for (let i = 0; i < 30; i++) {
    boidArr.push(new Boid());
}





animate();

function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < boidArr.length; i++) {
        boidArr[i].move(boidArr);
    }
    
    renderer.render(scene, camera);
}







// Math Functions
function returnRand(mod) {
    let newRand = Math.random()/mod;
    return newRand;
}

function returnReducedRand(mod) {
    return ((Math.random()*mod) - (mod/2))/mod;
}

function distanceVector( v1, v2 )
{
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}