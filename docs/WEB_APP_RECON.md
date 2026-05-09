# algoscribe.io Web App Recon

Captured on 2026-05-10 from `https://algoscribe.io/`.

Do not commit test credentials or tokens. Use this as an implementation reference for the Expo app screens.

## Stack and Shell

- Web app title: `CareAI`
- Framework signal: Angular 19 production bundle
- Main route after login for the test user: `/process-voice`
- Branding shown in authenticated workflow: `Medicalscribe`
- Package/UI signals: PrimeNG, Tailwind utility classes, Font Awesome, Razorpay, Jitsi, Azure Communication Services

## API Bases

Observed runtime API calls use:

```text
https://emr-api-uae-test.blackglacier-b674de0c.uaenorth.azurecontainerapps.io/
```

The bundle also contains development constants:

```text
API_URL=https://emr-api-dev.blackglacier-b674de0c.uaenorth.azurecontainerapps.io/
BOT_URL=https://bdms-api-dev-1047793541775.us-central1.run.app/
```

The direct `emr-api-dev` host timed out from this environment. The browser used the `emr-api-uae-test` host successfully.

## Auth Flow

Login form:

- Email input bound as `userName`
- Password input bound as `password`
- Button label: `Sign In`

Request:

```http
POST /auth/signin
Content-Type: application/json

{
  "userName": "email",
  "password": "password"
}
```

Response shape:

```json
{
  "status": true,
  "data": {
    "token": "<jwt>",
    "refreshToken": "<jwt>"
  },
  "message": "User logged in successfully"
}
```

The web app stores `token`, `refreshToken`, `tokenExpiryTime`, and `refreshTokenExpiryTime` in `localStorage`.

Post-login bootstrap:

```http
GET /user/find-all-access
Authorization: Bearer <token>
```

The response includes `accessList`, `accessIds`, `user`, `organization`, and `rootOrganization`. The generic API client maps `(module, accessName)` to a real URL/method from this metadata and sends an `access-name` header.

## Process Voice UI

Route:

```text
/process-voice
```

Header actions:

- `New Entry`
- `Medicalscribe`
- `Logout`
- `History`

Required patient form fields:

- `Patient ID *`
- `Age *`
- `Gender *`

Optional visible fields:

- `Mobile`
- `Name`

Gender options:

- `MALE`
- `FEMALE`
- `OTHERS`

Voice input tabs:

- `Record Voice`
- `Upload Audio File`
- `Text Input`

Upload tab:

- Hidden file input accepts `audio/*`
- Copy: `Click to upload or drag and drop`
- Max file size shown: `5MB`
- Uploaded files display filename, size, and upload progress

Action modes:

- `Classic Dictation`
- `Smart Transcription with AI`
- After choosing Smart Transcription, the action label becomes `Extract`
- `Ask AI ✨` split button is visible below the extraction controls

## Audio Upload Test

Test file:

```text
/Users/nibaji/Desktop/Karpaga Nagar Cross Street.m4a
```

Observed behavior:

- File was accepted by the upload tab.
- UI displayed `Uploaded Files (1)`.
- UI displayed `Karpaga Nagar Cross Street.m4a`.
- UI displayed `39.71 KB`.
- Upload progress reached at least `70%`, then completed in the UI.
- First submit was blocked until `Gender` was selected.
- After setting required fields and selecting `MALE`, Smart Transcription submitted successfully.
- Final extracted content displayed:

```text
# Medical Summary

## Symptoms/History of Presenting Complaints
- Fever (patient reports)
```

Multipart request:

```http
POST /medicalscribe/extract-input
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

FormData fields from bundle:

- `patientInfo`: JSON string of the patient form values
- `processType`: action type, for example `processingData`
- `id`: request id string, empty for first request
- `audio`: one or more uploaded audio files when using Record Voice or Upload Audio File
- `inputText`: empty string for audio flow, text value for Text Input flow

## Observed Authenticated Calls

Calls issued immediately after login:

```http
GET /user/find-all-access
POST /appointment/find-appointments
POST /patient/followup
GET https://storage.googleapis.com/recon_video/medicalscribe/medicalscribe-guide-1.mp4
```

Observed appointment payloads:

```json
{
  "dateRange": "TODAY",
  "doctorId": 14,
  "pagination": {
    "limit": 1000,
    "order": {
      "createdAt": "DESC"
    }
  }
}
```

```json
{
  "dateRange": "ALL",
  "status": "Doctor Unavailable",
  "pagination": {
    "limit": 1000,
    "order": {
      "createdAt": "DESC"
    }
  }
}
```

Observed follow-up payload:

```json
{
  "dates": []
}
```

## Endpoint Inventory from Bundle

Important direct auth/public calls:

```text
POST /auth/signin
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-otp
POST /auth/resend-email-otp
POST /auth/resend-mobile-otp
POST /auth/patient-signin
POST /auth/validate-patient-otp
POST /auth/resend-patient-otp
POST /auth/switch-organization
POST /public/by-appointment
POST /public/update-speciality-questions
```

Important module/access calls used by the visible medicalscribe flow:

```text
GET  /user/find-all-access
POST /user/org-configurations
POST /user/find-users

POST /patient/search-patients
POST /patient/followup
POST /patient/followup-reminder
PUT  /patient/update-patient

POST /appointment/find-appointments
POST /appointment/find-all-and-count-by-admin
POST /appointment/find-one-by-admin
POST /appointment/update-apt
PUT  /appointment/update-by-admin/:id
POST /appointment/share-link
POST /appointment/acs-token
POST /appointment/search-appointments
POST /appointment/patient-recent-appointments

POST /doctor/doctors-availability
POST /doctor/get-availability
POST /doctor/update-availability
PUT  /doctor/edit-availability/:id

POST /medicalscribe/extract-input
POST /medicalscribe/ask-ai
POST /medicalscribe/find-all-and-count-by-admin
POST /medicalscribe/find-one-by-admin
POST /medicalscribe/find-all-and-count
PUT  /medicalscribe/update-by-admin/:id

POST /medical-record/extract-files
POST /medical-record/ask-ai
POST /medical-record/generate-summary
POST /medical-record/generate-visit-document
POST /medical-record/close-visit
POST /medical-record/consolidate-summary
POST /medical-record/generate-charts
POST /medical-record/get-investigations
GET  /medical-record/previous-medical-record/:id
POST /medical-record/process-transcript
POST /medical-record/email-summary
POST /medical-record/extract-audio
POST /medical-record/upload-file
POST /medical-record/attach-medical-record-visit

POST /chatbot/chat
GET  /chatbot/summarize/:id
```

Socket events found in bundle:

```text
start-session
send-audio-chunk
send-text
end-session
session-started
session-error
session-ended
audio-part
text-part
turn-completed
turn-interrupted
start-realtime-session
send-audio
commit-audio
create-response
azure-message
```

## Implementation Notes for Expo

- The first mobile target should prioritize the `/process-voice` flow: auth, patient metadata form, upload/record/text tabs, dictation/AI mode selector, extraction result, feedback, and Ask AI.
- Mirror the access metadata client: login, fetch `/user/find-all-access`, store allowed access IDs/list, and resolve module/function names to URLs.
- Keep tokens out of logs. The current web app stores tokens in `localStorage`; the Expo app should use secure native storage for refresh token and memory/session storage for access token.
- The upload control should support `audio/*`, show upload progress, and enforce the visible 5MB limit.
- Required validation should block extraction until patient ID, age, and gender are provided.

