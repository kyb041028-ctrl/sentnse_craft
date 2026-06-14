영토 맵 — 단일 일러스트 + 네 구역 히트존 (2026)

**화면에 쓰는 이미지(한 장):** `public/assets/territory-zones-unified.png`  
- `applyCentristHeroArt()` 가 `#territory-centrist-hero-bg` 배경으로 `contain` 표시합니다.  
- 예전 `territory-island-hero.png`, `territory-bulletin-unified.png`, `kantapbiya-planet.png` 는 메인 경로에서 사용하지 않습니다.

**클릭 구역(진보 · 중앙광장 · 보수 · 외계행성):** `public/territories/territory-hit-zones.json`  
- 좌표는 맵 PNG가 **contain** 으로 그려지는 사각형 기준 **0~100%** (프레임 레터박스 제외).  
- 편집: `/tools/territory-hit-zone-editor.html` → 저장 후 `territory-hit-zones.json` 덮어쓰기.  
- **진보** → `goBoard('PROGRESSIVE')` · **중앙광장** → `goBoard('COMMON')` · **보수** → `goBoard('CONSERVATIVE')` · **외계행성** → 행성 선택 모달.

**레이아웃 JSON:** `territory-layout.json` 은 `layers: {}` 로 비워 두었습니다(오버레이 박스 없음).

메인은 부팅 시 + 메인 탭 진입 시 히트존·레이아웃 JSON을 다시 읽습니다.
