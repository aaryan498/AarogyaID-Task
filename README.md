# AarogyaID Assessment Task Project

AarogyaID is a claims management platform for healthcare insurance. Patients submit medical claims with supporting documents and follow their status. Insurers review, filter, and approve or reject those claims.

## Product overview

The platform has two portals that share one API and one database.

- **Patient portal.** A patient registers, submits a claim (amount, description, supporting documents), and tracks every claim they have submitted. Once a decision is made, the patient sees the outcome, the approved amount, and any comments from the reviewer.
- **Insurer portal.** An insurer sees all submitted claims in one dashboard, filters them by status, submission date, and claim amount, opens a claim to read its details and documents, and approves or rejects it with an approved amount and comments.

Every account has exactly one role, `PATIENT` or `INSURER`, and each role can reach only its own portal.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7, lucide-react |
| Backend | NestJS 11 (Node.js, TypeScript), Passport JWT, class-validator, Swagger (OpenAPI) |
| Database | MongoDB through Mongoose |
| File storage | Supabase Storage |
| Authentication | JWT bearer tokens, bcrypt password hashing |

## Repository layout

```
client/   React + Vite single-page application
server/   NestJS REST API
```

## Running locally

### Prerequisites

- Node.js 20.19 or later (22.12 or later also works) and npm
- A MongoDB database, either local or hosted (for example MongoDB Atlas)
- A Supabase project with a `claim-documents` storage bucket for document uploads

### Steps

1. Clone the repository.

```bash
   git clone <repository-url>
   cd <repository-directory>
```

2. Install and configure the server.

