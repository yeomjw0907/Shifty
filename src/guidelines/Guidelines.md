# 🎯 Shifty 유지보수 가이드

**디자인 시스템을 유지하면서 코드를 수정하는 방법**

---

## 📋 목차

1. [디자인 시스템 원칙](#디자인-시스템-원칙)
2. [기존 컴포넌트 활용](#기존-컴포넌트-활용) ⭐ **중요**
3. [코드 스타일 가이드](#코드-스타일-가이드)
4. [컴포넌트 구조](#컴포넌트-구조)
5. [API 구조](#api-구조)
6. [스타일링 규칙](#스타일링-규칙)
7. [애니메이션 가이드](#애니메이션-가이드)
8. [에러 처리](#에러-처리)
9. [테스트 가이드](#테스트-가이드)

---

## 🎨 디자인 시스템 원칙

### 1. 토스 스타일 디자인 철학

**핵심 원칙:**
- ✅ **Simple & Clear**: 명확하고 단순한 인터페이스
- ✅ **Fast Feedback**: 즉각적인 사용자 피드백
- ✅ **Smooth Motion**: 부드러운 애니메이션
- ✅ **Consistent**: 일관된 디자인 시스템

### 2. 색상 시스템

```css
/* Primary */
--shifty-primary: #3B82F6;  /* Blue */

/* Shift Types */
--shifty-day: #FCD34D;       /* Yellow - Day 근무 */
--shifty-evening: #FB923C;  /* Orange - Evening 근무 */
--shifty-night: #818CF8;    /* Purple - Night 근무 */
--shifty-off: #94A3B8;       /* Gray - Off 근무 */

/* 상태 색상 */
--success: #10B981;          /* Green */
--error: #EF4444;            /* Red */
--warning: #F59E0B;          /* Amber */
```

**사용 규칙:**
- 교대근무 타입은 반드시 위 색상 사용
- 상태 표시는 success/error/warning 사용
- Primary는 주요 액션 버튼에만 사용

### 3. 타이포그래피

```css
/* 제목 */
text-2xl font-bold text-slate-900    /* 페이지 제목 */
text-xl font-semibold text-slate-800 /* 섹션 제목 */
text-lg font-medium text-slate-700  /* 서브 제목 */

/* 본문 */
text-base text-slate-600             /* 일반 텍스트 */
text-sm text-slate-500               /* 보조 텍스트 */
text-xs text-slate-400               /* 캡션 */
```

### 4. 간격 시스템

```css
/* Tailwind spacing 사용 */
space-y-2   /* 작은 간격 */
space-y-4   /* 기본 간격 */
space-y-6   /* 중간 간격 */
space-y-8   /* 큰 간격 */
space-y-12  /* 매우 큰 간격 */
```

### 5. Border Radius

```css
rounded-lg    /* 8px - 작은 요소 */
rounded-xl    /* 12px - 기본 요소 */
rounded-2xl   /* 16px - 카드 */
rounded-3xl   /* 24px - 큰 카드 */
```

---

## 🧩 기존 컴포넌트 활용 ⭐

**⚠️ 중요: 앞으로 기능을 추가 개발하게 된다면 디자인 통일을 위해 기존의 컴포넌트나 에셋을 적극 활용할 것**

### 1. 재사용 가능한 컴포넌트 목록

#### Input 컴포넌트
```tsx
// ✅ TossInput - 토스 스타일 Input (필수 사용)
import { TossInput } from './components/TossInput';
import { Mail, User, Lock } from 'lucide-react';

<TossInput
  label="이메일"
  icon={Mail}
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="이메일을 입력하세요"
  required
  error={emailError}
  success={!emailError && email.length > 0}
  helperText="올바른 이메일 형식을 입력하세요"
/>
```

**위치**: `src/components/TossInput.tsx`  
**사용 예시**: `src/components/AuthScreen.tsx`

#### Date/Time Picker
```tsx
// ✅ DatePicker - 날짜 선택
import { DatePicker } from './components/DatePicker';

<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  placeholder="날짜 선택"
  minDate={new Date()}
/>

// ✅ DrumTimePicker - iOS 스타일 시간 선택
import { DrumTimePicker } from './components/DrumTimePicker';

<DrumTimePicker
  value={time}
  onChange={setTime}
  placeholder="시간 선택"
/>
```

**위치**: `src/components/DatePicker.tsx`, `src/components/DrumTimePicker.tsx`  
**사용 예시**: `src/components/AddTaskDialog.tsx`

#### Dialog 컴포넌트
```tsx
// ✅ shadcn/ui Dialog 사용
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="glass-card rounded-3xl toss-shadow">
    <DialogHeader>
      <DialogTitle>제목</DialogTitle>
    </DialogHeader>
    {/* 내용 */}
  </DialogContent>
</Dialog>
```

**위치**: `src/components/ui/dialog.tsx`  
**사용 예시**: `src/components/AddTaskDialog.tsx`, `src/components/TeamCreateDialog.tsx`

#### Logo 컴포넌트
```tsx
// ✅ ShiftyLogo - 애니메이션 로고
import { ShiftyLogo } from './components/ShiftyLogo';

<ShiftyLogo size={64} animated={true} />

// ✅ ShiftyLogoSimple - 단순 로고
import { ShiftyLogoSimple } from './components/ShiftyLogo';

<ShiftyLogoSimple size={32} />
```

**위치**: `src/components/ShiftyLogo.tsx`  
**사용 예시**: `src/components/AuthScreen.tsx`, `src/components/Header.tsx`

### 2. UI 컴포넌트 (shadcn/ui)

**위치**: `src/components/ui/`

**사용 가능한 컴포넌트:**
- `Button` - 버튼
- `Card` - 카드
- `Dialog` - 다이얼로그
- `Input` - 기본 Input (TossInput 대신 사용 가능)
- `Select` - 선택 박스
- `Tabs` - 탭
- `Badge` - 뱃지
- `Avatar` - 아바타
- `Popover` - 팝오버
- `Tooltip` - 툴팁
- `Toast` (Sonner) - 토스트 메시지

**사용 예시:**
```tsx
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';

<Button className="gradient-blue text-white toss-shadow">
  버튼
</Button>

<Card className="glass-card rounded-3xl p-6 toss-shadow">
  {/* 내용 */}
</Card>

<Badge className="bg-blue-100 text-blue-700">
  뱃지
</Badge>
```

### 3. 스타일 유틸리티 클래스

**위치**: `src/styles/globals.css`

**사용 가능한 클래스:**

#### Glass Morphism
```tsx
<div className="glass-card rounded-3xl p-6 toss-shadow">
  {/* 내용 */}
</div>
```

**클래스 목록:**
- `.glass` - 기본 글래스 효과
- `.glass-dark` - 다크 모드 글래스
- `.glass-card` - 카드용 글래스 (가장 많이 사용)
- `.toss-shadow` - 토스 스타일 그림자
- `.toss-shadow-lg` - 큰 그림자
- `.toss-shadow-xl` - 매우 큰 그림자

#### 그라데이션
```tsx
<div className="shifty-gradient text-white rounded-xl">
  {/* 내용 */}
</div>
```

**클래스 목록:**
- `.gradient-blue` - 블루 그라데이션
- `.gradient-mesh` - 메시 그라데이션
- `.shifty-gradient` - Shifty 브랜드 그라데이션
- `.shifty-gradient-subtle` - 부드러운 그라데이션
- `.shift-day` - Day 근무 그라데이션
- `.shift-evening` - Evening 근무 그라데이션
- `.shift-night` - Night 근무 그라데이션
- `.shift-off` - Off 근무 그라데이션

### 4. 상수 및 유틸리티

**위치**: `src/utils/constants.ts`

**사용 가능한 상수:**

#### 교대근무 타입
```typescript
import { SHIFT_TYPES, SHIFT_LABELS, SHIFT_COLORS } from './utils/constants';

// 타입
SHIFT_TYPES.DAY      // 'day'
SHIFT_TYPES.EVENING  // 'evening'
SHIFT_TYPES.NIGHT    // 'night'
SHIFT_TYPES.OFF      // 'off'

// 라벨
SHIFT_LABELS[SHIFT_TYPES.DAY]  // '데이 근무'

// 색상
SHIFT_COLORS[SHIFT_TYPES.DAY].bg      // 'bg-amber-50'
SHIFT_COLORS[SHIFT_TYPES.DAY].text    // 'text-amber-700'
SHIFT_COLORS[SHIFT_TYPES.DAY].border // 'border-amber-200'
```

#### 아바타 색상
```typescript
import { AVATAR_COLORS } from './utils/constants';

// 아바타 색상 배열 사용
const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
```

#### 애니메이션 상수
```typescript
import { FADE_IN_UP, FADE_IN, SCALE_IN } from './utils/constants';

<motion.div {...FADE_IN_UP}>
  {/* 내용 */}
</motion.div>
```

### 5. 아이콘 (Lucide React)

**사용 가능한 아이콘:**
```tsx
import { 
  Mail, User, Lock, Phone, Building2,
  Calendar, Clock, Sun, Sunset, Moon, Coffee,
  Check, X, Plus, Minus, Edit, Trash, Settings
} from 'lucide-react';

<Mail size={20} className="text-slate-400" />
```

**아이콘 사용 규칙:**
- ✅ `lucide-react`에서만 import
- ✅ 크기: `size={20}` (일반), `size={24}` (큰 아이콘)
- ✅ 색상: `text-slate-400` (기본), `text-blue-500` (액션)

### 6. 애니메이션 (Motion)

**위치**: `src/utils/constants.ts`

**사용 가능한 애니메이션:**
```typescript
import { FADE_IN_UP, FADE_IN, SCALE_IN } from './utils/constants';
import { motion } from 'motion/react';

<motion.div {...FADE_IN_UP}>
  {/* 내용 */}
</motion.div>
```

### 7. 컴포넌트 사용 체크리스트

새로운 기능을 개발할 때:

- [ ] **Input이 필요한가?** → `TossInput` 사용
- [ ] **날짜 선택이 필요한가?** → `DatePicker` 사용
- [ ] **시간 선택이 필요한가?** → `DrumTimePicker` 사용
- [ ] **다이얼로그가 필요한가?** → `Dialog` (shadcn/ui) 사용
- [ ] **카드가 필요한가?** → `glass-card` 클래스 사용
- [ ] **버튼이 필요한가?** → `Button` (shadcn/ui) + `toss-shadow` 사용
- [ ] **아이콘이 필요한가?** → `lucide-react`에서 import
- [ ] **애니메이션이 필요한가?** → `motion/react` + 상수 사용
- [ ] **교대근무 타입이 필요한가?** → `SHIFT_TYPES`, `SHIFT_COLORS` 사용

### 8. 금지 사항

**❌ 절대 하지 말 것:**
- ❌ 새로운 Input 컴포넌트 만들기 → `TossInput` 사용
- ❌ 새로운 Date/Time Picker 만들기 → 기존 컴포넌트 사용
- ❌ 새로운 스타일 클래스 만들기 → 기존 클래스 사용
- ❌ 다른 아이콘 라이브러리 사용 → `lucide-react`만 사용
- ❌ 다른 애니메이션 라이브러리 사용 → `motion/react`만 사용
- ❌ 하드코딩된 색상 사용 → 상수 또는 CSS 변수 사용

### 9. 컴포넌트 참조 가이드

**기존 컴포넌트 참조 방법:**

1. **비슷한 기능 찾기**
   - `src/components/` 폴더에서 비슷한 컴포넌트 찾기
   - 예: 다이얼로그가 필요하면 `AddTaskDialog.tsx` 참조

2. **스타일 복사**
   - 기존 컴포넌트의 클래스명 복사
   - 예: `glass-card rounded-3xl p-6 toss-shadow`

3. **패턴 재사용**
   - 기존 컴포넌트의 구조와 패턴 재사용
   - 예: Dialog 구조, Form 구조

---

## 💻 코드 스타일 가이드

### 1. TypeScript 규칙

**인터페이스 정의:**
```typescript
// ✅ 좋은 예: 명확한 타입 정의
export interface Task {
  id: string;
  title: string;
  date: Date;
  shiftType?: 'day' | 'evening' | 'night' | 'off';
  assignedTo: string;
  createdBy: string;
}

// ❌ 나쁜 예: any 사용
const task: any = { ... };
```

**함수 타입:**
```typescript
// ✅ 좋은 예: 명확한 반환 타입
const addTask = async (task: Omit<Task, 'id' | 'createdBy'>): Promise<void> => {
  // ...
};

// ❌ 나쁜 예: 타입 없음
const addTask = async (task) => {
  // ...
};
```

### 2. 컴포넌트 구조

**컴포넌트 파일 구조:**
```typescript
// 1. Imports
import { useState } from 'react';
import { motion } from 'motion/react';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// 3. Component
export function Component({ title, onAction }: ComponentProps) {
  // 4. State
  const [isOpen, setIsOpen] = useState(false);
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 6. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 3. 네이밍 규칙

```typescript
// ✅ 컴포넌트: PascalCase
export function TaskList() { }

// ✅ 함수: camelCase
const handleSubmit = () => { }
const addTask = () => { }

// ✅ 변수: camelCase
const currentUser = { }
const taskList = [ ]

// ✅ 상수: UPPER_SNAKE_CASE
const API_BASE = 'https://...'
const MAX_TASKS = 100

// ✅ 타입/인터페이스: PascalCase
interface Task { }
type TaskStatus = 'pending' | 'completed'
```

### 4. 주석 규칙

```typescript
// ✅ 좋은 예: 복잡한 로직 설명
// Map client fields to database fields
// Convert date from ISO string to DATE format
const dbTaskData = {
  // ...
};

// ❌ 나쁜 예: 명확한 코드에 불필요한 주석
// Set state
setTasks(tasks);
```

---

## 🧩 컴포넌트 구조

### 1. 컴포넌트 위치

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/            # 기본 UI 컴포넌트 (shadcn/ui)
│   ├── Calendar.tsx   # 캘린더 뷰
│   ├── TaskList.tsx   # 일정 리스트
│   └── ...
├── App.tsx            # 메인 앱 컴포넌트
└── AdminApp.tsx       # 관리자 앱
```

### 2. 컴포넌트 분리 원칙

**분리 기준:**
- ✅ 재사용 가능한 컴포넌트 → `components/`
- ✅ 페이지 단위 컴포넌트 → `App.tsx` 내부 또는 별도 파일
- ✅ UI 기본 컴포넌트 → `components/ui/`

**예시:**
```typescript
// ✅ 좋은 예: 재사용 가능한 컴포넌트
// components/TaskCard.tsx
export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="glass-card">
      {/* ... */}
    </div>
  );
}

// ✅ 좋은 예: App.tsx에서 사용
import { TaskCard } from './components/TaskCard';
```

### 3. Props 설계

```typescript
// ✅ 좋은 예: 명확한 Props
interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  showActions?: boolean;
}

// ❌ 나쁜 예: 불명확한 Props
interface TaskCardProps {
  data: any;
  callback?: any;
  options?: any;
}
```

---

## 🔌 API 구조

### 1. API 파일 구조

```
src/
├── utils/
│   ├── api.ts              # API 클라이언트
│   └── supabase/
│       ├── client.ts       # Supabase 클라이언트
│       └── info.tsx        # 프로젝트 정보
└── supabase/
    └── functions/
        └── server/
            └── index.tsx    # Edge Function (서버)
```

### 2. API 호출 패턴

```typescript
// ✅ 좋은 예: 명확한 에러 처리
const { data, error } = await api.createTask(teamId, taskData, accessToken);

if (data?.task) {
  // 성공 처리
  toast.success('근무가 추가되었습니다!');
  setTasks(prev => [...prev, data.task]);
} else {
  // 에러 처리
  console.error('❌ Add task error:', error);
  toast.error(`근무 추가 실패: ${error || '알 수 없는 오류'}`);
}
```

### 3. 데이터 변환 규칙

**클라이언트 ↔ 서버 변환:**
```typescript
// 클라이언트 → 서버 (camelCase → snake_case)
const taskData = {
  shiftType: 'day',        // → shift_type
  assignedTo: userId,      // → user_id
  isAllDay: true,          // → is_all_day
};

// 서버 → 클라이언트 (snake_case → camelCase)
const formattedTask = {
  shift_type: 'day',      // → shiftType
  user_id: userId,        // → assignedTo
  is_all_day: true,       // → isAllDay
};
```

---

## 🎨 스타일링 규칙

### 1. Tailwind CSS 사용

**클래스 순서:**
```tsx
// ✅ 좋은 예: 논리적 순서
<div className="
  flex items-center justify-between
  bg-white rounded-2xl p-6
  border border-slate-200
  shadow-sm
  hover:shadow-md transition-shadow
">
```

**순서 규칙:**
1. Layout (flex, grid, position)
2. Spacing (padding, margin)
3. Sizing (width, height)
4. Typography (text, font)
5. Colors (bg, text, border)
6. Effects (shadow, opacity)
7. Transitions/Animations

### 2. Glass Morphism 스타일

```tsx
// ✅ Glass Card 스타일
<div className="glass-card rounded-3xl p-6 toss-shadow">
  {/* 내용 */}
</div>
```

**CSS 클래스 정의:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toss-shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
```

### 3. 토스 스타일 Input

**TossInput 컴포넌트 사용:**
```tsx
import { TossInput } from './components/TossInput';
import { Mail } from 'lucide-react';

<TossInput
  label="이메일"
  icon={Mail}
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="이메일을 입력하세요"
  required
  error={emailError}
  success={!emailError && email.length > 0}
  helperText="올바른 이메일 형식을 입력하세요"
/>
```

**규칙:**
- ✅ 항상 `TossInput` 컴포넌트 사용
- ✅ 아이콘은 `lucide-react`에서 import
- ✅ 실시간 validation 적용
- ✅ 에러/성공 상태 표시

---

## 🎭 애니메이션 가이드

### 1. Motion 프레임워크 사용

```tsx
import { motion, AnimatePresence } from 'motion/react';

// ✅ 좋은 예: 부드러운 애니메이션
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {/* 내용 */}
</motion.div>
```

### 2. 애니메이션 상수

```typescript
// utils/constants.ts
export const FADE_IN_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};
```

**사용:**
```tsx
<motion.div {...FADE_IN_UP}>
  {/* 내용 */}
</motion.div>
```

### 3. 애니메이션 규칙

- ✅ **Duration**: 0.2s ~ 0.5s (너무 빠르거나 느리지 않게)
- ✅ **Easing**: 기본 easing 사용 (부드러운 전환)
- ✅ **Delay**: 최소화 (사용자 경험 저하 방지)

---

## ⚠️ 에러 처리

### 1. 에러 처리 패턴

```typescript
// ✅ 좋은 예: 명확한 에러 처리
try {
  const { data, error } = await api.createTask(teamId, taskData, accessToken);
  
  if (error) {
    console.error('❌ Create task error:', error);
    toast.error(`근무 추가 실패: ${error}`);
    return;
  }
  
  if (data?.task) {
    toast.success('근무가 추가되었습니다!');
    // 성공 처리
  }
} catch (error) {
  console.error('❌ Unexpected error:', error);
  toast.error('예상치 못한 오류가 발생했습니다.');
}
```

### 2. 콘솔 로그 규칙

```typescript
// ✅ 좋은 예: 이모지로 구분
console.log('📋 Creating task...');
console.log('✅ Task created successfully');
console.error('❌ Failed to create task:', error);
console.warn('⚠️ Warning message');

// ❌ 나쁜 예: 불명확한 로그
console.log('task');
console.log('error');
```

### 3. 사용자 피드백

```typescript
import { toast } from 'sonner';

// ✅ 성공 메시지
toast.success('근무가 추가되었습니다!');

// ✅ 에러 메시지
toast.error(`근무 추가 실패: ${error}`);

// ✅ 정보 메시지
toast.info('정보를 확인해주세요.');

// ✅ 경고 메시지
toast.warning('주의가 필요합니다.');
```

---

## 🧪 테스트 가이드

### 1. 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저 접속
http://localhost:5173
```

### 2. 테스트 체크리스트

**기능 테스트:**
- [ ] 근무 추가/수정/삭제
- [ ] 팀 생성/가입
- [ ] 멤버 관리
- [ ] 캘린더 뷰 전환
- [ ] 필터링 기능

**UI 테스트:**
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
- [ ] 애니메이션 동작
- [ ] 에러 메시지 표시
- [ ] 성공 피드백 표시

**브라우저 콘솔 확인:**
- [ ] 에러 없음
- [ ] 경고 없음
- [ ] 네트워크 요청 성공

### 3. 배포 전 체크리스트

- [ ] 모든 기능 정상 동작
- [ ] 브라우저 콘솔 에러 없음
- [ ] 반응형 디자인 확인
- [ ] 접근성 확인 (키보드 네비게이션)
- [ ] 성능 확인 (로딩 속도)

---

## 📚 참고 문서

### 필수 읽기
- [README.md](./README.md) - 프로젝트 개요
- [SETUP.md](./SETUP.md) - 설정 가이드
- [TOSS_INPUT_CHANGELOG.md](./TOSS_INPUT_CHANGELOG.md) - 디자인 시스템 상세

### 문제 해결
- [FIX_RLS_GUIDE.md](./FIX_RLS_GUIDE.md) - RLS 설정
- [FIX_LOGIN_ISSUE.md](./FIX_LOGIN_ISSUE.md) - 로그인 문제
- [FIX_USER_NOT_FOUND.md](./FIX_USER_NOT_FOUND.md) - 사용자 없음 문제

### 배포
- [DEPLOY.md](./DEPLOY.md) - 배포 가이드
- [VERCEL_CHECKLIST.md](./VERCEL_CHECKLIST.md) - Vercel 체크리스트

---

## 🚫 금지 사항

### 디자인 관련
- ❌ **절대 하지 말 것**: 토스 스타일 Input 외 다른 Input 사용
- ❌ **절대 하지 말 것**: 교대근무 색상 변경
- ❌ **절대 하지 말 것**: Glass Morphism 스타일 제거
- ❌ **절대 하지 말 것**: 애니메이션 제거 또는 과도한 애니메이션

### 코드 관련
- ❌ **절대 하지 말 것**: `any` 타입 사용
- ❌ **절대 하지 말 것**: 에러 처리 없이 API 호출
- ❌ **절대 하지 말 것**: 하드코딩된 값 (상수로 분리)
- ❌ **절대 하지 말 것**: 주석 없는 복잡한 로직

---

## ✅ 체크리스트

코드 수정 전:
- [ ] 디자인 시스템 원칙 확인
- [ ] 관련 문서 읽기
- [ ] 기존 코드 패턴 확인

코드 수정 중:
- [ ] TypeScript 타입 정의
- [ ] 에러 처리 추가
- [ ] 사용자 피드백 추가
- [ ] 콘솔 로그 추가

코드 수정 후:
- [ ] 로컬 테스트
- [ ] 브라우저 콘솔 확인
- [ ] 반응형 확인
- [ ] 문서 업데이트 (필요시)

---

**마지막 업데이트**: 2025-01-XX

**작성자**: Shifty 개발팀
