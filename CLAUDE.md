SignalDB React Todo 앱 - 전체 구현 프롬프트
🎯 Claude Code 전체 구현 요청
markdown빈 디렉토리에서 시작하여 SignalDB를 사용한 완전한 React Todo 앱을 구현해주세요. 
프로젝트 초기화부터 테스트 코드 작성까지 모든 과정을 수행해주세요.

## 📋 전체 구현 요구사항

### 1. 프로젝트 초기화
- npm init부터 시작
- Vite + React + TypeScript 환경 구성
- 필요한 모든 의존성 설치
- 프로젝트 구조 설정

### 2. 필수 패키지 설치
```bash
# 핵심 패키지
- react, react-dom
- typescript
- vite
- @signaldb/core
- @signaldb/react  
- @signaldb/localstorage

# 스타일링
- tailwindcss
- @tailwindcss/forms
- autoprefixer
- postcss

# 테스팅
- vitest
- @testing-library/react
- @testing-library/jest-dom
- @testing-library/user-event
- jsdom
- @vitest/ui

# 개발 도구
- eslint
- prettier
- @types/react
- @types/react-dom
3. 프로젝트 구조 생성
todo-signaldb-app/
├── src/
│   ├── components/
│   │   ├── TodoForm/
│   │   │   ├── TodoForm.tsx
│   │   │   ├── TodoForm.test.tsx
│   │   │   └── index.ts
│   │   ├── TodoItem/
│   │   │   ├── TodoItem.tsx
│   │   │   ├── TodoItem.test.tsx
│   │   │   └── index.ts
│   │   ├── TodoList/
│   │   │   ├── TodoList.tsx
│   │   │   ├── TodoList.test.tsx
│   │   │   └── index.ts
│   │   ├── TodoFilter/
│   │   │   ├── TodoFilter.tsx
│   │   │   ├── TodoFilter.test.tsx
│   │   │   └── index.ts
│   │   └── TodoStats/
│   │       ├── TodoStats.tsx
│   │       ├── TodoStats.test.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useSignalDB.ts
│   │   ├── useSignalDB.test.ts
│   │   ├── useTodos.ts
│   │   └── useTodos.test.ts
│   ├── lib/
│   │   ├── db.ts
│   │   └── db.test.ts
│   ├── types/
│   │   └── todo.ts
│   ├── utils/
│   │   ├── dateHelpers.ts
│   │   ├── dateHelpers.test.ts
│   │   └── validators.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   ├── App.test.tsx
│   └── main.tsx
├── tests/
│   ├── setup.ts
│   └── e2e/
│       └── todo.e2e.test.ts
├── public/
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
4. 구현할 기능 상세
4.1 Todo CRUD 작업
typescriptinterface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 필수 기능
- createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>)
- updateTodo(id: string, updates: Partial<Todo>)
- deleteTodo(id: string)
- toggleTodo(id: string)
- getTodoById(id: string)
- getAllTodos()
- clearCompleted()
- clearAll()
4.2 필터링 & 검색
typescriptinterface FilterOptions {
  status?: 'all' | 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  searchTerm?: string;
  tags?: string[];
  dateRange?: { start: Date; end: Date };
}

- filterTodos(options: FilterOptions)
- searchTodos(searchTerm: string)
- sortTodos(by: 'date' | 'priority' | 'title')
4.3 통계 기능
typescriptinterface TodoStats {
  total: number;
  completed: number;
  active: number;
  completionRate: number;
  todayAdded: number;
  overdueCount: number;
}

- getTodoStats(): TodoStats
- getTagStats(): Map<string, number>
- getPriorityStats(): Record<Priority, number>
5. SignalDB 설정 요구사항
typescript// lib/db.ts
import { Collection } from '@signaldb/core';
import { createLocalStorageAdapter } from '@signaldb/localstorage';
import { createReactivityAdapter } from '@signaldb/react';

// Collection 설정
- 로컬 스토리지 어댑터 연결
- 반응형 어댑터 설정
- 인덱싱 최적화
- 마이그레이션 로직 (버전 관리)
6. 컴포넌트 요구사항
6.1 TodoForm

제목 입력 (필수, 최소 2자)
설명 입력 (선택)
우선순위 선택
태그 입력 (쉼표 구분)
마감일 선택
유효성 검사
제출 후 폼 초기화

6.2 TodoItem

체크박스로 완료 토글
인라인 편집 모드
우선순위 표시 (색상)
태그 표시
마감일 표시 (오버듀 강조)
삭제 버튼
더블클릭으로 편집

6.3 TodoList

가상 스크롤 (100개 이상 항목)
드래그 앤 드롭 정렬
애니메이션 (추가/삭제)
빈 상태 메시지
로딩 상태

6.4 TodoFilter

상태 필터 (전체/활성/완료)
우선순위 필터
태그 필터
검색바
정렬 옵션

6.5 TodoStats

원형 진행률 차트
통계 카드
태그 클라우드
주간 추가 차트

7. 테스트 코드 요구사항
7.1 단위 테스트 (Unit Tests)
typescript// 각 컴포넌트별 테스트
describe('TodoForm', () => {
  it('should render form elements');
  it('should validate required fields');
  it('should submit valid todo');
  it('should clear form after submission');
  it('should handle validation errors');
});

describe('TodoItem', () => {
  it('should toggle completion status');
  it('should enter edit mode on double click');
  it('should save changes on blur');
  it('should cancel edit on escape');
  it('should delete todo on button click');
});

// Hook 테스트
describe('useTodos', () => {
  it('should fetch todos');
  it('should add new todo');
  it('should update todo');
  it('should delete todo');
  it('should filter todos');
});

// SignalDB 테스트
describe('SignalDB Collection', () => {
  it('should initialize collection');
  it('should persist to localStorage');
  it('should trigger reactivity');
  it('should handle concurrent updates');
});
7.2 통합 테스트 (Integration Tests)
typescriptdescribe('Todo App Integration', () => {
  it('should complete full CRUD cycle');
  it('should persist data after reload');
  it('should sync filter state');
  it('should update stats in real-time');
});
7.3 E2E 테스트
typescriptdescribe('Todo App E2E', () => {
  it('should create and complete todo workflow');
  it('should filter and search todos');
  it('should handle edge cases');
  it('should work offline');
});
8. 성능 최적화 요구사항

React.memo로 불필요한 리렌더링 방지
useMemo/useCallback 적절히 사용
가상 스크롤링 구현 (100개 이상 항목)
디바운싱 검색 입력
코드 스플리팅 (lazy loading)
SignalDB 쿼리 최적화

9. UI/UX 요구사항
9.1 디자인 시스템

다크모드/라이트모드 토글
반응형 디자인 (모바일/태블릿/데스크톱)
접근성 (ARIA labels, 키보드 네비게이션)
로딩 스켈레톤
토스트 알림
모달 다이얼로그

9.2 애니메이션

Framer Motion 또는 CSS 애니메이션
추가/삭제 트랜지션
드래그 앤 드롭 피드백
호버 효과
완료 체크 애니메이션

10. 설정 파일 요구사항
10.1 package.json scripts
json{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "vitest run --config vitest.e2e.config.ts",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
}
10.2 Vitest 설정
typescript// vitest.config.ts
- 테스트 환경: jsdom
- 커버리지 리포터: html, text, lcov
- 테스트 매칭 패턴
- 셋업 파일 경로
- 모킹 설정
10.3 ESLint & Prettier

React 규칙
TypeScript 규칙
접근성 규칙
Import 정렬
코드 포매팅 규칙

11. 문서화 요구사항
README.md 작성

프로젝트 소개
기능 목록
설치 방법
실행 방법
테스트 방법
기술 스택
프로젝트 구조
API 문서
기여 가이드

JSDoc 주석

모든 public 함수
복잡한 로직
SignalDB 사용법
커스텀 훅 사용법

12. 추가 고급 기능 (선택)

PWA 지원 (오프라인 작동)
데이터 내보내기/가져오기 (JSON, CSV)
Undo/Redo 기능
협업 기능 (실시간 동기화 시뮬레이션)
AI 제안 기능 (태그, 우선순위 자동 제안)
음성 입력
키보드 단축키
테마 커스터마이징

실행 순서

빈 디렉토리에서 npm init -y
모든 필요 패키지 설치
프로젝트 구조 생성
설정 파일 작성
SignalDB 설정
타입 정의
유틸리티 함수 구현
커스텀 훅 구현
컴포넌트 구현
스타일링 적용
테스트 코드 작성
E2E 테스트 작성
문서화
빌드 및 최적화 확인

모든 코드는 TypeScript로 작성하고, 완전히 동작하는 애플리케이션을 만들어주세요.
테스트는 모두 통과해야 하며, 90% 이상의 코드 커버리지를 목표로 해주세요.