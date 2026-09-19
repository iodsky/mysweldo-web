# Reporting Feature — Design Spec

**Date:** 2026-09-19
**Status:** Approved (awaiting implementation)
**Author:** iodsky + opencode
**Scope:** `mysweldo-api` (report module, storage, migrations) + `mysweldo-web` (export UI, history UI, codegen)

## 1. Problem

Payroll runs are computed and viewable in the app, but there is no way to get the
data out. When a payroll run is finalized, the admin must manually transcribe
per-employee net pay into a file the bank accepts for disbursement processing.
Attendance has the same gap: no exportable timesheet. Both workflows are manual,
slow, and error-prone.

## 2. Decisions (agreed with user)

| Topic | Decision |
| --- | --- |
| Bank file format | CSV **and** XLSX, selectable per export via a `format` query param |
| Bank account data | Add `bankName` + `accountNumber` (+ optional `accountHolderName`) to `Employee`; admin enters once per employee |
| Bank file columns | Standard 5: Employee ID, Employee Name, Bank Name, Account Number, Net Pay |
| Attendance report | Detailed timesheet: one row per day per employee (date, time in, time out, total hours) over a selected date range |
| Report lifecycle | Generated + **stored with history** (S3 in prod via existing `StorageService`, local disk in dev); re-downloadable; immutable artifacts |
| S3 role | Use the existing `StorageService` abstraction (S3 prod / local dev); no new AWS SDK work, no presigned URLs |
| Export gating | Payroll export allowed only for `APPROVED` or `PROCESSED` runs (never `DRAFT`) |
| Access control | Payroll reports → `PAYROLL`/`SUPERUSER`; attendance reports → `HR`/`SUPERUSER` (matches existing controllers) |
| Generation model | Synchronous, in-memory generation; no job queue, no local-disk dependency |

## 3. Context findings (shaped the design)

- `PayrollRun` flows `DRAFT → APPROVED → PROCESSED`; `PayrollItem` already carries
  gross pay, benefits, deductions, net pay, and employer contributions.
- `Employee` has **no** bank fields today (only SSS/TIN/PhilHealth/Pag-IBIG IDs).
- No report/export code exists; OpenCSV is present (imports only), nothing for XLSX.
- `common/StorageService` (abstract) → `LocalStorageService` (`local` profile,
  `uploads/` dir) / `S3StorageService` (`prod` profile, AWS SDK v2, bucket from
  `S3_BUCKET`) already exists, used only by CSV imports. It is upload-oriented
  (`store(MultipartFile)`), so it needs a byte[]-friendly overload for
  server-generated files. No `s3-presigner` dependency exists.
- Flyway is at `V6`; `ddl-auto: validate` — schema changes require new migrations
  only. `import_job` (V5) is the precedent for a tracked-artifact table.
- Web auth is httpOnly cookies against a cross-origin API, so downloads must go
  through the axios client (`responseType: 'blob'`), not plain anchors.
- Web API layer is orval-generated from the backend OpenAPI spec; new endpoints
  require `npm run api:fetch` + `npm run api:generate`.

## 4. Backend design (`mysweldo-api`)

### 4.1 New `report/` module

```
report/
  ReportController.java           # @RequestMapping("/reports"), role-guarded
  ReportService.java              # orchestration: generate → store → persist artifact
  PayrollReportService.java       # bank-file rows for one payroll run
  AttendanceReportService.java    # timesheet rows for a date range
  ReportWriter.java               # interface: write(headers, rows, OutputStream)
  CsvReportWriter.java            # OpenCSV (existing dependency)
  XlsxReportWriter.java           # Apache POI (new: poi-ooxml)
  Report.java                     # entity extends BaseModel
  ReportRepository.java
  ReportDto.java / ReportMapper.java
  ReportType.java                 # PAYROLL_BANK_FILE, ATTENDANCE_TIMESHEET
  ReportFormat.java               # CSV, XLSX
```

### 4.2 Endpoints

| Method | Path | Roles | Behavior |
| --- | --- | --- | --- |
| POST | `/reports/payroll/{runId}?format=csv\|xlsx` | PAYROLL, SUPERUSER | generate → store → `201` + `ReportDto` |
| POST | `/reports/attendance?startDate&endDate&format=` | HR, SUPERUSER | generate → store → `201` + `ReportDto` |
| GET | `/reports?type=` | scoped (see §4.6) | paginated history (`PageDto<ReportDto>`) |
| GET | `/reports/{id}/download` | same roles as the generating endpoint | stream bytes from storage |
| DELETE | `/reports/{id}` | same roles as the generating endpoint | delete storage object + soft-delete row |

