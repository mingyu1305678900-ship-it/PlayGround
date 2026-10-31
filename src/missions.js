import * as THREE from 'three';
import { Gangster } from './characters.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

const GARAGE = { x: -78, z: -39 };
const POLICE_TRAP = { x: 0, z: 78 };
const BANK = { x: 78, z: 0 };
const LOCKUP = { x: -234, z: 234 };

function createMarker(scene) {
  const group = new THREE.Group();
  group.visible = false;

  const ringMat = new THREE.MeshBasicMaterial({ color: 0xf4c542, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 2.15, 40), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.16;
  group.add(ring);

  const innerRing = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.78, 28), ringMat);
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.y = 0.17;
  group.add(innerRing);

  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xf4c542, transparent: true, opacity: 0.055, side: THREE.DoubleSide,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.95, 5.2, 24, 1, true), beamMat);
  beam.position.y = 2.6;
  group.add(beam);

  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.48, 0),
    new THREE.MeshBasicMaterial({ color: 0xffdb5c, toneMapped: false })
  );
  diamond.position.y = 3.4;
  group.add(diamond);

  const light = new THREE.PointLight(0xffcc55, 2.4, 14, 1.4);
  light.position.y = 1.6;
  group.add(light);

  scene.add(group);
  return { group, ring, innerRing, beam, diamond, light };
}

export class MissionManager {
  constructor(game) {
    this.game = game;
    this.marker = createMarker(game.scene);
    this.activeMarker = null;
    this.targetVehicle = null;
    this.state = 'idle';
    this.delay = 6;
    this.index = 0;
    this.stage = 0;
    this.timer = 0;
    this.progress = 0;
    this.gangsters = [];
    this.markerTime = 0;
    this.done = false;
    this.lastHint = 0;
    this.hintShown = false;
    this.cooldown = 0;
    this.pendingIndex = 0;
    this.mode = 'advance';
    this.parkingBlock = game.world.parkingBlocks
      .filter((b) => Math.hypot(b.cx, b.cz) < 220)
      .sort((a, b) => Math.hypot(a.cx, a.cz) - Math.hypot(b.cx, b.cz))[0] || game.world.parkingBlocks[0] || null;
    this.parkingSpot = this.parkingBlock
      ? { x: this.parkingBlock.cx, z: this.parkingBlock.cz }
      : { x: 78 * 2, z: 78 * 1 };
    this.bankProgress = 0;
  }

  start() {
    this.state = 'idle';
    this.delay = 6;
    this.index = 0;
    this.done = false;
    if (!this.game.parkingBlock) {
      const b = this.game.world.parkingBlocks
        .filter((b) => Math.hypot(b.cx, b.cz) < 220)
        .sort((a, b) => Math.hypot(a.cx, a.cz) - Math.hypot(b.cx, b.cz))[0];
      if (b) this.parkingSpot = { x: b.cx, z: b.cz };
    }
  }

  setMarker(pos, radius = 0) {
    if (!pos) {
      this.marker.group.visible = false;
      this.activeMarker = null;
      return;
    }
    this.marker.group.visible = true;
    this.marker.group.position.set(pos.x, 0, pos.z);
    this.activeMarker = { x: pos.x, z: pos.z, radius };
  }

