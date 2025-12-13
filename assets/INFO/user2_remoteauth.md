# Subject's constraints

Need to use -> OAuth 2.0 with any OAuth-compatible provider (e.g., Google, GitHub, etc.)
https://auth0.com/intro-to-iam/what-is-oauth-2

Key features and objectives include:
- Integrate the authentication system, allowing users to securely sign in.
- Obtain the necessary credentials and permissions from the authority to enable secure login.
- Implement user-friendly login and authorization flows that adhere to best practices and security standards.
- Ensure the secure exchange of authentication tokens and user information between the web application and the authentication provider.
This major module aims to provide a remote user authentication, offering users a secure and convenient way to access the web application.


# Used sources
https://www.youtube.com/watch?v=Bx1JqfPROXA

https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow

https://github.com/settings/applications/3261033


# The process - on frontend
The OAuth tab in the /auth page of the frontend is defined here:

<img width="323" height="125" alt="image" src="https://github.com/user-attachments/assets/38fbacb6-63f3-4f3d-8e12-6243bcc7b161" />

It uses the OAuthForm.svelte located in

<img width="375" height="107" alt="image" src="https://github.com/user-attachments/assets/6b3e5f64-5871-4d0b-a8e9-0bfafd50bcf7" />

In this form, there is a button named "OAuth with GitHub". Clicking it will trigger the onsubmit function handleOAuthRequest.

<img width="519" height="461" alt="image" src="https://github.com/user-attachments/assets/ed99b8f2-0ff1-4341-b138-a6374f7623ad" />

This function will generate a **random state**. It will also take the **clientID** and the **redirect_uri** (defining where to go to after redirection to GitHub).

> **_state:_** The state is used to protect against Cross-site request forgery (CSRF). That is an attack that forces authenticated users to submit a request to a web application against which they are currently authenticated. It will be rechecked below to ensure noone interfered with your request.

> **_client_ID:_** The client_ID comes from the app registration in GitHub, that was done beforehand (following https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authenticating-to-the-rest-api-with-an-oauth-app#registering-your-app):
> 
> <img width="515" height="375" alt="image" src="https://github.com/user-attachments/assets/e02d6cfa-1eab-4d2e-acd6-a8f62a9b7daa" />

Then it will send a request to **https://github.com/login/oauth/authorize**, passing the above mentioned parameters to it.

Then the redirection to GitHub happens and after successful login in GitHub, the user will be redirected to the **redirect_uri**. Looking at the uri, it will then contain also a code and a state parameter.

> It will look like this: http://localhost:8080/?code=secretcode&state=abc

- The **state** must now still matched the one you defined before, otherwise a CSRF attack happened and you should abort the process.
- The **code** is further used in the following steps.

# The process - on backend
/oauth-callback (which is the redirect_uri) is a public route on the backend:

<img width="369" height="138" alt="image" src="https://github.com/user-attachments/assets/d88382cf-7d4f-447f-9a1b-d88f212a897a" />