### 4.3 Data access

- Payroll rows: reuse `payrollItemRepository.findAllByPayrollRun_Id(runId)` inside a
  `@Transactional` method (same lazy-loading pattern `PayrollItemMapper` relies on).
- Attendance rows: add a non-paged date-range fetch to `AttendanceRepository`.
- Missing account numbers are emitted as blank cells; the export never fails for
  incomplete bank data (admin completes the file).

### 4.4 Storage

- Add `store(String fileName, String contentType, byte[] bytes)` to
  `StorageService`, implemented by both `LocalStorageService` and
  `S3StorageService`. Keys namespaced: `reports/payroll/<ts>_<runId>.csv`,
  `reports/attendance/<ts>.xlsx`.
- Each export creates a **new immutable artifact**; re-export never overwrites.
- Generation + storage + DB persist run in one `@Transactional` service method:
  storage failure → 500 with no orphan row.

### 4.5 Migrations

- `V7__employee_bank_details.sql`: `ALTER TABLE employee ADD COLUMN bank_name`,
  `account_number`, `account_holder_name` (all nullable `VARCHAR`, no uniqueness
  constraint — joint/shared accounts must stay legal).
- `V8__report_artifacts.sql`: `report` table (`id` UUID PK, `type`, `format`,
  `file_name`, `storage_key`, nullable `payroll_run_id` FK, nullable
  `period_start`/`period_end`, plus `BaseModel` audit columns incl. `created_by`).

### 4.6 History visibility

`GET /reports` is role-scoped, not merely role-guarded: `PAYROLL` sees only
`PAYROLL_BANK_FILE` artifacts, `HR` sees only `ATTENDANCE_TIMESHEET` artifacts,
`SUPERUSER` sees all. The optional `type` filter narrows further within that
scope. Download/delete of a single artifact re-checks the same scope
(a `PAYROLL` user gets `404` for an attendance report id, never `403` details).

## 5. Frontend design (`mysweldo-web`)

- **Employee create/edit form** (`features/employees`): add Bank Name, Account
  Number, Account Holder Name fields.
- **Export flow:** button → POST mutation → on success immediately download via
  `GET /reports/{id}/download` through the axios client with
  `responseType: 'blob'` + object-URL trigger (new small helper; cookie-safe) →
  success notification.
- **History UI (no new routes):** `payroll-run-detail.tsx` gains an "Exports"
  section for that run's bank files; `hr-attendance.tsx` gains one for timesheet
  exports. Both offer re-download and delete. Existing role-routes untouched.
- **Codegen:** after backend lands, `npm run api:fetch` then
  `npm run api:generate`; use generated hooks; `handleApiError()` on mutation
  errors; `import type` for DTO types (verbatimModuleSyntax).

## 6. AWS / deployment

No new AWS work in this feature. In-memory generation keeps the API stateless
(ECS/EC2/Lambda-safe); artifacts go through the existing profile-based storage.
Ops follow-up (out of scope): S3 lifecycle rule expiring `reports/*` after N
days, or a scheduled cleanup job; SES email-to-bank; SQS/Lambda async generation
if payroll sizes ever demand it.

## 7. Testing

- `PayrollReportServiceTest`, `AttendanceReportServiceTest`: row content, column
  order, CSV/XLSX bytes (JUnit 5 + AssertJ, `<Domain>ServiceTest` convention).
- `ReportServiceTest`: export persists row + stores bytes; download returns
  identical bytes; delete removes the object + soft-deletes. Use a fake
  in-memory `StorageService` (no S3, no disk).
- Web: no test runner configured — verify with `npm run build` + `npm run lint`.

## 8. Error handling

- Run with no items → `400` ("no payroll items to export"); empty attendance
  range → stored file with headers only.
- Invalid `format` / missing date range → `400` via `ResponseStatusException`.
- Storage failure → `500`, no artifact row. Download of deleted artifact → `404`.

## 9. Out of scope

Payslip PDF export, bank-specific fixed-width layouts (e.g. PESONet/BDO files),
statutory remittance reports (SSS/PhilHealth/Pag-IBIG/TAX), email delivery,
report scheduling, S3 lifecycle/retention automation.
