# Using the API in Postman

1. Open the `AI Resume Assistant API` collection and select the `AI Resume Assistant - Local` environment.
2. Set `baseUrl` to your API URL including `/api` (default: `http://localhost:3001/api`). Set `originUrl` to the API's `WEB_ORIGIN` (default: `http://localhost:3000`).
3. Set `testEmail` and `testPassword`. Send **Sign up with email and password** for a new account, or **Sign in with email and password** for an existing account.
4. Send any protected request. Postman's cookie jar stores the response cookies and attaches them automatically. No token copying or authorization header is needed.
5. Send **Sign out and clear session cookie** to invalidate the session and expire its cookies.

Keep **Disable cookie jar** turned off in request settings. The collection intentionally has no manual `Cookie` headers or `sessionToken` variable: manual cookies can conflict with the cookie jar and become stale when sessions change.

If a request returns 401, check **Cookies** for the API host and sign in again. Use the same hostname for all requests (`localhost` and `127.0.0.1` have separate cookies). HTTPS cookies require HTTPS requests. If you previously used this collection, remove any old manual Cookie headers from your Postman copy and clear its old API-host cookies once before signing in again.

For a 403 on an auth request, confirm `originUrl` matches the server's trusted origin. Signing in through the browser does not automatically sign in Postman; use the collection's sign-in request.

See [Postman's cookie manager documentation](https://learning.postman.com/docs/use/send-requests/response-data/cookies) and [Better Auth's origin validation documentation](https://better-auth.com/docs/reference/security).