  update(dt) {
    const game = this.game;
    this.markerTime += dt;
    if (this.marker.group.visible) {
      this.marker.diamond.rotation.y += dt * 1.4;
      this.marker.diamond.position.y = 3.3 + Math.sin(this.markerTime * 2.2) * 0.18;
      this.marker.ring.rotation.z += dt * 0.5;
      this.marker.innerRing.rotation.z -= dt * 0.8;
      this.marker.beam.material.opacity = 0.045 + Math.sin(this.markerTime * 2.4) * 0.015;
    }

    if (this.state === 'idle') {
      this.delay -= dt;
      if (this.delay <= 0) this.startMission(this.index);
      return;
    }
    if (this.state === 'cooldown') {
      this.cooldown -= dt;
      if (this.cooldown <= 0) {
        if (this.mode === 'advance') {
          this.index++;
          if (this.index >= 4) {
            this.done = true;
            this.state = 'done';
            game.hud.setObjective('');
            game.hud.subtitle('모든 임무 완료. 이제 로스 산토스는 당신의 놀이터입니다.', 5);
            game.notify('FREEROAM', '모든 임무를 완료했습니다. 자유롭게 도시를 누비세요.', 'money-note');
            return;
          }
        }
        this.startMission(this.index);
      }
      return;
    }
    if (this.state !== 'active') return;
    if (!game.player.alive) return;

    const player = game.player;
    const targetPos = player.vehicle ? player.vehicle.pos : player.pos;
    const distPlayer = (p) => Math.hypot(targetPos.x - p.x, targetPos.z - p.z);

    switch (this.index) {
      case 0:
        this._updateRepo(dt, distPlayer, player);
        break;
      case 1:
        this._updateShakedown(dt, distPlayer, player);
        break;
      case 2:
        this._updateHeat(dt, distPlayer, player);
        break;
      case 3:
        this._updateHeist(dt, distPlayer, player);
        break;
      default:
        break;
    }
  }

  startMission(i) {
    const game = this.game;
    this.index = i;
    this.state = 'active';
    this.stage = 0;
    this.timer = 0;
    this.progress = 0;
    this.bankProgress = 0;
    this.hintShown = false;
    this.markerTime = 0;
    game.hud.hideBig();
    this.gangsters.forEach((g) => {
      const idx = game.enemies.indexOf(g);
      if (idx >= 0) game.enemies.splice(idx, 1);
      g.remove();
    });
    this.gangsters = [];

    if (i === 0) {
      let car = this.targetVehicle;
      if (!car || car.dead) {
        car = game.vehicles.add({ x: 159.8, z: 174.5, heading: Math.PI, type: 'sports', color: 0xd97a24 });
        this.targetVehicle = car;
      }
      this.setMarker({ x: car.pos.x, z: car.pos.z }, 5);
      game.hud.setObjective('LAMAR의 일감 — 노란 마커로 이동해 회수 차량을 확보하세요');
      game.hud.subtitle('LAMAR: 어이, 첫 일감이다. 그 스포츠카, 회수해서 차고지로 가져와.', 4.6);
      game.notify('새 임무 · REPOSSESSION', '노란 마커로 가서 차량을 회수하세요.', '');
    } else if (i === 1) {
      this.setMarker(this.parkingSpot, 5);
      game.hud.setObjective('SHAKEDOWN — 주차장으로 이동하세요');
      game.hud.subtitle('LAMAR: 조직원들이 네 구역에서 장사를 벌이고 있어. 정리해 줘.', 4.6);
      game.notify('새 임무 · SHAKEDOWN', '주차장에서 조직원 4명을 제거하세요.', '');
    } else if (i === 2) {
      this.setMarker(POLICE_TRAP, 6);
      game.hud.setObjective('HEAT — 경찰의 함정으로 이동하세요');
      game.hud.subtitle('LAMAR: 경찰이 널 찾고 있어. 일부러 걸려서 실력을 보여줘.', 4.6);
      game.notify('새 임무 · HEAT', '경찰을 유인해 45초간 버티세요.', 'police');
    } else if (i === 3) {
      this.setMarker(BANK, 6);
      game.hud.setObjective('THE BIG SCORE — 은행으로 이동하세요');
      game.hud.subtitle('LAMAR: 큰 거 한 건 가자. 은행 금고를 털고 차로 탈출해.', 4.8);
      game.notify('새 임무 · THE BIG SCORE', '은행 금고를 털고 현금을 락업으로 운반하세요.', 'money-note');
    }
  }

