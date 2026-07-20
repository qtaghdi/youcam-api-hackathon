<p align="center">
  <img src="./static/presence-logo-assets/presence-lockup.svg" width="300" alt="Presence" />
</p>

<p align="center">
  <strong>화면에 들어가기 전, 첫인상을 준비하세요.</strong>
</p>

<p align="center">
  면접·온라인 미팅·발표·프로필 사진처럼 중요한 순간을 앞둔 사람이<br />
  구도, 조명, 얼굴 위치, 배경과 컬러를 직접 점검하고 바로 개선하도록 돕는 카메라 준비 서비스입니다.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-hackathon_prototype-2F628F?style=flat-square" alt="Hackathon prototype" />
  <img src="https://img.shields.io/badge/account-not_required-1F2933?style=flat-square" alt="No account required" />
  <img src="https://img.shields.io/badge/language-KO_%2F_EN-5F6E79?style=flat-square" alt="Korean and English" />
</p>

---

## 중요한 순간 직전, 무엇을 바꿔야 할까요?

화상 화면을 켰을 때 어딘가 어색해 보여도 이유를 바로 찾기는 어렵습니다. 카메라를 옮겨야 하는지, 조명을 바꿔야 하는지, 배경을 정리해야 하는지 판단하는 동안 중요한 순간은 이미 시작됩니다.

**Presence는 사람을 평가하지 않습니다.** 성격·역량·매력에 점수를 매기는 대신 사용자가 지금 직접 바꿀 수 있는 화면 요소만 살펴보고, 다음 행동을 짧고 분명하게 제안합니다.

| 준비하는 순간   | Presence가 돕는 일                                   |
| --------------- | ---------------------------------------------------- |
| **면접**        | 첫 질문 전부터 차분하고 준비된 화면 만들기           |
| **온라인 미팅** | 일상적인 화상 대화에서도 또렷하고 참여감 있게 보이기 |
| **발표**        | 첫 슬라이드 전부터 시선을 모으는 화면 준비하기       |
| **프로필 사진** | 나답지만 정돈된 프로필 이미지 만들기                 |

## 약 30초로 이어지는 준비 과정

| 01 · 순간 선택                                        | 02 · 카메라 체크                                       | 03 · 리포트 확인                                                 | 04 · 다시 비교                                               |
| ----------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| 면접, 미팅, 발표, 프로필 중 지금의 목적을 선택합니다. | 얼굴 위치·밝기·정면 여부·배경을 실시간으로 확인합니다. | YouCam 분석을 바탕으로 지금 바꿀 수 있는 개선 방법을 확인합니다. | 안내에 따라 조정한 뒤 다시 촬영해 Before/After를 비교합니다. |

카메라 권한을 허용하기 어려운 환경에서는 JPG·PNG 사진 업로드로 같은 흐름을 이용할 수 있습니다.

## 숫자보다 중요한 건, 다음 행동입니다

Presence의 리포트는 분석 결과를 그대로 나열하지 않습니다. 화면에서 확인한 신호를 실제 촬영 환경에서 바로 실행할 수 있는 문장으로 바꿉니다.

- 카메라 높이와 얼굴 위치를 조정해 안정적인 구도 만들기
- 얼굴이 또렷하게 보이도록 광원 방향과 밝기 바꾸기
- 시선을 방해하는 배경 요소 줄이기
- 피부 톤과 화면 색의 조화를 참고해 의상·배경 컬러 정리하기
- 첫 촬영과 개선 후 촬영을 나란히 비교하기

> “좋아 보인다”에서 끝내지 않고, **왜 그렇게 보이는지와 지금 무엇을 바꿀지**를 함께 안내합니다.

## 사진을 다루는 방식도 경험의 일부입니다

Presence는 분석 기능만큼 사용자의 선택권을 중요하게 생각합니다.

- **가입 없음** — 이름, 이메일, 회원 프로필을 요구하지 않습니다.
- **실시간 체크는 기기 안에서** — 연속된 카메라 화면과 실시간 구도 점검 결과를 서버로 보내지 않습니다.
- **명시적인 전송** — 사용자가 `리포트 만들기`를 선택한 뒤에만 준비된 사진을 분석 요청에 사용합니다.
- **전송 전 최적화** — 원본 이미지는 브라우저에서 최대 1920px·약 3.5MB 수준으로 줄입니다.
- **서버에만 있는 키** — YouCam API Key는 브라우저 번들에 포함하지 않습니다.
- **데모 모드 제공** — API Key가 없을 때는 사진을 YouCam으로 보내지 않고 샘플 리포트로 전체 경험을 확인합니다.

