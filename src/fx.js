import * as THREE from 'three';

const tmpV = new THREE.Vector3();

function softDotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class FX {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.tracers = [];
    this.bursts = [];
    this.decals = [];
    this.shake = 0;
    this.dotTex = softDotTexture();
    this.tracerMat = new THREE.LineBasicMaterial({
      color: 0xffdf9a, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    });
  }

  tracer(from, to, color = 0xffe3a0, life = 0.07) {
    const geo = new THREE.BufferGeometry().setFromPoints([from.clone(), to.clone()]);
    const mat = this.tracerMat.clone();
    mat.color.setHex(color);
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    this.scene.add(line);
    this.tracers.push({ line, life, max: life });
    if (this.tracers.length > 70) this._killTracer(this.tracers.shift());
  }

  _killTracer(t) {
    this.scene.remove(t.line);
    t.line.geometry.dispose();
    t.line.material.dispose();
  }

  burst(pos, opts = {}) {
    const count = opts.count ?? 8;
    const color = opts.color ?? 0xffcc66;
    const speed = opts.speed ?? 5;
    const life = opts.life ?? 0.5;
    const size = opts.size ?? 0.16;
    const gravity = opts.gravity ?? 9;
    const spread = opts.spread ?? 1;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = [];
    const c = new THREE.Color(color);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * speed * spread,
        Math.random() * speed * 0.8,
        (Math.random() - 0.5) * speed * spread
      ));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size, vertexColors: true, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false,
      map: this.dotTex, alphaTest: 0.01,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    this.scene.add(points);
    this.bursts.push({ points, velocities, life, max: life, gravity, kind: opts.kind || 'spark' });
  }

  sparks(pos, normal) {
    this.burst(pos, { count: 10, color: 0xffc04d, speed: 7, life: 0.35, size: 0.12, spread: 1.2 });
    this.burst(pos, { count: 3, color: 0x9a9a9a, speed: 2.5, life: 0.8, size: 0.3, gravity: 1.5, kind: 'smoke' });
  }

  blood(pos) {
    this.burst(pos, { count: 12, color: 0xa31212, speed: 3.4, life: 0.7, size: 0.14, gravity: 12, spread: 1.2 });
  }

  explosion(pos) {
    this.burst(pos.clone().add(new THREE.Vector3(0, 1.1, 0)), { count: 30, color: 0xffb347, speed: 15, life: 0.7, size: 0.8, gravity: 4 });
    this.burst(pos.clone().add(new THREE.Vector3(0, 1.6, 0)), { count: 22, color: 0xff5a2a, speed: 8, life: 1.1, size: 1.2, gravity: 1 });
    this.burst(pos.clone().add(new THREE.Vector3(0, 1.9, 0)), { count: 16, color: 0x2a2a2a, speed: 3.5, life: 2.4, size: 2.0, gravity: -0.5, kind: 'smoke' });
    this.shake = Math.max(this.shake, 0.9);
    const light = new THREE.PointLight(0xff8a3d, 18, 40, 1.6);
    light.position.copy(pos).add(new THREE.Vector3(0, 2, 0));
    this.scene.add(light);
    setTimeout(() => this.scene.remove(light), 350);
  }

  bloodPool(pos) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x5e0d0d, transparent: true, opacity: 0.75, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -4,
    });
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.7 + Math.random() * 0.5, 12), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(pos.x, 0.045, pos.z);
    m.scale.set(1, 0.6 + Math.random() * 0.5, 1);
    m.rotation.z = Math.random() * Math.PI;
    this.scene.add(m);
    this.decals.push({ mesh: m, life: 30 });
    if (this.decals.length > 26) {
      const d = this.decals.shift();
      this.scene.remove(d.mesh);
      d.mesh.geometry.dispose();
      d.mesh.material.dispose();
    }
  }

  impact(pos, normal) {
    this.burst(pos, { count: 6, color: 0xffd08a, speed: 5, life: 0.28, size: 0.1, spread: 1 });
  }

  update(dt) {
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      t.line.material.opacity = Math.max(0, t.life / t.max);
      if (t.life <= 0) {
        this._killTracer(t);
        this.tracers.splice(i, 1);
      }
    }
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.life -= dt;
      const p = b.points.geometry.attributes.position;
      for (let k = 0; k < b.velocities.length; k++) {
        const v = b.velocities[k];
        v.y -= b.gravity * dt;
        p.array[k * 3] += v.x * dt;
        p.array[k * 3 + 1] += v.y * dt;
        p.array[k * 3 + 2] += v.z * dt;
      }
      p.needsUpdate = true;
      b.points.material.opacity = Math.max(0, b.life / b.max);
      if (b.kind === 'smoke') b.points.material.size *= 1 + dt * 0.8;
      if (b.life <= 0) {
        this.scene.remove(b.points);
        b.points.geometry.dispose();
        b.points.material.dispose();
        this.bursts.splice(i, 1);
      }
    }
    for (let i = this.decals.length - 1; i >= 0; i--) {
      const d = this.decals[i];
      d.life -= dt;
      if (d.life < 4) d.mesh.material.opacity = Math.max(0, (d.life / 4) * 0.75);
      if (d.life <= 0) {
        this.scene.remove(d.mesh);
        d.mesh.geometry.dispose();
        d.mesh.material.dispose();
        this.decals.splice(i, 1);
      }
    }
    this.shake = Math.max(0, this.shake - dt * 2.4);
  }
}
