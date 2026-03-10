import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function addBlock(target, material, width, height, x, y, depth = 0.08) {
  const part = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  part.position.set(x, y, 0);
  target.add(part);
}

function createPixelLetter(letter, material) {
  const g = new THREE.Group();
  const t = 0.12;
  const h = 0.82;
  const mid = 0;
  const top = h / 2;
  const bottom = -h / 2;

  if (letter === 'N') {
    addBlock(g, material, t, h, -0.24, 0);
    addBlock(g, material, t, h, 0.24, 0);
    for (let i = 0; i < 4; i += 1) addBlock(g, material, t, t, -0.16 + i * 0.11, top - 0.2 - i * 0.15);
  }
  if (letter === 'O') {
    addBlock(g, material, 0.56, t, 0, top);
    addBlock(g, material, 0.56, t, 0, bottom);
    addBlock(g, material, t, h, -0.24, 0);
    addBlock(g, material, t, h, 0.24, 0);
  }
  if (letter === 'K') {
    addBlock(g, material, t, h, -0.24, 0);
    addBlock(g, material, 0.3, t, 0.08, 0.2);
    addBlock(g, material, t, 0.3, 0.18, 0.08);
    addBlock(g, material, 0.26, t, 0.06, -0.2);
    addBlock(g, material, t, 0.3, 0.2, -0.08);
  }
  if (letter === 'I') {
    addBlock(g, material, 0.44, t, 0, top);
    addBlock(g, material, 0.44, t, 0, bottom);
    addBlock(g, material, t, h, 0, 0);
  }
  if (letter === 'A') {
    addBlock(g, material, t, h, -0.24, 0);
    addBlock(g, material, t, h, 0.24, 0);
    addBlock(g, material, 0.56, t, 0, top);
    addBlock(g, material, 0.42, t, 0, mid);
  }
  return g;
}

export function mountNokiaScene(canvas, onInputChange) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#020617');

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.2, 5.4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3;
  controls.maxDistance = 8;

  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
  keyLight.position.set(2.8, 5, 4.2);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight('#67e8f9', 0.45);
  rimLight.position.set(-4, 2, -4);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(8, 64),
    new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.95 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.45;
  scene.add(floor);

  const phone = new THREE.Group();
  scene.add(phone);

  const shellMaterial = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.62, metalness: 0.2 });
  const darkPlastic = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.45, metalness: 0.18 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.95, 2.15, 10, 18), shellMaterial);
  body.scale.set(1.02, 1.06, 0.34);
  phone.add(body);

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.18, 0.05), darkPlastic);
  bezel.position.set(0, 1.03, 0.35);
  phone.add(bezel);

  const earpiece = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.07, 0.04), new THREE.MeshStandardMaterial({ color: '#0f172a' }));
  earpiece.position.set(0, 1.68, 0.34);
  phone.add(earpiece);

  const navRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.06, 18, 40),
    new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.36, metalness: 0.25 })
  );
  navRing.rotation.x = Math.PI / 2;
  navRing.position.set(0, 0.18, 0.36);
  phone.add(navRing);

  const navCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.07, 32), darkPlastic);
  navCenter.rotation.x = Math.PI / 2;
  navCenter.position.set(0, 0.18, 0.365);
  phone.add(navCenter);

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.28, metalness: 0.6 })
  );
  antenna.position.set(0.66, 2.26, 0.02);
  phone.add(antenna);

  const title = new THREE.Group();
  const titleMat = new THREE.MeshStandardMaterial({ color: '#22d3ee', roughness: 0.25, metalness: 0.45, emissive: '#083344' });
  ['N', 'O', 'K', 'I', 'A'].forEach((char, idx) => {
    const letter = createPixelLetter(char, titleMat);
    letter.position.set(idx * 0.78, 0, 0);
    title.add(letter);
  });
  title.position.set(-3.0, 0.9, 0.25);
  title.rotation.y = 0.35;
  title.rotation.x = -0.12;
  scene.add(title);

  let inputValue = '';
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 256;
  const screenCtx = screenCanvas.getContext('2d');
  const screenTexture = new THREE.CanvasTexture(screenCanvas);

  const drawScreen = () => {
    screenCtx.fillStyle = '#95e9ff';
    screenCtx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);
    screenCtx.fillStyle = '#083344';
    screenCtx.font = 'bold 36px monospace';
    screenCtx.fillText('NOKIA', 20, 50);
    screenCtx.font = 'bold 56px monospace';
    screenCtx.fillText(inputValue || '-', 20, 140);
    screenCtx.font = '28px monospace';
    screenCtx.fillText('Input Number', 20, 205);
    screenTexture.needsUpdate = true;
    onInputChange(inputValue);
  };

  drawScreen();

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.22, 0.9),
    new THREE.MeshStandardMaterial({ map: screenTexture, roughness: 0.25, metalness: 0.08 })
  );
  screen.position.set(0, 1.03, 0.37);
  phone.add(screen);

  const buttonDefs = [
    ['1', -0.48, -0.28], ['2', 0, -0.28], ['3', 0.48, -0.28],
    ['4', -0.48, -0.74], ['5', 0, -0.74], ['6', 0.48, -0.74],
    ['7', -0.48, -1.2], ['8', 0, -1.2], ['9', 0.48, -1.2],
    ['*', -0.48, -1.66], ['0', 0, -1.66], ['#', 0.48, -1.66]
  ];

  const makeButtonTexture = (label) => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, 122, 122);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 64, 64);
    return new THREE.CanvasTexture(c);
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clickableButtons = [];

  buttonDefs.forEach(([label, x, y]) => {
    const button = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.08, 32),
      new THREE.MeshStandardMaterial({ map: makeButtonTexture(label), roughness: 0.38, metalness: 0.12 })
    );
    button.rotation.x = Math.PI / 2;
    button.position.set(x, y, 0.38);
    button.userData = { label };
    clickableButtons.push(button);
    phone.add(button);
  });

  const onPointerDown = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(clickableButtons)[0];
    if (!hit) return;
    const { label } = hit.object.userData;
    if (/\d/.test(label) && inputValue.length < 12) {
      inputValue += label;
      drawScreen();
    }
  };

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('resize', onResize);

  let rafId = 0;
  const animate = () => {
    phone.rotation.y += 0.0022;
    controls.update();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  };
  animate();

  return {
    clearInput() {
      inputValue = '';
      drawScreen();
    },
    dispose() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
    }
  };
}
