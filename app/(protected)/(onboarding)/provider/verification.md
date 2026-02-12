# Verification Flow (Business)

## 1. Обзор

Верификация бизнеса — шаг 4 онбординга для `BUSINESS_OWNER`. Позволяет загрузить документы для подтверждения бизнеса.

### Ключевые файлы

| Файл | Описание |
|------|----------|
| `app/(protected)/(onboarding)/provider/verify.tsx` | UI экран верификации |
| `store/features/onboarding/verify/verify.thunks.ts` | Redux thunks для верификации |
| `store/features/onboarding/verify/verify.slice.ts` | Redux slice для состояния верификации |
| `store/api/verificationFilesApi.ts` | RTK Query API для файлов верификации |
| `components/guards/BusinessVerificationGuard.tsx` | Guard для принудительной верификации после grace period |
| `app/(protected)/gate.tsx` | Роутинг по onboarding steps |

---

## 2. Параметры категории (Backend)

У каждой категории в БД есть параметры:

```prisma
model Category {
  requiresVerification  Boolean   @default(false)
  gracePeriodHours      Int?      // null = нет grace period
}
```

- `requiresVerification` — требуется ли обязательная верификация
- `gracePeriodHours` — длительность grace period в часах (null = нет отсрочки)

При создании бизнеса (`handleBusinessProfile`) вычисляется `verificationGraceDeadlineAt`:
```typescript
verificationGraceDeadlineAt = gracePeriodHours === null
  ? new Date()  // сразу истёк
  : new Date(Date.now() + gracePeriodHours * 60 * 60 * 1000)
```

---

## 3. Статусы бизнеса

```typescript
enum BusinessStatus {
  ACTIVE    // бизнес активен
  PENDING   // ожидает подтверждения верификации
  REJECTED  // верификация отклонена админом
  SUSPECTED // деактивирован админом
}
```

---

## 4. API Endpoints

### 4.1 Onboarding Submit

```
POST /onboarding/submit
```

**Actions для шага 4:**

| Action | Описание | Payload |
|--------|----------|---------|
| `BUSINESS_VERIFICATION_SUBMIT` | Отправить документ на верификацию | `{ verificationFileId: string }` |
| `BUSINESS_VERIFICATION_SKIP` | Пропустить верификацию | `null` |

### 4.2 Verification Files API

```
GET  /verification-files/current   — получить текущий файл верификации
POST /verification-files/upload    — загрузить файл (FormData)
DELETE /verification-files/:id     — удалить файл
```

### 4.3 Auth Me (Verification Gate)

```
GET /auth/me
```

Возвращает `verification: BusinessVerificationGateDto`:

```typescript
interface BusinessVerificationGateDto {
  requiresVerification: boolean      // требуется ли верификация для категории
  graceDeadlineAt: Date | null       // дедлайн grace period
  graceExpired: boolean              // истёк ли grace period
  status: BusinessStatus             // текущий статус бизнеса
  canUseApp: boolean                 // может ли пользоваться приложением
  nextAction: 'NONE' | 'GO_TO_VERIFICATION'  // нужно ли перенаправить на верификацию
}
```

---

## 5. Frontend: Состояния UI

### 5.1 VerifyUiState

```typescript
type VerifyUiState = 'empty' | 'draft' | 'pending' | 'verified' | 'failed'
```

Определяется по `lockStatus` из файла верификации:

```typescript
const uiState = useMemo(() => {
  if (!verifyFile) return 'empty'
  if (lockStatus === 'PENDING') return 'pending'
  if (lockStatus === 'APPROVED') return 'verified'
  if (lockStatus === 'REJECTED') return 'failed'
  return 'draft'  // файл загружен, но не отправлен
}, [verifyFile, lockStatus])
```

### 5.2 Логика кнопок

```typescript
const isLocked = uiState === 'pending' || uiState === 'verified'
const canUpload = !isLocked  // загрузка всегда доступна
const canSkip = !isLocked && (!requiresVerification || !graceExpired)

const hasFileToSubmit = !!verifyFile?.id && uiState === 'draft'
const mustUploadFirst = requiresVerification && graceExpired && !verifyFile?.id

// Режим кнопки Continue
const primaryMode =
  uiState === 'verified' ? 'continue'      // просто перейти
  : uiState === 'pending' ? 'pending'      // заблокировано
  : hasFileToSubmit ? 'submit'             // отправить и перейти
  : 'continue'                             // просто перейти

const primaryDisabled = isBusy || primaryMode === 'pending' || mustUploadFirst
```

---

## 6. Поведение кнопок

### Skip ("Skip for now")
- Вызывает `BUSINESS_VERIFICATION_SKIP`
- Документы **НЕ отправляются** на проверку (остаются как draft)
- Пользователь переходит на главный экран
- `onboardingStep = null` (онбординг завершён)

### Continue
- Если файл загружен (`hasFileToSubmit = true`):
  - Вызывает `BUSINESS_VERIFICATION_SUBMIT`
  - Создаётся запись `BusinessVerification` со статусом `PENDING`
  - Пользователь переходит на главный экран
- Если файл НЕ загружен:
  - Просто переходит на главный экран (если это разрешено)

---

## 7. Backend: Обработка действий

### 7.1 handleBusinessVerificationSkip