```bash
   cd server
   npm install
   cp .env.example .env
```

   Open `server/.env` and fill in the values described under [Environment variables](#environment-variables). On Windows Command Prompt, use `copy` instead of `cp`.

3. Start the server.

```bash
   npm run dev
```

   The API is served at `http://localhost:3000/api/v1` and the interactive API documentation at `http://localhost:3000/api/v1/docs`.

4. In a second terminal, install and configure the client.

```bash
   cd client
   npm install
   cp .env.example .env
```

   The default `VITE_API_BASE_URL` in `client/.env.example` points at the local server.

5. Start the client.

```bash
   npm run dev
```

   Open the URL printed by Vite, `http://localhost:5173` by default.

6. Create a patient account and an insurer account at `/register` (see [Mock login credentials](#mock-login-credentials)).

To produce a production build, run `npm run build` in `client/` (output in `client/dist`) or in `server/` (output in `server/dist`, started with `npm run start:prod`).

## Environment variables

Both `.env` files are git-ignored. Copy the matching `.env.example` and fill in real values locally; never commit secrets.

### Server (`server/.env`)

| Variable | Description |
| --- | --- |
| `PORT` | Port the API listens on. Defaults to `3000` when unset. |
| `MONGODB_URI` | MongoDB connection string. |
| `JWT_SECRET` | Secret used to sign and verify tokens. If unset, the server falls back to a built-in development value, so always set it. |
| `JWT_EXPIRES_IN` | Token lifetime, for example `1d`, `12h`, or `30m`. Defaults to `1d`. |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key used by the backend for storage operations. |

### Client (`client/.env`)

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the API, including the `/api/v1` prefix and without a trailing slash, for example `http://localhost:3000/api/v1`. Vite inlines this value at build time, so changing it requires a rebuild. |

## Mock login credentials

There is no seed script. Accounts are created through the registration page (`/register`) or `POST /api/v1/auth/register`, where the role is chosen at sign-up. Passwords must be at least 6 characters. Create one account per role and record the credentials here for reviewers.

| Role | Email | Password |
| --- | --- | --- |
| Patient | `<fill in after creating test accounts>` | `<fill in after creating test accounts>` |
| Insurer | `<fill in after creating test accounts>` | `<fill in after creating test accounts>` |

## Live deployment

| Item | URL |
| --- | --- |
| Application | `<fill in>` |
| API | `<fill in>` |

## Deployment details

- **Frontend.** `client/vercel.json` rewrites every path to `/index.html`, so client-side routes such as `/patient/claims/:id` survive a page refresh on Vercel. The project root is `client/`, the build command is `npm run build`, and the output directory is `dist`. `VITE_API_BASE_URL` must be set in the hosting environment before the build runs.
- **Backend.** The API builds with `npm run build` and starts with `npm run start:prod` (`node dist/main`). It reads `PORT` and the variables listed above from its environment.
- **Database.** MongoDB, reached through `MONGODB_URI`.
- **File storage.** Supabase Storage; uploaded documents are stored in the `claim-documents` bucket.
- **Hosting providers and environment configuration.** `<fill in: where the API and database are hosted, and how environment variables are configured>`

## Product walkthrough

### Authentication and roles

Users register with a name, email, password, and role, or log in with email and password. Both calls return a JWT and the user profile. Passwords are hashed with bcrypt.

The client stores the session in `localStorage`, discards a stored token that has already expired, and attaches the token to every API request. If the API answers a token-bearing request with `401`, the client clears the session and returns the user to the login page.

Access is enforced twice. In the client, route guards send each role to its own portal (`/patient` or `/insurer`). In the API, a JWT guard authenticates every claims route and a roles guard restricts each route to the roles that may call it.

### Patient flow

1. **Register or log in.** After authenticating, the patient lands on **My Claims** (`/patient`).
2. **Submit a claim, step 1 of 2** (`/patient/claims/new`). The name and email come from the patient's account and are read-only. The patient enters the claim amount (greater than 0) and a description. The claim is created with status `Pending`.
3. **Upload documents, step 2 of 2** (`/patient/claims/:id/upload`). The patient selects up to 10 files (PDF, JPG, or PNG, 5 MB each). The files are uploaded to Supabase Storage and their public URLs are saved on the claim. This step can be skipped; a claim without documents shows a "Documents not uploaded yet" notice with a link back to the upload step, and further uploads are appended to the existing ones.
4. **Track claims.** My Claims lists every claim with its status, submission date, and approved amount, as a table on wider screens and as cards on smaller ones. The approved amount is shown only for approved claims; pending claims read "Awaiting review" and rejected claims read "Not approved".
5. **Claim detail** (`/patient/claims/:id`). Shows the amount, submission date, approved amount, description, insurer comments, and links to the uploaded documents.

### Insurer flow

1. **Log in.** The insurer lands on the **Claims Dashboard** (`/insurer`), which lists all claims, newest first.
2. **Filter.** Claims can be filtered by status, a from/to submission date range, and a minimum and maximum claim amount. Filters are applied on the server through query parameters. Status and date filters apply immediately; amount filters apply after a short debounce. **Clear filters** resets them.
3. **Review.** **Review** opens a side panel with the patient's name and email, the amount, submission date, description, and document links.
4. **Decide.** For a pending claim the insurer chooses **Approve** or **Reject**. Approving requires an approved amount, prefilled with the requested amount and validated against it. Comments are optional and visible to the patient. **Save Decision** updates the claim, and the dashboard refreshes.

### Data model

Claims are stored in MongoDB with these fields: `name`, `email`, `claimAmount`, `description`, `documentUrl` (an array of Supabase Storage public URLs), `status` (`Pending`, `Approved`, or `Rejected`, default `Pending`), `submissionDate`, `approvedAmount` (default `0`), `insurerComments`, and `createdAt`/`updatedAt` timestamps. Users are stored with `name`, a unique lowercase `email`, a hashed `password`, and `role`.

## API reference

All paths are relative to `/api/v1`. Every route except registration and login requires an `Authorization: Bearer <token>` header. Interactive documentation is available at `/api/v1/docs`, and `GET /` redirects there.

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create an account and return a token and user profile. |
| POST | `/auth/login` | Public | Authenticate and return a token and user profile. |
| GET | `/users/me` | Any authenticated user | Return the current user's profile (without the password hash). |
| POST | `/claims` | Patient | Submit a claim. The claim's email is taken from the token. |
| POST | `/claims/:id/upload-documents` | Patient (claim owner) | Upload up to 10 files in the multipart field `files` and attach them to the claim. |
| GET | `/claims` | Insurer | List all claims, with optional `status`, `fromDate`, `toDate`, `minAmount`, and `maxAmount` filters. |
| GET | `/claims/patient?email=` | Patient (own email only), Insurer | List the claims submitted with the given email. |
| GET | `/claims/:id` | Patient (claim owner), Insurer | Return a single claim. |
| PATCH | `/claims/:id/status` | Insurer | Approve or reject a claim, with `approvedAmount` and `insurerComments`. |

## Requirement coverage

| ID | Requirement | Implementation |
| --- | --- | --- |
| P-1 | Submit a claim | Two-step form: claim details, then document upload. |
| P-2 | View claims | My Claims list and claim detail page with status, submission date, and approved amount. |
| I-1 | Claims dashboard | All claims with status, date range, and amount filters. |
| I-2 | Manage claims | Review panel with claim details, documents, approve/reject, approved amount, and comments. |
| S-1 | Authentication | JWT login for both roles, with role-restricted portals and API routes. |
| S-2 | API endpoints | REST endpoints for submitting, fetching, and updating claims (see above). |
| S-3 | Database | Claims and users persisted in MongoDB through Mongoose. |

## Assumptions and known limitations

- **Registration replaces seeded users.** Accounts are created through `/auth/register`, and the role is chosen by the registrant. There is no approval or invitation step for insurer accounts.
- **Claim ownership is by email.** The server sets a claim's email from the authenticated user's token, and patients can read or upload to only claims whose email matches their own (case-insensitive). The claim's name is taken from the request body.
- **Approved amount rules.** The approved amount cannot exceed the claim amount, approving without an amount defaults to the claim amount, and rejecting sets it to `0`.
- **Decided claims are read-only in the UI.** The review panel does not allow a second decision on an approved or rejected claim. This is enforced in the client only; the API does not reject a repeated status update.
- **Upload limits.** Each request accepts at most 10 files, each up to 5 MB, in PDF, JPG, or PNG format. File type is checked against the MIME type declared by the client, not the file contents.
- **Documents use public URLs.** Files are stored in the public Supabase Storage bucket and referenced by their URLs, so anyone holding a link can open the file.
- **CORS is open.** The API currently accepts requests from any origin for review purposes; restrict it to the frontend origin for production use.
- **Sessions.** Tokens expire after `JWT_EXPIRES_IN` (default one day). There are no refresh tokens, and logging out clears the token in the browser without revoking it on the server.
- **Not implemented.** Password reset, email verification, rate limiting, and pagination of claim lists.
- **Testing.** There is no automated test suite for the application logic; the default end-to-end spec from the NestJS scaffold has not been updated.