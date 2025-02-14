import { Configuration, GroupsApi, UsersApi, OrganizationsApi } from "../generated/keycloak-client";
import { getAccessToken } from "./token";

const keycloakBaseURL = process.env.KEYCLOAK_BASE_URL || "";

/**
 * Function to get API client configuration with token handling
 */
export const getApiClientConfiguration = async (): Promise<{ groupsApi: GroupsApi; usersApi: UsersApi; organizationsApi: OrganizationsApi }> => {
  const accessToken = await getAccessToken();
  
  const config = new Configuration({
    accessToken: accessToken,
    basePath: keycloakBaseURL,
    middleware: [
      {
        pre: async (context) => {
          context.init.headers = {
            ...context.init.headers,
            Authorization: `Bearer ${accessToken}`,
          };
          return context;
        },
      },
    ],
  });

  const groupsApi = new GroupsApi(config);
  const usersApi = new UsersApi(config);
  const organizationsApi = new OrganizationsApi(config);

  return { groupsApi, usersApi, organizationsApi };
};