자세한 처리 방식은 서비스 안의 전용 개인정보처리방침에서 확인할 수 있습니다.

## YouCam API와 함께 만든 분석 경험

Presence는 Perfect Corp.의 **YouCam AI Skin Analysis**와 **Skin Tone Analysis**를 함께 사용합니다. 두 분석을 병렬로 실행한 뒤 결과를 하나의 준비 리포트로 정리합니다.

YouCam이 제공하는 피부·톤 신호는 사람의 외모를 평가하는 점수가 아니라, 조명과 색 조합처럼 사용자가 조절할 수 있는 화면 요소를 설명하는 근거로만 사용합니다.

## 해커톤 프로토타입에 담긴 것

- 상황별 준비 모드와 맞춤 체크리스트
- MediaPipe 기반 실시간 카메라 준비도 안내
- 촬영·업로드·검토·분석·개선·재촬영으로 이어지는 단일 흐름
- YouCam Skin Analysis 및 Skin Tone Analysis 연동
- Before/After 비교와 브라우저 내 상태 저장
- 한국어·영어 전환
- 반응형 UI와 전용 개인정보처리방침
- API 응답 검증, 서버 전용 비밀값 관리, Vercel 배포 구성

> Presence는 현재 해커톤 프로토타입입니다. 의료 진단, 질병 판정, 신원 확인 또는 성격·역량·외모 평가를 제공하지 않습니다.

---

<details>
<summary><strong>개발 환경에서 실행하기</strong></summary>

### 요구 사항

- Node.js 20 이상
- pnpm 10 이상

### 설치 및 실행

```bash
pnpm install
cp .env.example .env
pnpm dev
```

`YOUCAM_API_KEY`가 비어 있으면 결과 화면에 `SAMPLE REPORT` 배지가 표시되며 데모 모드로 동작합니다. 실제 분석을 사용하려면 YouCam API Console에서 발급한 Bearer API Key를 `.env`에 입력하세요.

```dotenv
YOUCAM_API_KEY=
YOUCAM_API_BASE=https://yce-api-01.makeupar.com
YOUCAM_LIGHTING_FEATURE=
```

`YOUCAM_LIGHTING_FEATURE`는 계정에서 Photo Lighting 기능을 사용할 수 있을 때 공식 feature slug를 지정하는 선택 항목입니다.

</details>

<details>
<summary><strong>YouCam 처리 흐름</strong></summary>

Skin Analysis와 Skin Tone Analysis는 아래 과정을 각각 거치며 병렬로 실행됩니다.

1. File API에서 업로드 URL과 `file_id` 요청
2. 사전 서명된 URL에 준비된 이미지 업로드
3. `file_id`로 AI Task 생성
4. `task_id`가 성공 또는 오류 상태가 될 때까지 확인
5. 분석 결과를 Presence의 UI 계약으로 정규화

서버·클라이언트 경계에서는 Zod로 응답을 검증합니다. API Key는 SvelteKit 서버 코드에서만 읽습니다.

</details>

<details>
<summary><strong>기술 구성과 프로젝트 구조</strong></summary>

**SvelteKit · Svelte 5 · TypeScript · MediaPipe · YouCam API · Zod · Vercel**

```text
src/lib/
├── components/                     # 공용 인터페이스
├── domains/
│   ├── camera/                     # 카메라와 촬영 품질
│   ├── analysis/                   # YouCam 서버 어댑터와 공유 계약
│   ├── appearance-guidance/        # 분석 결과를 실행 가능한 가이드로 변환
│   └── comparison/                 # 기기 내 Before/After 상태
└── i18n/                           # 서비스 및 개인정보처리방침 다국어 문구

src/routes/
├── +page.svelte                    # Presence 사용자 경험
├── privacy/+page.svelte            # 전용 개인정보처리방침
└── api/analyze/+server.ts          # 서버 전용 분석 엔드포인트
```

</details>

<details>
<summary><strong>검증 명령어</strong></summary>

```bash
pnpm check      # Svelte 및 TypeScript 검사
pnpm lint       # Prettier 및 ESLint
pnpm test       # 단위 테스트
pnpm build      # Vercel 프로덕션 빌드
```

</details>

## 이미지 출처

- 랜딩 화면 인물 사진: [Jake Nackos / Unsplash](https://unsplash.com/photos/IF9TK5Uy-KI)
