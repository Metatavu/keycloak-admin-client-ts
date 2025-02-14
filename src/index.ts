import {
  createUserIfNotExists,
  deleteUserByName,
  listAllUsers,
} from "./keycloak/users";
import { Command } from "commander";
import { listGroups } from "./keycloak/groups";
import { listOrganizations } from "./keycloak/organizations";

const realm = process.env.REALM || "";

const program = new Command();

// Test user
const newKeycloakUser = {
  username: "newuser",
  email: "newuser@example.com",
  firstName: "New",
  lastName: "User",
  groups: [],
  realm: realm,
};

program
  .name("admin-client-example")
  .description("Admin client example for Keycloak")
  .version("1.0.0");

program
  .command("list-users")
  .description("List Keycloak users")
  .action(async () => {
    try {
      const keycloakUsers = await listAllUsers(realm);
      console.log(
        "Keycloak users:",
        keycloakUsers.map((user) => user.username)
      );
    } catch (error) {
      console.error("Error listing users:", error);
    }
  });

program
  .command("create-user")
  .description("Create a new user in Keycloak")
  .option("-u, --username <username>", "Username of the new user")
  .option("-e, --email <email>", "Email of the new user")
  .option("-f, --first-name <firstName>", "First name of the new user")
  .option("-l, --last-name <lastName>", "Last name of the new user")
  .action(async (cmd) => {
    const { username, email, firstName, lastName } = cmd;
    const updatedKeycloakUser = {
      ...newKeycloakUser,
      username: username || newKeycloakUser.username,
      email: email || newKeycloakUser.email,
      firstName: firstName || newKeycloakUser.firstName,
      lastName: lastName || newKeycloakUser.lastName,
    };
    try {
      await createUserIfNotExists(realm, updatedKeycloakUser);
      console.log("New user created");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  });

program
  .command("delete-user")
  .description("Delete a user in Keycloak")
  .option("-n, --name <name>", "Name of the user to delete")
  .action(async (cmd) => {
    const { name } = cmd;
    const usernameToDelete = name || newKeycloakUser.username;
    try {
      await deleteUserByName(realm, usernameToDelete);
      console.log("User deleted");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  });

program
  .command("list-groups")
  .description("List Keycloak groups")
  .action(async () => {
    try {
      const keycloakGroups = await listGroups(realm);
      console.log(
        "Keycloak groups:",
        keycloakGroups.map((group) => group.name)
      );
    } catch (error) {
      console.error("Error listing groups:", error);
    }
  });

program
  .command("list-organizations")
  .description("List Keycloak organizations")
  .action(async () => {
    try {
      const keycloakOrganizations = await listOrganizations(realm);
      console.log(
        "Keycloak organizations:",
        keycloakOrganizations.map((organization) => organization.name)
      );
    } catch (error) {
      console.error("Error listing organizations:", error);
    }
  });

program.parse(process.argv);
