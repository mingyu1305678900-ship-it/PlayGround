import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const BLOCK = 78;
export const ROAD = 14;
export const GRID_MIN = -4;
export const GRID_MAX = 4;
export const CITY_BOUND = GRID_MAX * BLOCK + ROAD / 2;
export const MAP_EXTENT = CITY_BOUND + 26;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ */
/* texture helpers                                                     */
/* ------------------------------------------------------------------ */

function canvasTexture(w, h, draw, repeat = false) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  return tex;
}

function noisePatches(ctx, w, h, count, colors, size = 4, alpha = 0.15) {
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = Math.random() * alpha;
    ctx.fillStyle = pick(colors);
    const s = rand(size * 0.4, size);
    ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
  }
  ctx.globalAlpha = 1;
}

function makeAsphaltTexture() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2b2d2f';
    ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 2600, ['#1e2022', '#36383b', '#45474a', '#26282a'], 3, 0.28);
    ctx.strokeStyle = 'rgba(12,12,12,0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      const y = Math.random() * h;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + rand(-6, 6), w * 0.7, y + rand(-6, 6), w, y + rand(-4, 4));
      ctx.stroke();
    }
  }, true);
}

function makeSidewalkTexture() {
  return canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#8f908a';
    ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 900, ['#7e7f79', '#a1a29b', '#75766f'], 2, 0.25);
    ctx.strokeStyle = 'rgba(52,54,50,0.55)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= w; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }, true);
}

function makeRoofTexture() {
  return canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#4a4b4a';
    ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 1200, ['#3d3e3d', '#575857', '#333433'], 3, 0.3);
    ctx.strokeStyle = 'rgba(26,27,27,0.35)';
    for (let y = 0; y < h; y += 16) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }, true);
}

function makeRoadTexture() {
  // 1 tile = 8 metres of road along V.
  return canvasTexture(128, 512, (ctx, w, h) => {
    ctx.fillStyle = '#2c2e30';
    ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 1600, ['#242628', '#383a3c', '#414345'], 3, 0.3);
    // centre line: double yellow, dashed
    ctx.fillStyle = '#c8a93f';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(w / 2 - 5, 0, 2.5, h * 0.55);
    ctx.fillRect(w / 2 + 2.5, 0, 2.5, h * 0.55);
    ctx.globalAlpha = 1;
    // white edge lines
    ctx.fillStyle = 'rgba(220,220,210,0.55)';
    ctx.fillRect(10, 0, 2, h);
    ctx.fillRect(w - 12, 0, 2, h);
    // subtle tyre tracks
    ctx.fillStyle = 'rgba(20,20,20,0.12)';
    ctx.fillRect(w * 0.26, 0, 8, h);
    ctx.fillRect(w * 0.72, 0, 8, h);
  }, true);
}

function makeGrassTexture() {
  return canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#3e5236';
    ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 2200, ['#33462d', '#4b6241', '#2c3c27', '#556b47'], 2, 0.4);
  }, true);
}

function makeParkingTexture() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#34373a';
    ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 2000, ['#2b2e31', '#3e4144', '#45484b', '#282b2d'], 3, 0.32);
    ctx.strokeStyle = 'rgba(228,226,210,0.55)';
    ctx.lineWidth = 3;
    for (let x = 0; x <= w; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 58);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 58);
    ctx.lineTo(w, 58);
    ctx.stroke();
    ctx.fillStyle = 'rgba(20,20,20,0.12)';
    for (let x = 16; x < w; x += 64) ctx.fillRect(x, 80, 18, h - 80);
  }, true);
}

const FACADE_STYLES = [
  { base: '#7b6a58', window: '#2a3340', trim: '#5e503f', lit: '#ffd38a', glass: false },
  { base: '#6e747a', window: '#25303a', trim: '#565c61', lit: '#ffe1a8', glass: false },
  { base: '#a89b86', window: '#33404a', trim: '#8b7f6b', lit: '#ffcf86', glass: false },
  { base: '#465a6a', window: '#6d9bb5', trim: '#384854', lit: '#ffdca6', glass: true },
  { base: '#3b4b57', window: '#5d92ad', trim: '#2f3d47', lit: '#ffd59c', glass: true },
  { base: '#8d5d4e', window: '#2e3238', trim: '#71493d', lit: '#ffd08a', glass: false },
  { base: '#c7c2b6', window: '#38424b', trim: '#a9a498', lit: '#ffe4b4', glass: false },
  { base: '#4c4b50', window: '#2b3038', trim: '#3d3c41', lit: '#ffd69a', glass: false },
];

function makeFacadeMaps(style) {
  const W = 128;
  const H = 96;
  const map = canvasTexture(W, H, (ctx, w, h) => {
    ctx.fillStyle = style.base;
    ctx.fillRect(0, 0, w, h);
    noisePatches(ctx, w, h, 550, ['#000000', '#ffffff'], 2, 0.1);
    // floor slab
    ctx.fillStyle = style.trim;
    ctx.fillRect(0, h - 6, w, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, h - 8, w, 2);
    // three narrower windows per 4 m tile
    const cols = 3;
    const gap = 7;
    const winW = (w - gap * (cols + 1)) / cols;
    for (let c = 0; c < cols; c++) {
      const x = gap + c * (winW + gap);
      const y = 12;
      const wh = h - 30;
      // frame
      ctx.fillStyle = style.trim;
      ctx.fillRect(x - 2, y - 2, winW + 4, wh + 4);
      // glass
      const g = ctx.createLinearGradient(x, y, x + winW, y + wh);
      g.addColorStop(0, style.window);
      g.addColorStop(0.55, style.glass ? '#89b6cc' : shade(style.window, 18));
      g.addColorStop(1, shade(style.window, -18));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, winW, wh);
      // reflection
      if (style.glass) {
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.beginPath();
        ctx.moveTo(x, y + wh);
        ctx.lineTo(x + winW * 0.7, y);
        ctx.lineTo(x + winW, y);
        ctx.lineTo(x + winW * 0.4, y + wh);
        ctx.closePath();
        ctx.fill();
      }
      // mullion
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x + winW / 2 - 1, y, 2, wh);
      if (!style.glass) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + 2, y + 2, winW - 4, wh * 0.18);
      }
    }
    // side shading
    const side = ctx.createLinearGradient(0, 0, w, 0);
    side.addColorStop(0, 'rgba(0,0,0,0.16)');
    side.addColorStop(0.5, 'rgba(0,0,0,0)');
    side.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = side;
    ctx.fillRect(0, 0, w, h);
  }, true);

  const emissive = canvasTexture(W, H, (ctx, w, h) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    const cols = 3;
    const gap = 7;
    const winW = (w - gap * (cols + 1)) / cols;
    for (let c = 0; c < cols; c++) {
      if (Math.random() < 0.38) continue;
      const x = gap + c * (winW + gap);
      const y = 12;
      const wh = h - 30;
      const grad = ctx.createLinearGradient(0, y, 0, y + wh);
      grad.addColorStop(0, style.lit);
      grad.addColorStop(1, shade(style.lit, -50));
      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y + 1, winW - 2, wh - 2);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x + winW / 2 - 1, y, 2, wh);
    }
  }, true);

  return { map, emissive };
}