```typescript
// Проверка: можно ли скипнуть
if (requiresVerification && graceExpired) {
  throw new ConflictException('Cannot skip: grace period expired')
}

// Активируем бизнес если возможно
if (!requiresVerification || gracePeriodHours !== null) {
  business.status = BusinessStatus.ACTIVE
}

user.onboardingStep = null  // завершаем онбординг
```

### 7.2 handleBusinessVerificationSubmit

```typescript
// Проверка файла
const file = await tx.file.findUnique({ where: { id: dto.verificationFileId } })
if (!file || file.businessId !== business.id) throw Error

// Проверка что нет активной верификации
const locked = await tx.businessVerification.findFirst({
  where: { businessId, status: { in: ['PENDING', 'APPROVED', 'RESUBMISSION'] } }
})
if (locked) throw ConflictException('Verification is locked')

// Создаём запись верификации
await tx.businessVerification.create({
  data: { businessId, status: 'PENDING', verificationFileId: file.id }
})

// Устанавливаем статус бизнеса
business.status = (requiresVerification && gracePeriodHours === null)
  ? BusinessStatus.PENDING
  : BusinessStatus.ACTIVE

user.onboardingStep = null
```

---

## 8. BusinessVerificationGuard

Guard компонент для принудительной верификации после истечения grace period.

### Что делает:

1. **Перенаправление**: если `nextAction === 'GO_TO_VERIFICATION'` — перенаправляет на `/provider/verify`

2. **Обновление при возврате в приложение**: при `AppState === 'active'` вызывает `/auth/me` для обновления данных

3. **Таймер на grace period**: устанавливает `setTimeout` на `graceDeadlineAt`, чтобы обновить данные когда grace истечёт

```typescript
useEffect(() => {
  const msLeft = new Date(graceDeadlineAt).getTime() - Date.now()
  if (msLeft > 0) {
    setTimeout(() => refreshMe(), msLeft + 250)
  }
}, [graceDeadlineAt])
```

---

## 9. Сводная матрица

### 9.1 Статус бизнеса после onboarding

| Условие | Статус |
|---------|--------|
| `requiredVerification = false` | `ACTIVE` |
| `requiredVerification = true` + `gracePeriod > 0` | `ACTIVE` |
| `requiredVerification = true` + `gracePeriod = null/0` | `PENDING` (если submit) |

### 9.2 Доступность кнопок

| Условие | Skip | Continue |
|---------|------|----------|
| `requiredVerification = false` | ✅ | ✅ |
| `required = true` + grace активен | ✅ | ✅ |
| `required = true` + grace истёк | ❌ | ✅ только с документом |
| `required = true` + grace = null | ❌ | ✅ только с документом |
| `uiState = pending/verified` | ❌ | ✅ (переход) |

### 9.3 Что делает Continue

| Состояние | Действие |
|-----------|----------|
| Файл загружен (draft) | Submit → создаёт верификацию → переход |
| Файл не загружен | Просто переход (если разрешено) |
| Pending/Verified | Просто переход |

---

## 10. Redux Store

### verify.slice.ts

```typescript
interface VerifyState {
  file: VerificationFile | null  // текущий файл
  status: 'idle' | 'loading' | 'ready' | 'submitting' | 'error'
  error: string | null
}
```

### Thunks

| Thunk | Описание |
|-------|----------|
| `loadVerificationFileThunk` | Загрузить текущий файл с сервера |
| `uploadVerificationFileThunk` | Загрузить новый файл |
| `deleteVerificationFileThunk` | Удалить файл |
| `submitVerificationThunk` | Отправить на верификацию (`BUSINESS_VERIFICATION_SUBMIT`) |
| `skipVerificationThunk` | Пропустить (`BUSINESS_VERIFICATION_SKIP`) |

---

## 11. Flow диаграмма

```
┌─────────────────────────────────────────────────────────────┐
│                    Экран Verification                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Skip for now]  (если canSkip = true)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Upload Zone (если !isLocked && empty/failed)       │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │     📄 Upload your document                   │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  File Row (если verifyFile exists)                  │   │
│  │  document.pdf          [Uploaded] [Remove]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              [Continue]                             │   │
│  │  - если hasFile → submit + navigate                 │   │
│  │  - если !hasFile → just navigate                    │   │
│  │  - disabled если mustUploadFirst                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Тестовые сценарии

### Сценарий 1: Верификация НЕ обязательна
1. Пользователь видит "Verification not required"
2. Может загрузить документ (для бонуса)
3. Skip → переход без отправки документа
4. Continue (без файла) → просто переход
5. Continue (с файлом) → отправка + переход

### Сценарий 2: Верификация обязательна, grace активен
1. Skip доступен
2. Continue доступен
3. Если загрузил файл и нажал Continue → отправка
4. Если загрузил файл и нажал Skip → файл остаётся draft, переход

### Сценарий 3: Верификация обязательна, grace истёк
1. Skip НЕ доступен
2. Continue заблокирован пока нет файла
3. После загрузки файла Continue активен → отправка + переход

### Сценарий 4: Статус Pending
1. Документ на проверке
2. Все кнопки заблокированы кроме Continue (просто переход)
3. Upload zone скрыта

### Сценарий 5: Статус Verified
1. Верификация пройдена
2. Continue доступен → переход