  _updateRepo(dt, dist, player) {
    const game = this.game;
    const car = this.targetVehicle;
    if (!car || car.dead) {
      this.fail('회수 차량이 파괴되었습니다.');
      return;
    }
    if (this.stage === 0) {
      this.setMarker({ x: car.pos.x, z: car.pos.z }, 5);
      if (dist({ x: car.pos.x, z: car.pos.z }) < 7 && !player.vehicle) {
        if (!this.hintShown) {
          this.hintShown = true;
          game.hud.subtitle('차량에 다가가 F 를 누르면 훔칠 수 있습니다.', 3.2);
        }
      }
      if (player.vehicle === car) {
        this.stage = 1;
        this.setMarker(GARAGE, 7);
        game.hud.setObjective('회수 차량을 차고지로 배달하세요');
        game.hud.subtitle('차고지까지 운전하세요. 경찰에 걸리지 않게 조심하고.', 3.4);
        game.notify('차량 확보', '차고지로 이동하세요.', '');
      } else if (player.vehicle && player.vehicle !== car) {
        if (!this.hintShown) {
          this.hintShown = true;
          game.hud.subtitle('회수 대상 차량은 주황색 스포츠카입니다.', 2.8);
        }
      }
    } else {
      this.setMarker(GARAGE, 7);
      if (dist(GARAGE) < 9 && player.vehicle === car) {
        this.pass(2500, 'REPOSSESSION');
      }
      if (dist(GARAGE) < 9 && player.vehicle !== car) {
        if (!this.hintShown) {
          this.hintShown = true;
          game.hud.subtitle('회수 차량을 차고지로 가져와야 합니다.', 2.8);
        }
      }
    }
  }

  _updateShakedown(dt, dist, player) {
    const game = this.game;
    if (this.stage === 0) {
      if (dist(this.parkingSpot) < 8) {
        this.stage = 1;
        this.setMarker(null);
        this.spawnGangsters();
        game.hud.setObjective('조직원 4명을 제거하세요 (0/4)');
        game.hud.subtitle('LAMAR: 조심해, 총 들고 있어. 엄폐물을 활용해.', 3.6);
        game.notify('교전 발생', '조직원 4명이 당신을 노리고 있습니다.', 'police');
        game.audio.wanted();
      }
      return;
    }
    const alive = this.gangsters.filter((g) => g.alive).length;
    const killed = this.gangsters.length - alive;
    game.hud.setObjective(`조직원 ${this.gangsters.length}명을 제거하세요 (${killed}/${this.gangsters.length})`);
    if (alive === 0) this.pass(4000, 'SHAKEDOWN');
  }

  _updateHeat(dt, dist, player) {
    const game = this.game;
    if (this.stage === 0) {
      if (dist(POLICE_TRAP) < 9) {
        this.stage = 1;
        this.timer = 45;
        this.setMarker(null);
        game.raiseWanted(2, '함정에 걸렸습니다', true);
        game.hud.setObjective('경찰의 공격을 45초간 버티세요');
        game.hud.subtitle('45초만 버티면 돼. 차를 훔쳐 도망다녀도 좋아.', 3.6);
      }
      return;
    }
    this.timer -= dt;
    const left = Math.max(0, Math.ceil(this.timer));
    game.hud.setObjective(`경찰의 공격을 버티세요 — ${left}초`);
    if (game.wanted === 0 && left < 40) {
      game.raiseWanted(2, '경찰이 다시 몰려옵니다', true);
    }
    if (game.player.health < 25) game.player.health = Math.min(100, game.player.health + dt * 1.4);
    if (this.timer <= 0) {
      game.clearWanted();
      this.pass(6000, 'HEAT');
    }
  }