function shade(hex, amt) {
  const c = new THREE.Color(hex);
  const f = 1 + amt / 100;
  c.r = clamp(c.r * f, 0, 1);
  c.g = clamp(c.g * f, 0, 1);
  c.b = clamp(c.b * f, 0, 1);
  return `#${c.getHexString()}`;
}

function scaleBoxUV(geo, w, h, d, uSize, vSize) {
  const uv = geo.attributes.uv;
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z (4 verts each)
  for (let f = 0; f < 6; f++) {
    let u = w / uSize;
    let v = h / vSize;
    if (f < 2) { u = d / uSize; v = h / vSize; }
    else if (f < 4) { u = w / uSize; v = d / uSize; }
    for (let i = 0; i < 4; i++) {
      const idx = f * 4 + i;
      uv.setXY(idx, uv.getX(idx) * u, uv.getY(idx) * v);
    }
  }
  uv.needsUpdate = true;
}

/* ------------------------------------------------------------------ */
/* World                                                               */
/* ------------------------------------------------------------------ */

export class World {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.colliders = [];
    this.blocks = [];
    this.parkBlocks = [];
    this.parkingBlocks = [];
    this.tallBuildings = [];
    this.timeOfDay = 15.2; // late afternoon
    this.timeScale = 0.004;
    this.night = 0;
    this._shadowFocus = new THREE.Vector3(1e9, 0, 0);
    this.spawn = { x: BLOCK * 2 + 3.5, z: BLOCK * 2 + 26, heading: Math.PI };
    this._buildLights();
    this._buildSky();
    this._buildGround();
    this._buildBlocks();
    this._buildBillboards();
    this._buildHorizon();
    this._buildMap();
    this._applyTime(0);
  }

  /* ---------- lights & sky ---------- */

  _buildLights() {
    this.hemi = new THREE.HemisphereLight(0xbcd7e8, 0x2c2a24, 0.55);
    this.scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight(0xffd2a0, 2.4);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 10;
    this.sun.shadow.camera.far = 420;
    this.sun.shadow.camera.left = -95;
    this.sun.shadow.camera.right = 95;
    this.sun.shadow.camera.top = 95;
    this.sun.shadow.camera.bottom = -95;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.6;
    this.sunTarget = new THREE.Object3D();
    this.scene.add(this.sunTarget);
    this.sun.target = this.sunTarget;
    this.scene.add(this.sun);

    this.ambient = new THREE.AmbientLight(0x4a4a44, 0.42);
    this.scene.add(this.ambient);

    // shadow-fill from the opposite side: keeps shaded facades and glass readable
    this.fill = new THREE.DirectionalLight(0xcfe4f2, 0.55);
    this.fill.position.set(120, 90, -40);
    this.scene.add(this.fill);
  }

  _buildSky() {
    this.skyUniforms = {
      zenith: { value: new THREE.Color('#3f7cbe') },
      horizon: { value: new THREE.Color('#c3d8e5') },
      sunDir: { value: new THREE.Vector3(0, 1, 0) },
      sunColor: { value: new THREE.Color('#fff0cd') },
      intensity: { value: 1 },
    };
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(1400, 32, 20),
      new THREE.ShaderMaterial({
        uniforms: this.skyUniforms,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: `
          varying vec3 vWorld;
          void main() {
            vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 zenith;
          uniform vec3 horizon;
          uniform vec3 sunDir;
          uniform vec3 sunColor;
          uniform float intensity;
          varying vec3 vWorld;
          void main() {
            vec3 dir = normalize(vWorld - cameraPosition);
            float h = dir.y;
            vec3 col = mix(horizon, zenith, pow(clamp(h, 0.0, 1.0), 0.55));
            col = mix(col, horizon * 0.55, smoothstep(0.03, -0.22, h));
            float sd = max(dot(dir, sunDir), 0.0);
            col += sunColor * pow(sd, 420.0) * 2.4 * intensity;
            col += sunColor * pow(sd, 10.0) * 0.20 * intensity;
            col += sunColor * pow(sd, 2.0) * 0.035 * intensity;
            gl_FragColor = vec4(col, 1.0);
          }`,
      })
    );
    sky.frustumCulled = false;
    this.sky = sky;
    this.scene.add(sky);

    // stars
    const starGeo = new THREE.BufferGeometry();
    const count = 700;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().setFromSphericalCoords(900, Math.acos(rand(0.05, 0.98)), rand(0, Math.PI * 2));
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = Math.abs(v.y);
      pos[i * 3 + 2] = v.z;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false })
    );
    this.stars.frustumCulled = false;
    this.scene.add(this.stars);

    this.scene.fog = new THREE.Fog(0xc3d8e5, 240, 1500);
  }

  _buildGround() {
    const groundTex = makeAsphaltTexture();
    groundTex.repeat.set(90, 90);
    const asphalt = new THREE.Mesh(
      new THREE.PlaneGeometry(760, 760),
      new THREE.MeshStandardMaterial({ map: groundTex, color: 0xffffff, roughness: 0.94, metalness: 0.02 })
    );
    asphalt.rotation.x = -Math.PI / 2;
    asphalt.receiveShadow = true;
    this.scene.add(asphalt);

    const land = new THREE.Mesh(
      new THREE.PlaneGeometry(1080, 1080),
      new THREE.MeshStandardMaterial({ color: 0x3c4638, roughness: 1 })
    );
    land.rotation.x = -Math.PI / 2;
    land.position.y = -0.06;
    land.receiveShadow = true;
    this.scene.add(land);

    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 6000),
      new THREE.MeshStandardMaterial({ color: 0x1f4a5c, roughness: 0.28, metalness: 0.4 })
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.55;
    this.scene.add(ocean);

    // sand ring around the city (coastline feel)
    const sand = new THREE.Mesh(
      new THREE.RingGeometry(370, 470, 64, 1),
      new THREE.MeshStandardMaterial({ color: 0x9c8b65, roughness: 1 })
    );
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = 0.005;
    sand.receiveShadow = true;
    this.scene.add(sand);

    this.sidewalkTex = makeSidewalkTexture();
    this.roofTex = makeRoofTexture();
    this.grassTex = makeGrassTexture();
    this.parkingTex = makeParkingTexture();
    this.roadTex = makeRoadTexture();
    this.roadTex.repeat.set(1, 1);
  }

  /* ---------- blocks & buildings ---------- */

  _buildBlocks() {
    const sidewalkMat = new THREE.MeshStandardMaterial({ map: this.sidewalkTex, roughness: 0.92 });
    const grassMat = new THREE.MeshStandardMaterial({ map: this.grassTex, roughness: 1 });
    const walkGeos = [];
    const grassGeos = [];
    const parkPathGeos = [];
    const roadStripGeos = [];

    this.facadeMaterials = [];
    this.buckets = [];
    for (const style of FACADE_STYLES) {
      const { map, emissive } = makeFacadeMaps(style);
      const mat = new THREE.MeshStandardMaterial({
        map,
        emissiveMap: emissive,
        emissive: 0xffffff,
        emissiveIntensity: 0,
        roughness: style.glass ? 0.32 : 0.86,
        metalness: style.glass ? 0.35 : 0.04,
      });
      this.facadeMaterials.push(mat);
      this.buckets.push([]);
    }
    this.roofGeos = [];
    this.propGeos = [];
    this.trimGeos = [];
    this.antennaGeos = [];
    this.billboardSpots = [];

    // road strips with lane markings
    for (let i = GRID_MIN; i <= GRID_MAX; i++) {
      for (let j = GRID_MIN; j < GRID_MAX; j++) {
        const z0 = j * BLOCK + ROAD / 2;
        const z1 = (j + 1) * BLOCK - ROAD / 2;
        const len = z1 - z0;
        if (len <= 0) continue;
        // vertical road (runs along z)
        const g1 = new THREE.PlaneGeometry(ROAD - 1.6, len);
        scalePlaneUV(g1, (ROAD - 1.6) / 14, len / 8);
        g1.rotateX(-Math.PI / 2);
        g1.translate(i * BLOCK, 0.012, (z0 + z1) / 2);
        roadStripGeos.push(g1);
        // horizontal road (runs along x)
        const g2 = new THREE.PlaneGeometry(ROAD - 1.6, len);
        scalePlaneUV(g2, (ROAD - 1.6) / 14, len / 8);
        g2.rotateX(-Math.PI / 2);
        g2.rotateY(Math.PI / 2);
        g2.translate((z0 + z1) / 2, 0.012, i * BLOCK);
        roadStripGeos.push(g2);
      }
    }
    const roadMesh = new THREE.Mesh(mergeGeometries(roadStripGeos), new THREE.MeshStandardMaterial({
      map: this.roadTex, roughness: 0.9, metalness: 0.02, polygonOffset: true, polygonOffsetFactor: -1,
    }));
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);

    for (let i = GRID_MIN; i < GRID_MAX; i++) {
      for (let j = GRID_MIN; j < GRID_MAX; j++) {
        const cx = (i + 0.5) * BLOCK;
        const cz = (j + 0.5) * BLOCK;
        const inner = BLOCK - ROAD; // 64
        const x0 = cx - inner / 2;
        const x1 = cx + inner / 2;
        const z0 = cz - inner / 2;
        const z1 = cz + inner / 2;

        // deterministic-ish classification
        const hsh = hash2(i, j);
        const isPark = hsh < 0.085 && i > GRID_MIN + 1 && j > GRID_MIN + 1;
        const isParking = !isPark && hsh < 0.15;
        const block = { i, j, cx, cz, x0, x1, z0, z1, isPark, isParking };
        this.blocks.push(block);

        // sidewalk platform
        const walkH = 0.14;
        const wg = new THREE.BoxGeometry(inner, walkH, inner);
        scaleBoxUV(wg, inner, walkH, inner, 4, 4);
        wg.translate(cx, walkH / 2, cz);
        walkGeos.push(wg);

        if (isPark) {
          this.parkBlocks.push(block);
          // grass inset
          const gg = new THREE.BoxGeometry(inner - 6, 0.22, inner - 6);
          scaleBoxUV(gg, inner - 6, 0.22, inner - 6, 6, 6);
          gg.translate(cx, 0.18, cz);
          grassGeos.push(gg);
          // cross paths
          const pathMat = new THREE.MeshStandardMaterial({ color: 0x9d9a8b, roughness: 1 });
          const p1 = new THREE.BoxGeometry(inner - 5, 0.06, 5);
          p1.translate(cx, 0.32, cz);
          const p2 = new THREE.BoxGeometry(5, 0.06, inner - 5);
          p2.translate(cx, 0.32, cz);
          const pathMesh = new THREE.Mesh(mergeGeometries([p1, p2]), pathMat);
          pathMesh.receiveShadow = true;
          this.scene.add(pathMesh);
          block.parkPath = true;
          block.trees = [];
          // benches
          for (let b = 0; b < 4; b++) {
            const bx = cx + rand(-inner / 3, inner / 3);
            const bz = cz + rand(-inner / 3, inner / 3);
            if (Math.abs(bx - cx) < 6 || Math.abs(bz - cz) < 6) continue;
            const bench = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 0.6), new THREE.MeshStandardMaterial({ color: 0x5c4632, roughness: 0.9 }));
            bench.position.set(bx, 0.5, bz);
            bench.rotation.y = rand(0, Math.PI);
            bench.castShadow = true;
            this.scene.add(bench);
          }
          continue;
        }

        if (isParking) {
          this.parkingBlocks.push(block);
          const pg = new THREE.BoxGeometry(inner - 5, 0.06, inner - 5);
          scaleBoxUV(pg, inner - 5, 0.06, inner - 5, 8, 8);
          pg.translate(cx, 0.17, cz);
          const pm = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ map: this.parkingTex, roughness: 0.95 }));
          pm.receiveShadow = true;
          this.scene.add(pm);
          block.parkingSpots = [];
          for (let s = 0; s < 4; s++) {
            const row = s < 2 ? -1 : 1;
            const px = cx + rand(-inner / 4, inner / 4);
            const pz = cz + row * rand(inner / 4, inner / 2.6);
            block.parkingSpots.push({ x: px, z: pz, heading: row > 0 ? 0 : Math.PI });
          }
          continue;
        }

        // building lots
        const lots = this._splitLots(block);
        for (const lot of lots) {
          this._addBuilding(lot, block);
        }
      }
    }

    const sidewalkMesh = new THREE.Mesh(mergeGeometries(walkGeos), sidewalkMat);
    sidewalkMesh.receiveShadow = true;
    sidewalkMesh.castShadow = false;
    this.scene.add(sidewalkMesh);

    if (grassGeos.length) {
      const grassMesh = new THREE.Mesh(mergeGeometries(grassGeos), grassMat);
      grassMesh.receiveShadow = true;
      this.scene.add(grassMesh);
    }

    // merged building meshes
    this.buildingMeshes = [];
    for (let k = 0; k < this.buckets.length; k++) {
      if (!this.buckets[k].length) continue;
      const merged = mergeGeometries(this.buckets[k]);
      const mesh = new THREE.Mesh(merged, this.facadeMaterials[k]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.buildingMeshes.push(mesh);
    }

    const roofMesh = new THREE.Mesh(
      mergeGeometries(this.roofGeos),
      new THREE.MeshStandardMaterial({ map: this.roofTex, color: 0xb9b9b9, roughness: 0.95 })
    );
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    this.scene.add(roofMesh);

    const propMesh = new THREE.Mesh(
      mergeGeometries(this.propGeos),
      new THREE.MeshStandardMaterial({ color: 0x3b3d3d, roughness: 0.85, metalness: 0.2 })
    );
    propMesh.castShadow = true;
    this.scene.add(propMesh);

    if (this.trimGeos.length) {
      const trimMesh = new THREE.Mesh(
        mergeGeometries(this.trimGeos),
        new THREE.MeshStandardMaterial({ color: 0x24272a, roughness: 0.7, metalness: 0.4 })
      );
      trimMesh.castShadow = true;
      this.scene.add(trimMesh);
    }
    if (this.antennaGeos.length) {
      const antMesh = new THREE.Mesh(
        mergeGeometries(this.antennaGeos),
        new THREE.MeshStandardMaterial({ color: 0x8a8f93, roughness: 0.4, metalness: 0.8 })
      );
      this.scene.add(antMesh);
    }

    this._buildTrees();
    this._buildStreetLights();
    this._buildCrosswalks();
  }

  _splitLots(block) {
    const inset = 4.2;
    const x0 = block.x0 + inset;
    const x1 = block.x1 - inset;
    const z0 = block.z0 + inset;
    const z1 = block.z1 - inset;
    const r = Math.random();
    const lots = [];
    if (r < 0.34) {
      lots.push({ x0, x1, z0, z1 });
    } else if (r < 0.62) {
      const mid = (x0 + x1) / 2 + rand(-4, 4);
      lots.push({ x0, x1: mid - 1.4, z0, z1 });
      lots.push({ x0: mid + 1.4, x1, z0, z1 });
    } else if (r < 0.86) {
      const mid = (z0 + z1) / 2 + rand(-4, 4);
      lots.push({ x0, x1, z0, z1: mid - 1.4 });
      lots.push({ x0, x1, z0: mid + 1.4, z1 });
    } else {
      const mx = (x0 + x1) / 2 + rand(-3, 3);
      const mz = (z0 + z1) / 2 + rand(-3, 3);
      lots.push({ x0, x1: mx - 1.2, z0, z1: mz - 1.2 });
      lots.push({ x0: mx + 1.2, x1, z0, z1: mz - 1.2 });
      lots.push({ x0, x1: mx - 1.2, z0: mz + 1.2, z1 });
      lots.push({ x0: mx + 1.2, x1, z0: mz + 1.2, z1 });
    }
    return lots.filter((l) => l.x1 - l.x0 > 5 && l.z1 - l.z0 > 5);
  }

  _addBuilding(lot, block) {
    const cx = (lot.x0 + lot.x1) / 2;
    const cz = (lot.z0 + lot.z1) / 2;
    const pad = rand(0.4, 1.5);
    const w = lot.x1 - lot.x0 - pad * 2;
    const d = lot.z1 - lot.z0 - pad * 2;
    if (w < 5 || d < 5) return;

    const dist = Math.hypot(cx, cz);
    const downtown = clamp(1 - dist / (BLOCK * 2.6), 0, 1);
    const styleIdx = downtown > 0.55 && Math.random() < 0.62
      ? (Math.random() < 0.5 ? 3 : 4)
      : Math.floor(Math.random() * FACADE_STYLES.length);
    const style = FACADE_STYLES[styleIdx];

    let h = 8 + downtown * (34 + Math.random() * 42) + Math.random() * 10;
    if (downtown > 0.75 && Math.random() < 0.22) h = 70 + Math.random() * 48;
    h = Math.max(7, h);

    const baseY = 0.14;
    const setback = downtown > 0.45 && h > 26 && Math.random() < 0.45;
    const lowerH = setback ? h * rand(0.62, 0.8) : h;

    const g = new THREE.BoxGeometry(w, lowerH, d);
    scaleBoxUV(g, w, lowerH, d, 4, 3.5);
    g.translate(cx, baseY + lowerH / 2, cz);
    this.buckets[styleIdx].push(g);

    let topY = baseY + lowerH;
    if (setback) {
      const w2 = w * rand(0.55, 0.78);
      const d2 = d * rand(0.55, 0.78);
      const h2 = h - lowerH;
      const g2 = new THREE.BoxGeometry(w2, h2, d2);
      scaleBoxUV(g2, w2, h2, d2, 4, 3.5);
      g2.translate(cx + rand(-1, 1), baseY + lowerH + h2 / 2, cz + rand(-1, 1));
      this.buckets[styleIdx].push(g2);
      topY = baseY + h;
    }

    const roof = new THREE.BoxGeometry(w + 0.5, 0.35, d + 0.5);
    roof.translate(cx, topY + 0.15, cz);
    this.roofGeos.push(roof);

    // rooftop clutter
    const props = Math.floor(rand(1, 4));
    for (let p = 0; p < props; p++) {
      const pw = rand(1, w * 0.24);
      const pd = rand(1, d * 0.24);
      const ph = rand(0.6, 2.2);
      const pg = new THREE.BoxGeometry(pw, ph, pd);
      pg.translate(cx + rand(-w / 2 + pw, w / 2 - pw), topY + 0.3 + ph / 2, cz + rand(-d / 2 + pd, d / 2 - pd));
      this.propGeos.push(pg);
    }

    // ground-floor trim / awning line
    const trim = new THREE.BoxGeometry(w + 0.24, 0.32, d + 0.24);
    trim.translate(cx, baseY + 3.6, cz);
    this.trimGeos.push(trim);

    if (h > 48) {
      const antenna = new THREE.CylinderGeometry(0.12, 0.22, rand(6, 16), 5);
      antenna.translate(cx + rand(-w / 4, w / 4), topY + 8, cz + rand(-d / 4, d / 4));
      this.antennaGeos.push(antenna);
    }

    this.colliders.push({
      minX: cx - w / 2 - 0.08,
      maxX: cx + w / 2 + 0.08,
      minZ: cz - d / 2 - 0.08,
      maxZ: cz + d / 2 + 0.08,
      height: topY + 1,
    });

    if (h > 42 && this.billboardSpots.length < 9) {
      this.billboardSpots.push({ x: cx, z: cz, y: topY, w, d, h });
    }
    if (h > 50) this.tallBuildings.push({ x: cx, z: cz, h });
  }

  _buildTrees() {
    const trunkGeo = new THREE.CylinderGeometry(0.16, 0.34, 5.6, 5);
    trunkGeo.translate(0, 2.8, 0);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b5138, roughness: 0.95 });

    // palm crown: drooping fronds
    const frondGeos = [];
    for (let f = 0; f < 8; f++) {
      const seg = 4;
      const positions = [];
      const indices = [];
      const uvs = [];
      const angle = (f / 8) * Math.PI * 2 + rand(-0.15, 0.15);
      const dir = new THREE.Vector2(Math.cos(angle), Math.sin(angle));
      const side = new THREE.Vector2(-dir.y, dir.x);
      const tilt = rand(0.15, 0.5);
      for (let s = 0; s <= seg; s++) {
        const t = s / seg;
        const dist = 0.2 + t * 3.1;
        const y = Math.sin(t * Math.PI * 0.7) * 0.6 - t * t * (1.1 + tilt);
        const width = (1 - t) * 0.42 + 0.04;
        const px = dir.x * dist;
        const pz = dir.y * dist;
        positions.push(px - side.x * width, y, pz - side.y * width);
        positions.push(px + side.x * width, y, pz + side.y * width);
        uvs.push(0, t, 1, t);
      }
      for (let s = 0; s < seg; s++) {
        const a = s * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      const fg = new THREE.BufferGeometry();
      fg.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      fg.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      fg.setIndex(indices);
      fg.computeVertexNormals();
      frondGeos.push(fg);
    }
    const crownGeo = mergeGeometries(frondGeos);
    crownGeo.translate(0, 5.4, 0);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x4f7a34, roughness: 0.85, side: THREE.DoubleSide });

    const palms = [];
    // palms on sidewalks, mostly on the west/north (vinewood) side
    for (const block of this.blocks) {
      if (block.isPark) {
        const n = Math.floor(rand(3, 8));
        for (let k = 0; k < n; k++) {
          palms.push({
            x: rand(block.x0 + 6, block.x1 - 6),
            z: rand(block.z0 + 6, block.z1 - 6),
            s: rand(0.8, 1.35),
            r: rand(0, Math.PI * 2),
          });
        }
        continue;
      }
      if (Math.random() < 0.5) {
        const side = Math.floor(Math.random() * 4);
        const t = rand(0.2, 0.8);
        let x = block.x0 + 2.4;
        let z = block.z0 + 2.4 + t * (block.z1 - block.z0 - 4.8);
        if (side === 1) { x = block.x1 - 2.4; }
        if (side === 2) { x = block.x0 + 2.4 + t * (block.x1 - block.x0 - 4.8); z = block.z0 + 2.4; }
        if (side === 3) { x = block.x0 + 2.4 + t * (block.x1 - block.x0 - 4.8); z = block.z1 - 2.4; }
        palms.push({ x, z, s: rand(0.75, 1.3), r: rand(0, Math.PI * 2) });
      }
    }

    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, palms.length);
    const crowns = new THREE.InstancedMesh(crownGeo, crownMat, palms.length);
    trunks.castShadow = true;
    crowns.castShadow = true;
    const dummy = new THREE.Object3D();
    palms.forEach((p, idx) => {
      dummy.position.set(p.x, 0.24, p.z);
      dummy.rotation.set(rand(-0.05, 0.05), p.r, rand(-0.05, 0.05));
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      trunks.setMatrixAt(idx, dummy.matrix);
      crowns.setMatrixAt(idx, dummy.matrix);
    });
    this.scene.add(trunks, crowns);

    // round park trees
    const canopyGeo = new THREE.IcosahedronGeometry(1, 1);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x40662f, roughness: 0.95, flatShading: true });
    const parkTrees = [];
    for (const block of this.parkBlocks) {
      const n = Math.floor(rand(4, 9));
      for (let k = 0; k < n; k++) {
        const x = rand(block.x0 + 7, block.x1 - 7);
        const z = rand(block.z0 + 7, block.z1 - 7);
        // avoid paths
        if (Math.abs(x - block.cx) < 4 || Math.abs(z - block.cz) < 4) continue;
        parkTrees.push({ x, z, s: rand(1.6, 3.4) });
      }
    }
    if (parkTrees.length) {
      const canopy = new THREE.InstancedMesh(canopyGeo, canopyMat, parkTrees.length);
      canopy.castShadow = true;
      parkTrees.forEach((t, idx) => {
        dummy.position.set(t.x, 4.6 + t.s * 0.35, t.z);
        dummy.rotation.set(rand(0, 3), rand(0, 3), 0);
        dummy.scale.set(t.s, t.s * 0.9, t.s);
        dummy.updateMatrix();
        canopy.setMatrixAt(idx, dummy.matrix);
      });
      this.scene.add(canopy);
      const trunkMat2 = new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 1 });
      const trunkGeo2 = new THREE.CylinderGeometry(0.28, 0.36, 5.5, 6);
      trunkGeo2.translate(0, 2.75, 0);
      const trunks2 = new THREE.InstancedMesh(trunkGeo2, trunkMat2, parkTrees.length);
      trunks2.castShadow = true;
      parkTrees.forEach((t, idx) => {
        dummy.position.set(t.x, 0.24, t.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        trunks2.setMatrixAt(idx, dummy.matrix);
      });
      this.scene.add(trunks2);
    }
  }

  _buildStreetLights() {
    const poleGeo = new THREE.CylinderGeometry(0.09, 0.13, 6.4, 6);
    poleGeo.translate(0, 3.2, 0);
    const armGeo = new THREE.BoxGeometry(0.11, 0.11, 1.9);
    armGeo.translate(0, 6.35, 0.95);
    const headGeo = new THREE.BoxGeometry(0.34, 0.14, 0.78);
    headGeo.translate(0, 6.28, 1.85);
    const poleMerged = mergeGeometries([poleGeo, armGeo]);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2e3234, roughness: 0.6, metalness: 0.55 });
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x302f29, emissive: 0xffd9a0, emissiveIntensity: 0.05, roughness: 0.4,
    });
    this.lampHeads = headMat;

    const lights = [];
    for (const block of this.blocks) {
      const corners = [
        { x: block.x0 + 1.1, z: block.z0 + 1.1, rot: Math.PI * 0.75 },
        { x: block.x1 - 1.1, z: block.z1 - 1.1, rot: Math.PI * 1.75 },
      ];
      if ((block.i + block.j) % 2 === 0) {
        corners.push({ x: block.x1 - 1.1, z: block.z0 + 1.1, rot: Math.PI * 1.25 });
        corners.push({ x: block.x0 + 1.1, z: block.z1 - 1.1, rot: Math.PI * 0.25 });
      }
      for (const c of corners) lights.push(c);
    }
    const poles = new THREE.InstancedMesh(poleMerged, poleMat, lights.length);
    const heads = new THREE.InstancedMesh(headGeo, headMat, lights.length);
    poles.castShadow = true;
    const dummy = new THREE.Object3D();
    lights.forEach((l, idx) => {
      dummy.position.set(l.x, 0.14, l.z);
      dummy.rotation.set(0, l.rot, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      poles.setMatrixAt(idx, dummy.matrix);
      heads.setMatrixAt(idx, dummy.matrix);
    });
    this.scene.add(poles, heads);

    // light pools
    const poolGeo = new THREE.CircleGeometry(5.2, 16);
    poolGeo.rotateX(-Math.PI / 2);
    this.lightPoolMat = new THREE.MeshBasicMaterial({
      color: 0xffc77a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
      depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2,
    });
    const pools = new THREE.InstancedMesh(poolGeo, this.lightPoolMat, lights.length);
    lights.forEach((l, idx) => {
      const dir = new THREE.Vector3(Math.sin(l.rot), 0, Math.cos(l.rot));
      dummy.position.set(l.x + dir.x * 3.4, 0.03, l.z + dir.z * 3.4);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      pools.setMatrixAt(idx, dummy.matrix);
    });
    this.scene.add(pools);
  }

  _buildCrosswalks() {
    const geos = [];
    const stripeGeo = new THREE.BoxGeometry(0.65, 0.03, 4.4);
    for (let i = GRID_MIN; i <= GRID_MAX; i++) {
      for (let j = GRID_MIN; j <= GRID_MAX; j++) {
        const cx = i * BLOCK;
        const cz = j * BLOCK;
        for (let side = 0; side < 4; side++) {
          for (let s = 0; s < 4; s++) {
            const g = stripeGeo.clone();
            const across = -ROAD / 2 + 2 + s * 1.4;
            if (side === 0) g.translate(cx + across, 0.035, cz - ROAD / 2 + 2.4);
            if (side === 1) g.translate(cx + across, 0.035, cz + ROAD / 2 - 2.4);
            if (side === 2) { g.rotateY(Math.PI / 2); g.translate(cx - ROAD / 2 + 2.4, 0.035, cz + across); }
            if (side === 3) { g.rotateY(Math.PI / 2); g.translate(cx + ROAD / 2 - 2.4, 0.035, cz + across); }
            geos.push(g);
          }
        }
      }
    }
    const mesh = new THREE.Mesh(mergeGeometries(geos), new THREE.MeshStandardMaterial({ color: 0xd3d0c2, roughness: 1 }));
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  _buildBillboards() {
    const ads = [
      { text: 'SPRUNK', bg: '#d9ff3f', fg: '#10130a', accent: '#ff4b3a' },
      { text: 'eCola', bg: '#e02b2b', fg: '#ffffff', accent: '#ffd23f' },
      { text: '24/7', bg: '#1d6fd6', fg: '#ffffff', accent: '#ffd23f' },
      { text: 'VINEWOOD', bg: '#151519', fg: '#f5dfa6', accent: '#c9a24a' },
      { text: 'LIFEINVADER', bg: '#0e1c2b', fg: '#61c9ff', accent: '#ff4b86' },
    ];
    const dirs = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)];
    this.billboardSpots.slice(0, ads.length).forEach((spot, i) => {
      const ad = ads[i];
      const tex = canvasTexture(512, 192, (ctx, w, h) => {
        ctx.fillStyle = ad.bg;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let x = 0; x < w; x += 18) ctx.fillRect(x, 0, 7, h);
        ctx.fillStyle = ad.accent;
        ctx.fillRect(0, h - 22, w, 22);
        ctx.fillStyle = ad.fg;
        ctx.font = '900 92px "Arial Black", Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ad.text, w / 2, h / 2 - 8);
        ctx.font = '700 20px Arial';
        ctx.fillStyle = ad.accent;
        ctx.fillText('LOS SANTOS', w / 2, h - 35);
      });
      const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.6, side: THREE.DoubleSide });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(15, 5.6), mat);
      const dir = dirs[i % dirs.length];
      const y = spot.y + rand(3, 7);
      plane.position.set(spot.x + dir.x * (spot.w / 2 + 0.4), y + 2.8, spot.z + dir.z * (spot.d / 2 + 0.4));
      plane.rotation.y = Math.atan2(dir.x, dir.z);
      this.scene.add(plane);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(15.6, 6.2, 0.25), new THREE.MeshStandardMaterial({ color: 0x222528, roughness: 0.5, metalness: 0.6 }));
      frame.position.copy(plane.position);
      frame.rotation.y = plane.rotation.y;
      frame.translateZ(-0.18);
      this.scene.add(frame);
      if (!this.billboardMats) this.billboardMats = [];
      this.billboardMats.push(mat);
    });
  }

  _buildHorizon() {
    this.clouds = new THREE.Group();
    const hillMatA = new THREE.MeshStandardMaterial({ color: 0x2c3d31, roughness: 1, flatShading: true });
    const hillMatB = new THREE.MeshStandardMaterial({ color: 0x3a4c39, roughness: 1, flatShading: true });
    const hillGeo = new THREE.IcosahedronGeometry(1, 1);
    this.hillMat = hillMatA;
    const hills = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const r = rand(780, 980);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const s = rand(150, 270);
      const h = rand(60, 145);
      const m = new THREE.Mesh(hillGeo, i % 2 ? hillMatA : hillMatB);
      m.position.set(x, -10, z);
      m.scale.set(s, h, s * rand(0.7, 1.1));
      m.rotation.y = rand(0, 3);
      hills.add(m);
    }
    // dedicated vinewood hill & sign
    const bigHill = new THREE.Mesh(hillGeo, hillMatA);
    bigHill.position.set(-60, -16, -780);
    bigHill.scale.set(430, 195, 250);
    hills.add(bigHill);

    const signTex = canvasTexture(1024, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.font = '900 168px "Arial Black", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(245,245,235,0.92)';
      ctx.fillText('VINEWOOD', w / 2, h / 2 + 8);
    });
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(210, 52),
      new THREE.MeshBasicMaterial({ map: signTex, transparent: true, depthWrite: false, fog: true })
    );
    sign.position.set(-62, 158, -664);
    sign.rotation.y = 0;
    this.scene.add(sign);
    this.scene.add(hills);

    // clouds are intentionally omitted: the flat low-poly blobs read as artefacts at this scale
  }

  /* ---------- map for radar ---------- */

  _buildMap() {
    const size = 1024;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const scale = size / (MAP_EXTENT * 2);
    const toPx = (v) => (v + MAP_EXTENT) * scale;

    ctx.fillStyle = '#0c1a16';
    ctx.fillRect(0, 0, size, size);
    // land
    ctx.fillStyle = '#152b23';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.49, 0, Math.PI * 2);
    ctx.fill();

    // blocks
    for (const b of this.blocks) {
      const x = toPx(b.x0);
      const z = toPx(b.z0);
      const w = (b.x1 - b.x0) * scale;
      const d = (b.z1 - b.z0) * scale;
      if (b.isPark) ctx.fillStyle = '#22482e';
      else if (b.isParking) ctx.fillStyle = '#2b3a3c';
      else ctx.fillStyle = '#253836';
      ctx.fillRect(x, z, w, d);
    }
    // building footprints
    ctx.fillStyle = '#3b5754';
    for (const col of this.colliders) {
      ctx.fillRect(toPx(col.minX), toPx(col.minZ), (col.maxX - col.minX) * scale, (col.maxZ - col.minZ) * scale);
    }
    // roads
    ctx.strokeStyle = '#4c5b5e';
    ctx.lineWidth = ROAD * scale;
    ctx.lineCap = 'square';
    for (let i = GRID_MIN; i <= GRID_MAX; i++) {
      ctx.beginPath();
      ctx.moveTo(toPx(i * BLOCK), toPx(GRID_MIN * BLOCK));
      ctx.lineTo(toPx(i * BLOCK), toPx(GRID_MAX * BLOCK));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(toPx(GRID_MIN * BLOCK), toPx(i * BLOCK));
      ctx.lineTo(toPx(GRID_MAX * BLOCK), toPx(i * BLOCK));
      ctx.stroke();
    }
    // road centre lines
    ctx.strokeStyle = 'rgba(210,200,140,0.22)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    for (let i = GRID_MIN; i <= GRID_MAX; i++) {
      ctx.beginPath();
      ctx.moveTo(toPx(i * BLOCK), toPx(GRID_MIN * BLOCK));
      ctx.lineTo(toPx(i * BLOCK), toPx(GRID_MAX * BLOCK));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(toPx(GRID_MIN * BLOCK), toPx(i * BLOCK));
      ctx.lineTo(toPx(GRID_MAX * BLOCK), toPx(i * BLOCK));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // shoreline
    ctx.strokeStyle = 'rgba(90,150,150,0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.485, 0, Math.PI * 2);
    ctx.stroke();

    this.mapCanvas = c;
    this.mapScale = scale;
  }

  /* ---------- time of day ---------- */

  _applyTime(dt) {
    const t = this.timeOfDay;
    const ang = ((t - 6) / 12) * Math.PI;
    const elev = Math.sin(ang);
    const horiz = Math.cos(ang);
    const sunDir = new THREE.Vector3(horiz, elev, 0.36).normalize();
    this.sunDir = sunDir;

    const day = smoothstep(-0.08, 0.22, elev);
    const night = 1 - day;
    const dusk = clamp(1 - Math.abs(elev) / 0.28, 0, 1) * (elev > -0.18 ? 1 : 0);
    this.night = night;
    this.day = day;

    const zenith = new THREE.Color('#060b16').lerp(new THREE.Color('#3f7cbe'), day);
    zenith.lerp(new THREE.Color('#4d5a86'), dusk * 0.55);
    const horizon = new THREE.Color('#131d2c').lerp(new THREE.Color('#c3d8e5'), day);
    horizon.lerp(new THREE.Color('#ff9560'), dusk * 0.85);

    this.skyUniforms.zenith.value.copy(zenith);
    this.skyUniforms.horizon.value.copy(horizon);
    this.skyUniforms.sunDir.value.copy(sunDir);
    const sunCol = new THREE.Color('#ffb26a').lerp(new THREE.Color('#fff5dc'), clamp(elev * 2.2, 0, 1));
    this.skyUniforms.sunColor.value.copy(sunCol);
    this.skyUniforms.intensity.value = 0.5 + day * 1.0;

    this.scene.fog.color.copy(horizon);
    this.scene.fog.near = 240;
    this.scene.fog.far = 1500 - night * 320;

    const sunIntensity = day * (2.3 + dusk * 0.6) + night * 0.05;
    this.sun.intensity = sunIntensity;
    this.sun.color.copy(sunCol);
    this.sun.visible = elev > -0.08;
    this.hemi.intensity = 0.34 + day * 0.66;
    this.hemi.color.copy(horizon);
    this.hemi.groundColor.setHex(0x2a2a22);
    this.ambient.intensity = 0.3 + day * 0.12;
    this.ambient.color.setHex(night > 0.5 ? 0x27364a : 0x4a4a44);
    this.fill.intensity = 0.16 + day * 0.39;
    this.fill.color.copy(horizon);

    this.stars.material.opacity = night * 0.9;
    this.clouds.children.forEach((c) => { c.material.opacity = 0.06 + day * 0.18; });

    const lampOn = 1 - smoothstep(0.0, 0.2, elev);
    this.lampHeads.emissiveIntensity = 0.05 + lampOn * 2.4;
    this.lightPoolMat.opacity = lampOn * 0.16;
    for (const mat of this.facadeMaterials) mat.emissiveIntensity = lampOn * 0.95;
    if (this.billboardMats) for (const mat of this.billboardMats) mat.emissiveIntensity = 0.15 + lampOn * 0.8;

    this.hillMat.color.setHex(0x2c3d31).lerp(new THREE.Color(0x101a22), night * 0.75);
    this.land?.material?.color?.setHex?.(0x3c4638);
  }

  update(dt, focus) {
    this.timeOfDay = (this.timeOfDay + dt * this.timeScale) % 24;
    this._applyTime(dt);

    // keep sun shadow volume around player
    if (focus) {
      if (this._shadowFocus.distanceToSquared(focus) > 36) {
        this._shadowFocus.copy(focus);
        const d = this.sunDir || new THREE.Vector3(0.4, 0.8, 0.3);
        this.sun.position.set(focus.x + d.x * 180, focus.y + d.y * 180 + 40, focus.z + d.z * 180);
        this.sunTarget.position.set(focus.x, 0, focus.z);
      }
      this.sky.position.set(focus.x, 0, focus.z);
      this.stars.position.set(focus.x, 0, focus.z);
      this.clouds.position.set(focus.x * 0.4, 0, focus.z * 0.4);
    }
  }

  /* ---------- queries ---------- */

  isBlocked(x, z, r = 0) {
    for (const c of this.colliders) {
      if (x + r < c.minX || x - r > c.maxX || z + r < c.minZ || z - r > c.maxZ) continue;
      const nx = clamp(x, c.minX, c.maxX);
      const nz = clamp(z, c.minZ, c.maxZ);
      if ((x - nx) ** 2 + (z - nz) ** 2 < r * r) return true;
    }
    return false;
  }

  resolveCircle(x, z, r) {
    let hit = false;
    for (const c of this.colliders) {
      if (x + r < c.minX || x - r > c.maxX || z + r < c.minZ || z - r > c.maxZ) continue;
      const nx = clamp(x, c.minX, c.maxX);
      const nz = clamp(z, c.minZ, c.maxZ);
      let dx = x - nx;
      let dz = z - nz;
      let d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      hit = true;
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2);
        const push = r - d;
        x += (dx / d) * push;
        z += (dz / d) * push;
      } else {
        // centre inside: push out via nearest face
        const dl = x - c.minX;
        const dr = c.maxX - x;
        const db = z - c.minZ;
        const dt = c.maxZ - z;
        const m = Math.min(dl, dr, db, dt);
        if (m === dl) x = c.minX - r;
        else if (m === dr) x = c.maxX + r;
        else if (m === db) z = c.minZ - r;
        else z = c.maxZ + r;
      }
    }
    const bound = CITY_BOUND + 22;
    if (x < -bound) { x = -bound; hit = true; }
    if (x > bound) { x = bound; hit = true; }
    if (z < -bound) { z = -bound; hit = true; }
    if (z > bound) { z = bound; hit = true; }
    return { x, z, hit };
  }

  lineBlocked(ax, az, bx, bz) {
    // 2D segment vs building AABBs; used for line of sight
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < 0.001) return false;
    for (const c of this.colliders) {
      let tmin = 0;
      let tmax = 1;
      let ok = true;
      for (const [p, d, min, max] of [[ax, dx, c.minX, c.maxX], [az, dz, c.minZ, c.maxZ]]) {
        if (Math.abs(d) < 1e-8) {
          if (p < min || p > max) { ok = false; break; }
        } else {
          let t1 = (min - p) / d;
          let t2 = (max - p) / d;
          if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
          tmin = Math.max(tmin, t1);
          tmax = Math.min(tmax, t2);
          if (tmin > tmax) { ok = false; break; }
        }
      }
      if (ok && tmin < 0.99 && tmax > 0.01) return true;
    }
    return false;
  }

  rayAABB(origin, dir, maxDist) {
    let nearest = maxDist;
    for (const c of this.colliders) {
      let tmin = 0;
      let tmax = nearest;
      let ok = true;
      for (const [axis, min, max] of [
        ['x', c.minX, c.maxX],
        ['y', 0, c.height],
        ['z', c.minZ, c.maxZ],
      ]) {
        const o = origin[axis];
        const d = dir[axis];
        if (Math.abs(d) < 1e-8) {
          if (o < min || o > max) { ok = false; break; }
        } else {
          let t1 = (min - o) / d;
          let t2 = (max - o) / d;
          if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
          tmin = Math.max(tmin, t1);
          tmax = Math.min(tmax, t2);
          if (tmin > tmax) { ok = false; break; }
        }
      }
      if (ok && tmin < nearest) nearest = tmin;
    }
    return nearest;
  }

  nearestRoad(x, z) {
    const i = Math.round(x / BLOCK);
    const j = Math.round(z / BLOCK);
    return { x: clamp(i, GRID_MIN, GRID_MAX) * BLOCK, z: clamp(j, GRID_MIN, GRID_MAX) * BLOCK };
  }

  randomRoadPosition(minDist = 0, maxDist = 400, from = null) {
    for (let tries = 0; tries < 40; tries++) {
      const along = Math.random() < 0.5;
      const lineIdx = Math.floor(rand(GRID_MIN, GRID_MAX + 1));
      const t = rand(GRID_MIN, GRID_MAX) * BLOCK;
      let x = along ? lineIdx * BLOCK : t;
      let z = along ? t : lineIdx * BLOCK;
      const dir = Math.random() < 0.5 ? 1 : -1;
      if (along) z += 3.6 * dir; else x -= 3.6 * dir;
      if (from) {
        const d = Math.hypot(x - from.x, z - from.z);
        if (d < minDist || d > maxDist) continue;
      }
      return { x, z, along, dir };
    }
    return { x: 0, z: 50, along: true, dir: 1 };
  }

  sidewalkLoop(block, t) {
    const inset = 2.2;
    const x0 = block.x0 + inset;
    const x1 = block.x1 - inset;
    const z0 = block.z0 + inset;
    const z1 = block.z1 - inset;
    const w = x1 - x0;
    const d = z1 - z0;
    const per = 2 * (w + d);
    let p = ((t % per) + per) % per;
    let x;
    let z;
    let dx;
    let dz;
    if (p < w) { x = x0 + p; z = z0; dx = 1; dz = 0; }
    else if (p < w + d) { x = x1; z = z0 + (p - w); dx = 0; dz = 1; }
    else if (p < 2 * w + d) { x = x1 - (p - w - d); z = z1; dx = -1; dz = 0; }
    else { x = x0; z = z1 - (p - 2 * w - d); dx = 0; dz = -1; }
    return { x, z, dx, dz, per };
  }

  randomSidewalk() {
    const block = pick(this.blocks);
    const loop = this.sidewalkLoop(block, rand(0, 1000));
    return { x: loop.x, z: loop.z, block };
  }

  areaName(x, z) {
    const d = Math.hypot(x, z);
    if (d < 130) return { name: 'DOWNTOWN LOS SANTOS', sub: 'CITY CENTRE' };
    if (z < -140) return { name: 'VINEWOOD HILLS', sub: 'NORTH LOS SANTOS' };
    if (z > 140) return { name: 'DEL PERRO', sub: 'SOUTH BEACH' };
    if (x > 130) return { name: 'EAST LOS SANTOS', sub: 'INDUSTRIAL DISTRICT' };
    if (x < -140) return { name: 'VESPUCCI BEACH', sub: 'WEST COAST' };
    return { name: 'MORNINGWOOD', sub: 'LOS SANTOS' };
  }
}

function scalePlaneUV(geo, u, v) {
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * u, uv.getY(i) * v);
  }
  uv.needsUpdate = true;
}

function hash2(i, j) {
  let h = i * 374761393 + j * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}
