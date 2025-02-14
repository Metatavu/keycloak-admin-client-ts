import type { UserRepresentation } from "../generated/keycloak-client";
import { getApiClientConfiguration } from "./api";
import { listGroups } from "./groups";

/**
 * List users in Keycloak
 * Allows to list a bunch and filter by username, email, first and max
 * If no optional parameters are provided, it will list a maximum of 100 users (Keycloak pagination limit)
 *
 * @param realm realm name
 * @param username username
 * @param email email
 * @param first first
 * @param max max
 */
const listUsers = async (
  realm: string,
  username?: string,
  email?: string,
  first?: number,
  max?: number
) => {
  const { usersApi } = await getApiClientConfiguration();
  return usersApi.adminRealmsRealmUsersGet({
    realm: realm,
    username: username,
    email: email,
    first: first,
    max: max,
    exact: true,
    briefRepresentation: false,
  });
};

/**
 * List all users in Keycloak
 *
 * @param realm realm name
 */
export const listAllUsers = async (realm: string) => {
  const { usersApi } = await getApiClientConfiguration();
  const max = 100;
  let start = 0;
  const allUsers: UserRepresentation[] = [];

  // Fetch users in batches until all users are retrieved
  while (true) {
    const usersResponse = await usersApi.adminRealmsRealmUsersGet({
      realm: realm,
      max: max,
      first: start,
    });

    const users = usersResponse;
    console.log(`Fetched ${users.length} users`);
    if (users.length === 0) {
      break;
    }

    allUsers.push(...users);

    start += max;
  }

  return allUsers;
};

/**
 * List groups belonging to a user
 *
 * @param realm realm name
 * @param userId user id
 */
export const listUserGroups = async (realm: string, userId: string) => {
  const { usersApi } = await getApiClientConfiguration();
  return usersApi.adminRealmsRealmUsersUserIdGroupsGet({
    realm: realm,
    userId: userId,
  });
};

/**
 * Create a new user in Keycloak if it doesn't exist
 *
 * @param realm realm name
 * @param userData keycloak user representation
 */
export const createUserIfNotExists = async (
  realm: string,
  userData: UserRepresentation
) => {
  const { usersApi } = await getApiClientConfiguration();
  const { username, email, firstName, lastName, groups } = userData;

  // Check if the user already exists
  const existingUser = await listUsers(realm, username, email);

  if (existingUser.length > 0) {
    console.log(`User ${username} already exists`);
    return; // Skip creation if user already exists
  }

  // Create the new user in Keycloak
  return usersApi.adminRealmsRealmUsersPost({
    realm: realm,
    userRepresentation: {
      username: username,
      email: email,
      firstName: firstName,
      lastName: lastName,
      groups: groups,
      enabled: true,
    },
  });
};

/**
 * Update user groups in Keycloak
 *
 * @param realm realm name
 * @param userId user id
 * @param groupNames group names
 */
export const updateUserGroups = async (
  realm: string,
  userId: string,
  groupNames: string[]
) => {
  const { usersApi } = await getApiClientConfiguration();

  // Fetch all user groups and group names in one call
  const userGroups = await listUserGroups(realm, userId);
  const userGroupNames = new Set(userGroups.map((group) => group.name));

  // Fetch all groups in one call
  const allGroups = await listGroups(realm);
  const groupNameToIdMap = Object.fromEntries(
    allGroups.map((group) => [group.name, group.id])
  );

  for (const groupName of groupNames) {
    if (userGroupNames.has(groupName)) {
      console.log(`User ${userId} is already in group ${groupName}`);
      continue;
    }

    const groupId = groupNameToIdMap[groupName];
    if (!groupId) {
      console.warn(`Group ${groupName} not found`);
      continue;
    }

    // Update user groups in Keycloak
    await usersApi.adminRealmsRealmUsersUserIdGroupsGroupIdPut({
      realm: realm,
      userId: userId,
      groupId: groupId,
    });

    console.log(`User ${userId} added to group ${groupName}`);
  }
};

/**
 * Delete a user in Keycloak
 *
 * @param userId user id
 * @param realm realm name
 */
export const deleteUser = async (realm: string, userId: string) => {
  const { usersApi } = await getApiClientConfiguration();

  console.log(`Deleting user with id ${userId}`);
  try {
    usersApi.adminRealmsRealmUsersUserIdDelete({
      realm: realm,
      userId: userId,
    });
  } catch (error) {
    console.warn("Error deleting user:", error);
  }
};

/**
 * Delete a user by username
 *
 * @param username username
 * @param realm realm name
 */
export const deleteUserByName = async (realm: string, username: string) => {
  const user = await listUsers(realm, username);

  if (user.length === 0) {
    throw new Error(`User ${username} not found`);
  }

  await deleteUser(realm, user[0].id || "");
};
