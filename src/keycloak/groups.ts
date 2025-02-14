import { getApiClientConfiguration } from "./api";

/**
 * List keycloak groups
 *
 * @param realm realm name
 * @param first first
 * @param max max
 * @param search search
 */
export const listGroups = async (
	realm: string,
	first?: number,
	max?: number,
	search?: string,
) => {
	const { groupsApi } = await getApiClientConfiguration();
	return groupsApi.adminRealmsRealmGroupsGet({
		realm: realm,
		first: first,
		max: max,
		search: search,
	});
};

/**
 * Create a new group in Keycloak
 *
 * @param realm realm name
 * @param name group name
 */
export const createGroup = async (realm: string, name: string) => {
	const { groupsApi } = await getApiClientConfiguration();

	console.log(`Creating group ${name}`);
	try {
		// Create the new group in Keycloak
		groupsApi.adminRealmsRealmGroupsPost({
			realm: realm,
			groupRepresentation: {
				name: name,
			},
		});

		console.log(`Group ${name} has been created in Keycloak successfully.`);
	} catch (error) {
		console.warn("Error creating group:", error);
	}
};

/**
 * Delete a group in Keycloak
 *
 * @param realm realm name
 * @param id group id
 */
export const deleteGroup = async (realm: string, id: string) => {
	const { groupsApi } = await getApiClientConfiguration();

	console.log(`Deleting group ${id}`);
	try {
		// Delete the group in Keycloak
		groupsApi.adminRealmsRealmGroupsGroupIdDelete({
			realm: realm,
			groupId: id,
		});

		console.log(`Group ${id} has been deleted from Keycloak successfully.`);
	} catch (error) {
		console.warn("Error deleting group:", error);
	}
};

/**
 * Delete all groups in Keycloak
 *
 * @param realm realm name
 */
export const deleteAllGroups = async (realm: string) => {
	const { groupsApi } = await getApiClientConfiguration();
	const groups = await listGroups(realm);

	console.log(`Going to delete ${groups.length} groups from Keycloak.`);

	if (groups.length === 0) {
		console.log("No groups found in Keycloak.");
		return;
	}

	console.log(`Found ${groups.length} groups in Keycloak.`);

	for (const group of groups) {
		console.log(`Deleting group ${group.name}`);
		try {
			groupsApi.adminRealmsRealmGroupsGroupIdDelete({
				realm: realm,
				groupId: group.id || "",
			});

			console.log(
				`Group ${group.name} has been deleted from Keycloak successfully.`,
			);
		} catch (error) {
			console.warn("Error deleting group:", error);
		}
	}
};