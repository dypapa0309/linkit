# Linkit Deployment Checklist

이 문서는 `Linkit`를 웹과 iOS 앱으로 배포하기 전에 확인해야 할 항목을 한 번에 정리한 체크리스트입니다.

## 1. 코드단

아래 항목은 현재 코드에 이미 반영되어 있습니다.

- 이메일 로그인 / 회원가입
- Google 로그인
- Apple 로그인 버튼과 네이티브 로그인 코드
- 앱 내 계정 삭제 버튼
- 공개 프로필 웹 페이지
- 프로필 사진 업로드
- 추가 링크 3개 무료 제한
- 공개 URL 복사 / 열기
- 웹 SEO 기본 메타태그

배포 전에 다시 확인할 항목:

- `npm install`
- `npx tsc --noEmit`
- `npm run build`
- `npx expo run:ios`

## 2. Supabase DB / Storage

SQL Editor에서 [supabase/schema.sql](/Users/sangbinsmacbook/Desktop/Projects/LinkitApp/supabase/schema.sql) 최신본을 실행합니다.

포함되는 내용:

- `profiles` 테이블
- `link_items` 테이블
- `plan` 컬럼
- 무료 링크 3개 제한 트리거
- `avatars` 버킷
- 프로필 / 링크 / 아바타 RLS 정책

완료 확인:

- `profiles` 테이블 존재
- `link_items` 테이블 존재
- `avatars` 버킷 존재

## 3. Supabase Auth 설정

### URL Configuration

- `Site URL`
  - `https://linkit-link.netlify.app`

- `Redirect URLs`
  - `https://linkit-link.netlify.app/auth/callback`
  - `linkit://auth/callback`

### Providers

- Email: 켜기
- Google: 켜기
- Apple: 켜기

## 4. Google 로그인 설정

Supabase `Authentication > Providers > Google`에서 `Callback URL`을 먼저 확인합니다.

보통 형태:

- `https://<your-project-ref>.supabase.co/auth/v1/callback`

Google Cloud Console에서:

- OAuth Client type: `Web application`
- Authorized JavaScript origins:
  - `https://linkit-link.netlify.app`
- Authorized redirect URIs:
  - Supabase에서 보여준 Google callback URL 그대로 추가

그다음 Supabase Google provider 화면에:

- Google Client ID
- Google Client Secret

를 입력하고 저장합니다.

## 5. Apple 로그인 설정

### Apple Developer

- App ID에서 현재 번들 ID 선택
- `Sign in with Apple` capability 활성화

현재 번들 ID:

- `com.anonymous.linkit`

### Supabase

`Authentication > Providers > Apple`에서 설정합니다.

필요한 값:

- Services ID
- Team ID
- Key ID
- Private Key (`.p8`)

Apple provider 저장 후 iPhone 실기기에서 테스트합니다.

주의:

- Apple 로그인은 시뮬레이터보다 실제 iPhone에서 최종 확인하는 것이 안전합니다.

## 6. 계정 삭제 설정

앱에는 계정 삭제 버튼이 이미 들어가 있습니다. 하지만 아래 작업이 끝나야 실제로 동작합니다.

### Edge Function 배포

배포할 함수:

- [supabase/functions/delete-account/index.ts](/Users/sangbinsmacbook/Desktop/Projects/LinkitApp/supabase/functions/delete-account/index.ts)

명령:

```bash
supabase functions deploy delete-account
```

### Edge Function 환경변수

Supabase 프로젝트에 아래 값이 있어야 합니다.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

확인 후 테스트:

- 앱 로그인
- `설정 > 계정 삭제`
- 계정, 프로필, 링크, 아바타가 실제 삭제되는지 확인

## 7. Netlify 웹 설정

이미 코드에는 [netlify.toml](/Users/sangbinsmacbook/Desktop/Projects/LinkitApp/netlify.toml) 이 들어 있습니다.

확인할 값:

- Build command: `npm run build`
- Publish directory: `dist`

Netlify 환경변수:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

재배포 후 확인:

- 홈 페이지 열림
- `/privacy`
- `/terms`
- `/auth/callback`
- `/{username}` 공개 페이지

## 8. 실기기 테스트

iPhone 실기기에서 아래를 꼭 확인합니다.

- 이메일 회원가입
- 이메일 로그인
- Google 로그인
- Apple 로그인
- 프로필 저장
- 사진 업로드
- 링크 추가 / 수정 / 삭제
- 공개 페이지 열기
- 공개 URL 복사
- 계정 삭제

## 9. App Store Connect

필수 확인 항목:

- 앱 이름 / 설명
- 카테고리
- 개인정보처리방침 URL
- 스크린샷
- 앱 아이콘
- 앱 리뷰용 계정 또는 리뷰 노트
- 개인정보 수집 항목 작성

권장:

- 리뷰 노트에 테스트 방법 작성
- Google / Apple 로그인이 필요한 경우 테스트 방법 적기

## 10. 최종 제출 전

아래가 모두 끝나면 심사 제출 후보 상태입니다.

- SQL 최신 반영 완료
- Google provider 설정 완료
- Apple provider 설정 완료
- delete-account 함수 배포 완료
- Netlify 최신 배포 완료
- 실기기 테스트 완료
- App Store Connect 메타데이터 입력 완료
