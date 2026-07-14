import * as THREE from '../node_modules/three/build/three.module.min.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

const SHELL_GAP = 0.55;

function getElectronShells(totalElectrons) {
    const shells = [];
    let remaining = totalElectrons;
    let shell = 1;

    while (remaining > 0) {
        const capacity = 2 * shell * shell;
        const count = Math.min(remaining, capacity);
        shells.push({ shell, count });
        remaining -= count;
        shell += 1;
    }

    return shells;
}

function getValenceElectrons(totalElectrons) {
    const shells = getElectronShells(totalElectrons);
    return shells[shells.length - 1].count;
}

function formatShellConfig(shells) {
    return shells.map(({ shell, count }) => `${shell}:${count}e`).join(' ');
}

function readAtom(Module, ptr) {
    return {
        symbol: Module.UTF8ToString(Module._atom_symbol(ptr)),
        color: Module.UTF8ToString(Module._atom_color(ptr)),
        mass: Module._atom_mass(ptr),
        protons: Module._atom_protons(ptr),
        electrons: Module._atom_electrons(ptr),
        neutrons: Module._atom_neutrons(ptr),
        stable: Module._atom_is_stable(ptr) === 1,
    };
}

function createShellMotion(shell) {
    const factor = 1 / shell;

    return {
        x: { speed: 0.35 * factor, amplitude: Math.PI / 2.2, phase: shell * 1.1 },
        y: { speed: 0.45 * factor, amplitude: Math.PI, phase: shell * 2.3 },
        z: { speed: 0.28 * factor, amplitude: Math.PI / 2.8, phase: shell * 0.7 },
    };
}

function updateShellOrientation(shellGroup, motion, time) {
    shellGroup.rotation.x = Math.sin(time * motion.x.speed + motion.x.phase) * motion.x.amplitude;
    shellGroup.rotation.y = time * motion.y.speed + motion.y.phase;
    shellGroup.rotation.z = Math.sin(time * motion.z.speed + motion.z.phase) * motion.z.amplitude;
}

function createOrbitPath(radius) {
    const points = [];
    for (let i = 0; i <= 128; i++) {
        const angle = (i / 128) * Math.PI * 2;
        points.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius,
        ));
    }

    return new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0xcccccc }),
    );
}

function createAtomMesh(atomData) {
    const group = new THREE.Group();
    const nucleusRadius = 0.3 + atomData.protons * 0.04;
    const shells = getElectronShells(atomData.electrons);

    const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(nucleusRadius, 24, 24),
        new THREE.MeshStandardMaterial({ color: atomData.color }),
    );
    group.add(nucleus);

    const electronGeometry = new THREE.SphereGeometry(0.12, 12, 12);
    const electronMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0x660000,
    });

    for (const { shell, count } of shells) {
        const orbitRadius = nucleusRadius + shell * SHELL_GAP;
        const shellGroup = new THREE.Group();
        shellGroup.userData.shellMotion = createShellMotion(shell);
        shellGroup.add(createOrbitPath(orbitRadius));

        for (let i = 0; i < count; i++) {
            const electron = new THREE.Mesh(electronGeometry, electronMaterial);
            electron.userData.orbitRadius = orbitRadius;
            electron.userData.orbitSpeed = 1.1 / shell;
            electron.userData.orbitOffset = (i / count) * Math.PI * 2;
            shellGroup.add(electron);
        }

        group.add(shellGroup);
    }

    return group;
}

function updateAtom(group, time) {
    group.children.forEach((shellGroup) => {
        if (!shellGroup.isGroup) {
            return;
        }

        if (shellGroup.userData.shellMotion) {
            updateShellOrientation(shellGroup, shellGroup.userData.shellMotion, time);
        }

        shellGroup.children.forEach((child) => {
            if (!child.userData.orbitRadius) {
                return;
            }

            const angle = time * child.userData.orbitSpeed + child.userData.orbitOffset;
            child.position.set(
                Math.cos(angle) * child.userData.orbitRadius,
                0,
                Math.sin(angle) * child.userData.orbitRadius,
            );
        });
    });
}

function renderLewisDiagram(atomData, container) {
    const valence = getValenceElectrons(atomData.electrons);
    const stage = document.createElement('div');
    stage.className = 'lewis-stage';
    const diagram = document.createElement('div');
    diagram.className = 'lewis-diagram';

    const symbol = document.createElement('div');
    symbol.className = 'lewis-symbol';
    symbol.textContent = atomData.symbol;
    diagram.appendChild(symbol);

    for (let i = 0; i < valence; i++) {
        const angle = (i / valence) * Math.PI * 2 - Math.PI / 2;
        const dot = document.createElement('div');
        dot.className = 'lewis-dot';
        dot.style.left = `${50 + Math.cos(angle) * 42}%`;
        dot.style.top = `${50 + Math.sin(angle) * 42}%`;
        diagram.appendChild(dot);
    }

    stage.appendChild(diagram);
    container.replaceChildren(stage);
    return stage;
}

function setupLewisControls(view, stage) {
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    function applyTransform() {
        stage.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${scale})`;
    }

    view.addEventListener('wheel', (event) => {
        event.preventDefault();
        const factor = event.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.min(4, Math.max(0.4, scale * factor));
        applyTransform();
    }, { passive: false });

    view.addEventListener('pointerdown', (event) => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        view.setPointerCapture(event.pointerId);
        view.classList.add('dragging');
    });

    view.addEventListener('pointermove', (event) => {
        if (!dragging) {
            return;
        }

        panX += event.clientX - lastX;
        panY += event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        applyTransform();
    });

    const stopDragging = () => {
        dragging = false;
        view.classList.remove('dragging');
    };

    view.addEventListener('pointerup', stopDragging);
    view.addEventListener('pointercancel', stopDragging);
}

const Module = await globalThis.__atomModuleReady;
const carbon = readAtom(Module, Module._create_carbon_atom());

const btn3d = document.getElementById('btn-3d');
const btnLewis = document.getElementById('btn-lewis');
const lewisView = document.getElementById('lewis-view');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 20;

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(4, 6, 5);
scene.add(light);

const carbonMesh = createAtomMesh(carbon);
scene.add(carbonMesh);

const lewisStage = renderLewisDiagram(carbon, lewisView);
setupLewisControls(lewisView, lewisStage);

const info = document.getElementById('info');
const carbonShells = getElectronShells(carbon.electrons);

let animationId = null;
let mode = '3d';

function animate(time) {
    updateAtom(carbonMesh, time * 0.001);
    controls.update();
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
}

function setMode(nextMode) {
    mode = nextMode;
    btn3d.classList.toggle('active', mode === '3d');
    btnLewis.classList.toggle('active', mode === 'lewis');

    if (mode === '3d') {
        lewisView.classList.remove('visible');
        renderer.domElement.style.display = 'block';
        if (!animationId) {
            animate(0);
        }
        return;
    }

    lewisView.classList.add('visible');
    renderer.domElement.style.display = 'none';
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

btn3d.addEventListener('click', () => setMode('3d'));
btnLewis.addEventListener('click', () => setMode('lewis'));

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

setMode('3d');
