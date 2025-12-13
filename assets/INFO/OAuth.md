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
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow
- https://medium.com/@tony.infisical/guide-to-using-oauth-2-0-to-access-github-api-818383862591

# The process - on frontend
The OAuth tab in the /auth page of the frontend is defined here:

<img width="323" height="125" alt="image" src="https://github.com/user-attachments/assets/38fbacb6-63f3-4f3d-8e12-6243bcc7b161" />

It uses the OAuthForm.svelte located in

<img width="375" height="107" alt="image" src="https://github.com/user-attachments/assets/6b3e5f64-5871-4d0b-a8e9-0bfafd50bcf7" />

In this form, there is a button named "OAuth with GitHub". Clicking it will trigger the onsubmit function handleOAuthRequest.

<img width="954" height="489" alt="image" src="https://github.com/user-attachments/assets/984d650f-2719-474b-bf24-558436dac82b" />

This function will generate a **random state**. It will also take the **clientID** and the **redirect_uri** (defining where to go to after redirection to GitHub).

> **_state:_** The state is used to protect against Cross-site request forgery (CSRF). That is an attack that forces authenticated users to submit a request to a web application against which they are currently authenticated. It will be rechecked below to ensure noone interfered with your request.

> **_client_ID:_** The client_ID comes from the app registration in GitHub, that was done beforehand (following https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authenticating-to-the-rest-api-with-an-oauth-app#registering-your-app).
>
> It can be found here: https://github.com/settings/applications/3261033
> 
> <img width="515" height="375" alt="image" src="https://github.com/user-attachments/assets/e02d6cfa-1eab-4d2e-acd6-a8f62a9b7daa" />

Then it will send a request to **https://github.com/login/oauth/authorize**, passing the above mentioned parameters to it.

Then the redirection to GitHub happens and after successful login in GitHub, the user will be redirected to the **redirect_uri**. Looking at the uri, it will then contain also a code and a state parameter.

> It will look like this: http://localhost:8080/oauth-callback/?code=secretcode&state=abc

Redirection happens since the route exists here:

<img width="420" height="327" alt="image" src="https://github.com/user-attachments/assets/4a2a7605-d72c-4eab-a8bd-25dd6218bcde" />

On mount calls the function when the page gets loaded. So the following function is called on the frontend:

<img width="863" height="391" alt="image" src="https://github.com/user-attachments/assets/d654ece5-02b9-4fbf-9858-10bec5848105" />

- The **state** must now still matched the one you defined before, otherwise a CSRF attack happened and you should abort the process.
- The **code** will be passed to the backend in the next section.

> **_code:_** The code is single-use only and will expire quickly. It only serves for exchanging it with the access token.

As you can see, the handleOAuthCallback calls client.oauth

<img width="348" height="231" alt="image" src="https://github.com/user-attachments/assets/983f58d4-a16c-4ddd-a287-70299fb0ff46" />

Which then makes a post request to auth/github-oauth:

<img width="353" height="364" alt="image" src="https://github.com/user-attachments/assets/680afa7a-959d-4f4f-9524-057142be1d47" />

# The process - on backend
/auth/github-oauth is a public route on the backend:

<img width="321" height="192" alt="image" src="https://github.com/user-attachments/assets/9dc77bbf-e521-43c7-8712-0130ab14e9d8" />

This then calls this function:

<img width="714" height="326" alt="image" src="https://github.com/user-attachments/assets/5ed62f34-be7e-40b7-b223-d50fe7ae30a8" />

The responseData will be json formatted and look like this: {"access_token": "gho_xxxxx", "scope": "repo", "token_type": "bearer"}

So you can extract the access_token, which you can then use to get the information you need to make a user profile:

<img width="504" height="193" alt="image" src="https://github.com/user-attachments/assets/bac473b5-91dd-4aab-8c17-e501af0d4e74" />

This response will then be json formatted and look like this: {"id": "123456", "login": "myusername", "email": "my.email@github.com"}
