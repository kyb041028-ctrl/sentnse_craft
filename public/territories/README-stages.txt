진보·보수·중앙광장 맵 썸네일

초기 표시: `loadMapPop()` 에서 인구가 없거나 0이면 `stageFromPopulation` 이 1단계로 간주되며,
벨트 비주얼 1~6·광장 1~4 모두 **1단계 PNG**가 나옵니다. (로컬에 `sc_map_pop_v1` 등으로 누적 인구가
저장돼 있으면 그 값에 따라 단계가 올라갑니다.)

**영토 버튼 위치·크기:** `territories/territory-layout.json` 만 수정하세요. **`public/tools/territory-layout-editor.html` 에 JSON을 붙여넣으면 편집기가 깨집니다.**  
**진보·보수·중앙광장 클릭 경계(폴리곤):** `territories/territory-hit-zones.json` — 좌표는 **맵 PNG(contain 영역) 기준 0~100%**(프레임 여백 제외). 편집은 `/tools/territory-hit-zone-editor.html` (메인은 부팅·메인 탭 진입 시 둘 다 다시 읽음).
메인은 부팅 시 + **메인 탭으로 들어올 때마다** 이 JSON을 다시 읽습니다. 크롬에서 안 바뀌면 강력 새로고침(Ctrl+Shift+R) 또는 서버 재시작 후 확인하세요.

- progressive-stage-1.png … progressive-stage-6.png — 디스크상 파일명(우측 보수 벨트에 표시)
- conservative-stage-1.png … conservative-stage-6.png — 디스크상 파일명(좌측 진보 벨트에 표시)
  (에셋이 파일명과 반대로 들어가 있어 index.html 에서 교차 로드함)
- common-plaza-stage-1.png … common-plaza-stage-4.png — 맵 가운데 중앙광장 (1~4만 사용, 5·6은 추후)

검은 배경 투명 처리: `python tools/png_black_to_transparent.py --rgb-max 32 --soft-band 18 public/territories/<파일들>` 재실행.

레거시: belt-stage-1~4.png, common-space-hero.png 는 예전 에셋.