  _updateHeist(dt, dist, player) {
    const game = this.game;
    if (this.stage === 0) {
      if (dist(BANK) < 9) {
        this.stage = 1;
        this.bankProgress = 0;
        this.setMarker(null);
        game.hud.setObjective('은행 금고를 털어라');
        game.hud.subtitle('금고 앞에서 잠시 기다리면 현금을 확보할 수 있습니다.', 3.4);
        game.notify('은행 습격', '금고를 털고 차량으로 탈출하세요.', 'money-note');
      }
      return;
    }
    if (this.stage === 1) {
      const bankDist = Math.hypot(player.pos.x - BANK.x, player.pos.z - BANK.z);
      if (bankDist < 10) {
        this.bankProgress += dt;
        const pct = Math.min(100, Math.round((this.bankProgress / 3.2) * 100));
        game.hud.setObjective(`은행 금고를 터는 중... ${pct}%`);
        if (this.bankProgress >= 3.2) {
          this.stage = 2;
          game.addMoney(1500);
          game.raiseWanted(3, '은행 강도', true);
          this.setMarker(LOCKUP, 8);
          game.hud.setObjective('현금을 차량에 싣고 락업으로 이동하세요');
          game.hud.subtitle('차량을 찾아 락업까지 도주하세요. 경찰이 출동했습니다.', 4);
          game.notify('현금 확보', '$1,500 확보 · 락업으로 이동하세요.', 'money-note');
        }
      } else {
        game.hud.setObjective('은행 금고 앞으로 돌아가세요');
      }
      return;
    }
    if (this.stage === 2) {
      this.setMarker(LOCKUP, 8);
      if (player.vehicle && dist(LOCKUP) < 10) {
        game.clearWanted();
        this.pass(25000, 'THE BIG SCORE');
      } else if (!player.vehicle && dist(LOCKUP) < 10) {
        if (!this.hintShown) {
          this.hintShown = true;
          game.hud.subtitle('현금을 차량에 싣고 와야 합니다. 근처 차량을 훔치세요.', 3.2);
        }
      }
    }
  }

  spawnGangsters() {
    const game = this.game;
    const base = this.parkingSpot;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + rand(-0.3, 0.3);
      let x = base.x + Math.cos(a) * rand(9, 15);
      let z = base.z + Math.sin(a) * rand(9, 15);
      const res = game.world.resolveCircle(x, z, 0.5);
      x = res.x;
      z = res.z;
      const g = new Gangster(game.scene, {
        x, z, heading: Math.atan2(base.x - x, base.z - z),
        health: 110,
      });
      game.enemies.push(g);
      this.gangsters.push(g);
    }
  }

  pass(reward, title) {
    const game = this.game;
    this.state = 'cooldown';
    this.mode = 'advance';
    this.cooldown = 9;
    this.setMarker(null);
    this.targetVehicle = null;
    game.addMoney(reward);
    game.hud.setObjective('', true);
    game.hud.showBig('MISSION PASSED', `+$${reward.toLocaleString('en-US')}`, 'pass', 4.6);
    game.hud.subtitle(`${title} 완료 · 다음 일감이 곧 들어옵니다.`, 4);
    game.notify('임무 완료 · ' + title, `보상 +$${reward.toLocaleString('en-US')}`, 'money-note');
    game.audio.missionPassed();
    game.fx.shake = 0.12;
    if (this.gangsters.length) {
      // leave bodies, clear references
      this.gangsters = this.gangsters.filter((g) => g.alive);
    }
  }

  fail(reason) {
    if (this.state !== 'active') return;
    const game = this.game;
    this.state = 'cooldown';
    this.mode = 'retry';
    this.cooldown = 8;
    this.setMarker(null);
    this.targetVehicle = null;
    game.hud.setObjective('', true);
    game.hud.showBig('MISSION FAILED', reason, '', 4);
    game.hud.subtitle('잠시 후 임무를 다시 시작할 수 있습니다.', 3);
    game.notify('임무 실패', reason, 'police');
    game.audio.missionFailed();
    for (const g of this.gangsters) {
      const idx = game.enemies.indexOf(g);
      if (idx >= 0) game.enemies.splice(idx, 1);
      g.remove();
    }
    this.gangsters = [];
  }

  onPlayerDeath() {
    if (this.state === 'active') this.fail('사망했습니다.');
  }

  onWantedCleared() {
    if (this.state === 'active' && this.index === 2 && this.stage === 1 && this.timer > 0) {
      game_heatContinue(this.game);
    }
    if (this.game.wanted === 0 && this.state === 'active' && this.stage === 2) {
      this.game.notify('수배 해제', '경찰이 수색을 포기했습니다. 락업으로 이동하세요.', '');
    }
  }
}

function game_heatContinue(game) {
  game.hud.subtitle('경찰이 잠시 후퇴했습니다. 남은 시간을 버티세요.', 2.4);
}
