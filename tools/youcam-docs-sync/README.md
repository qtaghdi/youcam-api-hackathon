# YouCam Docs Sync

공식 YouCam 문서 또는 OpenAPI URL을 수집해 사람이 읽기 쉬운 Markdown API 문서로 변환합니다.

## 링크 추가

[`sources.txt`](./sources.txt)에 URL을 한 줄씩 추가합니다.

```text
https://docs.perfectcorp.com/_bundle/reference/ai_aging_simulation.yaml
https://docs.perfectcorp.com/reference/ai_aging_simulation/v1.0
```

다음 형식을 지원합니다.

- OpenAPI YAML 또는 JSON
- `/reference/기능명` 형태의 기능 루트 페이지
- `/reference/기능명/v1.0` 형태의 버전 상세 페이지
- OpenAPI 링크가 포함된 HTML 문서
- OpenAPI 링크가 포함된 Markdown 문서

빈 줄과 `#`으로 시작하는 주석은 무시합니다.

## 문서 생성

프로젝트 루트에서 실행합니다.

```bash
pnpm sync:youcam-docs
```

결과는 `docs/youcam-api`에 생성됩니다.

```text
docs/youcam-api/
├── README.md                 # 전체 기능 인덱스
├── registry.json             # 정규화된 기계 판독용 데이터
├── ai-aging-simulation.md    # 기능별 문서
└── UNRESOLVED.md             # OpenAPI를 찾지 못한 링크
```

기능별 문서에는 다음 정보가 포함됩니다.

- 기능 설명과 API 버전
- 서버와 인증 방식
- HTTP 메서드 및 엔드포인트
- Path, Query, Header 파라미터
- 요청 본문과 필드
- 응답 상태와 스키마
- 원본 문서에서 추출한 파일 조건 및 오류 안내

## 변경 확인

CI에서 생성 결과가 최신인지 확인할 수 있습니다.

```bash
pnpm sync:youcam-docs:check
```

OpenAPI가 변경되어 생성 문서와 차이가 있으면 종료 코드 `1`을 반환합니다.

## 동작 원칙

- Playwright를 기본적으로 사용하지 않습니다.
- Perfect Corp. 기능 페이지는 공식 `/page-data/.../data.json`에서 OpenAPI 정의 경로와 Overview 정보를 찾습니다.
- 버전 상세 URL을 넣어도 `baseSlug`를 따라 기능 루트의 Overview를 함께 가져옵니다.
- OpenAPI YAML/JSON은 일반 HTTP 요청으로 직접 가져옵니다.
- 일반 문서는 HTML 또는 Markdown으로 파싱하고 내부 OpenAPI 링크만 따라갑니다.
- ETag와 Last-Modified를 사용한 로컬 캐시를 적용합니다.
- 네트워크 요청이 실패하면 기존 캐시가 있을 때 캐시를 사용합니다.
- 생성 파일은 같은 입력에 대해 항상 동일하게 유지됩니다.
