# WorkforceHub frontend

The React application talks to the Express API. By default, API requests go to
`http://localhost:4000`; set `VITE_API_BASE_URL` in a frontend `.env` file to
override that URL.

## Run locally

1. Configure the backend environment variables documented by `Backend/src/config/env.js`
   and make sure MongoDB is available.
2. In one terminal, run `npm run dev:backend` from the repository root.
3. In another terminal, run `npm run dev` from the repository root.
4. Open the Vite URL shown in the frontend terminal and sign in or create an
   account.

The backend enables credentialed CORS for localhost development origins. The
frontend sends the access token as a bearer token and relies on the backend's
HTTP-only refresh-token cookie to restore sessions.

Use `npm run build` and `npm run lint` from the repository root to validate the
frontend.
