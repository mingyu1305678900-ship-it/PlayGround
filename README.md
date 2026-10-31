# PlayGround

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://omgithub.com).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://omgithub.com/mingyu1305678900-ship-it/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/mingyu1305678900-ship-it/PlayGround)

- 🎮 [Open the project](https://omgithub.com/mingyu1305678900-ship-it/PlayGround).
- ✨ [Remix this project](https://omgithub.com/?remix=mingyu1305678900-ship-it%2FPlayGround).
- 💻 [Explore the source](https://github.com/mingyu1305678900-ship-it/PlayGround).
- 🛠️ [Check build runs](https://github.com/mingyu1305678900-ship-it/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/mingyu1305678900-ship-it/PlayGround/issues).
- 👤 [Explore the creator's projects](https://omgithub.com/mingyu1305678900-ship-it).
- 🌍 [Create with OMGithub](https://omgithub.com).
<!-- omgithub:readme:end -->

# LOS SANTOS — STREET HEAT

> **비공식 팬메이드 패러디 · Rockstar Games와 무관합니다.**
> GTA5에서 영감을 받은 브라우저 오픈월드 액션 게임. 모든 모델·텍스처·사운드는 코드로 절차 생성되며 외부 에셋을 사용하지 않습니다.

## 🎮 플레이 방법

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # dist/ 에 정적 빌드
```

브라우저에서 **START** 를 누르면 바로 시작합니다. 데스크톱과 모바일 터치 컨트롤을 모두 지원합니다.

## ⌨️ 조작

| 동작 | 데스크톱 | 모바일 |
| --- | --- | --- |
| 이동 | `W A S D` | 좌측 조이스틱 |
| 달리기 / 점프 | `Shift` / `Space` | 달리기 버튼 |
| 카메라 | 마우스 이동 (클릭으로 고정) | 화면 드래그 |
| 차량 탑승 / 하차 | `F` | `CAR` 버튼 |
| 사격 | 좌클릭 | `FIRE` 버튼 |
| 조준(ADS) | 우클릭 | `AIM` 버튼 |
| 재장전 | `R` | `RELOAD` 버튼 |
| 무기 교체 | `1` `2` `3` / 마우스 휠 | 무기 HUD 탭 |
| 일시정지 | `Esc` | `II` 버튼 |

## 🔥 특징

- **차량 강탈** — 길거리의 차를 세우고 훔쳐 탈 수 있습니다. 경찰차도 예외가 아닙니다.
- **총격전** — 피스톨 · 마이크로 SMG · 산탄총 3종. 조준 보조, 반동, 재장전, 피격 판정 지원.
- **수배 시스템** — 범죄를 저지르면 별(★)이 쌓이고 경찰차와 경관이 출동합니다. 시야에서 벗어나면 수배가 풀립니다.
- **4개 미션 체인** — 차량 회수 → SHAKEDOWN → 추가 임무로 이어지는 GTA식 미션 마커와 보상.
- **살아있는 도시** — 신호를 무시하는 교통 AI, 보행자, 주차 차량, 공원, 주차장, 광고판, 야자수, 빌보드.
- **낮과 밤** — 15:20 황금빛에서 시작해 시간이 흐르며 조명·안개·가로등이 함께 변합니다.
- **HUD** — 원형 레이더, 수배 별, 체력/방어구, 무기·탄약, 머니, 속도계, 지역 배너.
- **절차적 오디오** — WebAudio 기반 엔진음, 총성, 사이렌, 라디오.
- **가벼운 렌더링** — 약 7만 삼각형 / 200여 드로우콜. 저사양·모바일에서도 구동됩니다.

## 🗺️ 지역

`DOWNTOWN LOS SANTOS` · `VINEWOOD HILLS` · `DEL PERRO` · `EAST LOS SANTOS` · `VESPUCCI BEACH` · `MORNINGWOOD`

## 🛠️ 기술 스택

- [Vite](https://vite.dev/) 7 + [Three.js](https://threejs.org/) 0.187
- 순수 ES Modules, 프레임워크 없음
- WebAudio로 생성하는 모든 사운드
- Canvas 2D로 생성하는 파사드·노면·잔디·레이더 텍스처

## 📁 구조

```
src/
  main.js        게임 루프, 카메라, 상태 전환, 데스/리스폰
  world.js       절차적 도시, 조명, 하늘, 충돌, 레이더 맵
  characters.js  플레이어·보행자·경관 모델, 무기, 이동
  vehicles.js    차량 모델·물리, 교통 AI, 폭발
  combat.js      히트스캔, 조준 보조, 사격
  police.js      수배도, 경찰 스폰, 추격/잠적
  missions.js    4개 미션 체인과 마커
  hud.js         레이더·HUD 렌더링
  audio.js       절차적 효과음·라디오
  input.js       키보드·마우스·터치
  fx.js          파티클·데칼·총구 화염
```

## ⚠️ 고지

이 프로젝트는 **비공식 팬메이드 패러디**입니다. Grand Theft Auto, Los Santos 및 관련 명칭·상표는 Rockstar Games의 자산이며, 이 저장소는 Rockstar Games와 어떠한 제휴나 승인도 받지 않았습니다. 학습·데모 목적의 오리지널 코드와 절차적 아트만 포함합니다.
