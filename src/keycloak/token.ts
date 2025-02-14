import fs from "node:fs";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

const keycloakBaseURL = process.env.KEYCLOAK_BASE_URL || "";
const clientId = process.env.CLIENT_ID || "";
const clientSecret = process.env.CLIENT_SECRET || "";
const authenticationRealm = process.env.AUTHENTICATION_REALM || "";
const realm = process.env.REALM || "";
const cachedTokenPath = process.env.CACHED_TOKEN_PATH || "/tmp/default-token";

// Token response interface
interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

/**
 * Helper function to get cached token
 */
export const getCachedToken = async (): Promise<TokenResponse | null> => {
  if (!fs.existsSync(cachedTokenPath)) return null;

  const cachedToken = fs.readFileSync(cachedTokenPath, "utf-8");
  const parsedToken = JSON.parse(cachedToken) as TokenResponse;
  const decodedToken = jsonwebtoken.decode(parsedToken.access_token);

  if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.exp) return null;

  const expiresAt = decodedToken.exp * 1000;
  return expiresAt < Date.now() ? null : parsedToken;
};

/**
 * Helper function to store token in cache
 * 
 * @param token Token response
 */
export const storeCachedToken = async (token: TokenResponse) => {
  fs.writeFileSync(cachedTokenPath, JSON.stringify(token));
};

/**
 * Helper function to get access token
 */
export const getAccessToken = async (): Promise<string> => {
  const cachedToken = await getCachedToken();
  if (cachedToken) return cachedToken.access_token;

  const tokenUrl = `${keycloakBaseURL}/realms/${authenticationRealm}/protocol/openid-connect/token`;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) throw new Error(`Failed to retrieve token: ${await response.text()}`);

  const token = await response.json();
  await storeCachedToken(token);
  return token.access_token;
};
