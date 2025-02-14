import { getApiClientConfiguration } from "./api";
import type {
	OrganizationDomainRepresentation,
} from "../generated/keycloak-client";

/**
 * Find organization by name
 *
 * @param realm realm name
 * @param name organization name
 */
export const findOrganizationByName = async (realm: string, name: string) => {
	const { organizationsApi } = await getApiClientConfiguration();

	return organizationsApi.adminRealmsRealmOrganizationsGet({
		realm: realm,
		exact: true,
		search: name,
	});
};

/**
 * List organizations
 * 
 * @param realm realm name
 */
export const listOrganizations = async (realm: string) => {
	const { organizationsApi } = await getApiClientConfiguration();
	return organizationsApi.adminRealmsRealmOrganizationsGet({
		realm: realm,
	});
};

/**
 * Create an organization
 *
 * TODO: not tested
 * @param realm realm name
 * @param name organization name
 */
export const createOrganization = async (
	realm: string,
	name: string,
	domains: OrganizationDomainRepresentation[],
) => {
	const { organizationsApi } = await getApiClientConfiguration();

	console.log(`Creating organization ${name}`);

	// Check if the organization already exists
	const existingOrganization = await findOrganizationByName(realm, name);

	console.log("Existing organization with this name:", existingOrganization);

	if (existingOrganization.length > 0) {
		throw new Error(`Organization ${name} already exists`);
	}

	try {
		return organizationsApi.adminRealmsRealmOrganizationsPost({
			realm: realm,
			organizationRepresentation: {
				name: name,
				domains: new Set(domains),
				enabled: true,
			},
		});
	} catch (error) {
		console.error("Error creating organization:", error);
	}
};

/**
 * Add users to an organization
 *
 * TODO: not tested
 * @param realm realm name
 * @param organizationId organization id
 * @param userIds user ids
 */
export const addUsersToOrganization = async (
	realm: string,
	organizationId: string,
	userIds: Array<string>,
) => {
	const { organizationsApi } = await getApiClientConfiguration();

	const userIdsString = userIds.join(",");

	return organizationsApi.adminRealmsRealmOrganizationsOrgIdMembersPost({
		realm: realm,
		orgId: organizationId,
		body: userIdsString,
	});
};
