# Setup Instructions

1. Install dependencies:

```sh
nvm use
npm i
```

2. Generate Keycloak client:

```sh
npm run generate-keycloak-client
```

3. Build the project (you can ignore the 3 errors related to generated files):

```sh
npm run build
```

4. Run an example:

```sh
npm run start
```

5. Include a relevant .env file fith the following content:

```
KEYCLOAK_BASE_URL=
CLIENT_ID=
CLIENT_SECRET=
AUTHENTICATION_REALM=
REALM=
CACHED_TOKEN_PATH=
```

# Run Instructions

Available command options:

- ```sh
  npm run start -- list-users
  ```
- ```sh
  npm run start -- create-user -u <username> -e <email> -f <firstName> -l <lastName>
  ```
- ```sh
  npm run start -- delete-user -n <name>
  ```
- ```sh
  npm run start -- list-groups
  ```
- ```sh
  npm run start -- list-organizations
  ```
