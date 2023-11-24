import axios, { AxiosError } from 'axios';
import { isArray } from 'lodash';
import { TreeNode } from './DatabaseView';

export interface SourceInfo {
	host: string;
	projectId: string;
	apiKey: string;
}

export const wait = (s: number) => {
	return new Promise((resolve) => setTimeout(resolve, s * 1000));
};

export async function get(url: string, projectId: string, apiKey: string) {
	const headers = {
		'X-Appwrite-Project': projectId,
		'Content-Type': 'application/json',
		'X-Appwrite-Key': apiKey,
	};
	await wait(0.1);
	return axios({
		method: 'GET',
		url,
		headers,
		params: { 'queries[]': 'limit(1000)' },
	});
}

export async function post(url: string, projectId: string, apiKey: string, data: any) {
	const headers = {
		'X-Appwrite-Project': projectId,
		'Content-Type': 'application/json',
		'X-Appwrite-Key': apiKey,
	};
	await wait(0.5);
	return axios({
		method: 'POST',
		url,
		headers,
		data,
	});
}

export async function patch(url: string, projectId: string, apiKey: string, data: any) {
	const headers = {
		'X-Appwrite-Project': projectId,
		'Content-Type': 'application/json',
		'X-Appwrite-Key': apiKey,
	};
	await wait(0.5);
	return axios({
		method: 'PATCH',
		url,
		headers,
		data,
	});
}

export async function deleteRequest(url: string, projectId: string, apiKey: string, data: any) {
	const headers = {
		'X-Appwrite-Project': projectId,
		'Content-Type': 'application/json',
		'X-Appwrite-Key': apiKey,
	};
	await wait(0.5);
	return axios({
		method: 'DELETE',
		url,
		headers,
		data,
	});
}

export async function getCollections({
	host,
	projectId,
	apiKey,
	databaseId,
}: {
	host: string;
	projectId: string;
	apiKey: string;
	databaseId: string;
}) {
	const url = `${host}/v1/databases/${databaseId}/collections`;
	const res = await get(url, projectId, apiKey);
	return res.data;
}

export async function getDatabases({ host, projectId, apiKey }: { host: string; projectId: string; apiKey: string }) {
	const url = `${host}/v1/databases`;
	const res = await get(url, projectId, apiKey);
	return res.data;
}

export async function getAllUsers({ host, projectId, apiKey }: { host: string; projectId: string; apiKey: string }) {
	const url = `${host}/v1/users`;
	const res = await get(url, projectId, apiKey);
	return res.data;
}

export async function getAllTeams({ host, projectId, apiKey }: { host: string; projectId: string; apiKey: string }) {
	const url = `${host}/v1/teams`;
	const res = await get(url, projectId, apiKey);
	const { teams, total } = res.data;
	for (const team of teams) {
		const resMembership = await get(`${host}/v1/teams/${team.$id}/memberships`, projectId, apiKey);
		team.memberships = resMembership.data.memberships;
	}
	return { teams, total };
}

export async function createUser({
	user,
	host,
	projectId,
	apiKey,
	override = false,
}: {
	user: any;
	host: string;
	projectId: string;
	apiKey: string;
	override: boolean;
}): Promise<any> {
	try {
		const res = await post(`${host}/v1/users/${user.hash}`, projectId, apiKey, {
			userId: user.$id,
			email: user.email,
			password: user.password,
			name: user.name,
		});
		return res.data;
	} catch (e: any) {
		if (e.response.data.type === 'user_already_exists' && override) {
			await deleteUser({
				user,
				host,
				projectId,
				apiKey,
			});
			await wait(2);
			return await createUser({
				user,
				host,
				projectId,
				apiKey,
				override: false,
			});
		} else {
			return e.response.data;
		}
	}
}

export const deleteUser = async ({
	user,
	host,
	projectId,
	apiKey,
}: {
	user: any;
	host: string;
	projectId: string;
	apiKey: string;
}) => {
	try {
		const res = await deleteRequest(`${host}/v1/users/${user.$id}`, projectId, apiKey, {
			userId: user.$id,
		});
		return res.data;
	} catch (e: any) {
		return e.response.data;
	}
};

const deleteMembership = async ({
	member,
	team,
	host,
	projectId,
	apiKey,
}: {
	member: any;
	team: any;
	host: string;
	projectId: string;
	apiKey: string;
}) => {
	try {
		const res = await deleteRequest(`${host}/v1/teams/${team.$id}/memberships/${member.$id}`, projectId, apiKey, {});
		return res.data;
	} catch (e: any) {
		return e.response.data;
	}
};

export async function deleteTeam({
	team,
	host,
	projectId,
	apiKey,
}: {
	team: any;
	host: string;
	projectId: string;
	apiKey: string;
}) {
	try {
		const res = await deleteRequest(`${host}/v1/teams/${team.$id}`, projectId, apiKey, {});
		return res.data;
	} catch (e: any) {
		return e.response.data;
	}
}
export async function createTeamMembership({
	member,
	team,
	host,
	projectId,
	apiKey,
	override = false,
}: {
	member: any;
	team: any;
	host: string;
	projectId: string;
	apiKey: string;
	override: boolean;
}): Promise<any> {
	try {
		const res = await post(`${host}/v1/teams/${team.$id}/memberships`, projectId, apiKey, {
			teamId: team.$id,
			email: member.userEmail,
			roles: member.roles,
			url: host,
		});
		return res.data;
	} catch (e: any) {
		if (e.response.data.type === 'team_invite_already_exists' && override) {
			await deleteMembership({
				member,
				team,
				host,
				projectId,
				apiKey,
			});
			await wait(2);
			return await createTeamMembership({
				member,
				team,
				host,
				projectId,
				apiKey,
				override: false,
			});
		} else {
			return e.response.data;
		}
	}
}

export async function createTeam({
	team,
	host,
	projectId,
	apiKey,
	override = false,
}: {
	team: any;
	host: string;
	projectId: string;
	apiKey: string;
	override: boolean;
}): Promise<any> {
	try {
		const res = await post(`${host}/v1/teams`, projectId, apiKey, {
			teamId: team.$id,
			name: team.name,
		});
		return res.data;
	} catch (e: any) {
		if (e.response.data.code === 500 && override) {
			await deleteTeam({
				team,
				host,
				projectId,
				apiKey,
			});
			await wait(2);
			return await createTeam({
				team,
				host,
				projectId,
				apiKey,
				override: false,
			});
		}
		console.log(e.response.data);
		return e.response.data;
	}
}

export async function cloneUsers(users: any, targetData: any, override: boolean, addLog: any) {
	addLog('Cloning users...');
	for (const user of users) {
		const res = await createUser({
			...targetData,
			user,
			override,
		});
		if (res.$id) {
			addLog(`Cloned user ${res.email}`);
		} else if (res.type === 'user_already_exists') {
			addLog(`User ${user.email} existed`);
		}
	}
	addLog('Finished cloning users');
}

export async function cloneTeams(teams: any, targetData: SourceInfo, override: boolean, addLog: any) {
	addLog('Cloning teams...');
	for (const team of teams) {
		const res = await createTeam({
			...targetData,
			team,
			override,
		});
		if (res.$id) {
			addLog(`Cloned team ${res.name}`);
		} else {
			addLog(`Team ${team.name} existed`);
		}
		addLog('Cloning team memberships...');
		for (const member of team.memberships) {
			const res2 = await createTeamMembership({
				...targetData,
				member,
				team,
				override,
			});
			if (res2.$id) {
				addLog(`Cloned team membership ${res2.userEmail}`);
			} else {
				addLog(`${member.userEmail} - ${res2.message}`);
			}
		}
		addLog('Finished cloning team memberships');
	}
}

export async function deleteDatabase({
	database,
	host,
	projectId,
	apiKey,
}: {
	database: any;
	host: string;
	projectId: string;
	apiKey: string;
}) {
	try {
		const res = await deleteRequest(`${host}/v1/databases/${database.$id}`, projectId, apiKey, {
			databaseId: database.$id,
		});
		return res.data;
	} catch (e: any) {
		return e.response.data;
	}
}

export async function createDatabase({
	database,
	host,
	projectId,
	apiKey,
	override = false,
}: {
	database: any;
	host: string;
	projectId: string;
	apiKey: string;
	override: boolean;
}): Promise<any> {
	try {
		const res = await post(`${host}/v1/databases`, projectId, apiKey, {
			databaseId: database.$id,
			name: database.name,
		});
		return res.data;
	} catch (e: any) {
		// if (e.response.data.type === "database_already_exists" && override) {
		//   await deleteDatabase({
		//     database,
		//     host,
		//     projectId,
		//     apiKey,
		//   });
		//   await wait(2);
		//   return await createDatabase({
		//     database,
		//     host,
		//     projectId,
		//     apiKey,
		//     override: false,
		//   });
		// } else {
		return e.response.data;
		// }
	}
}

export async function deleteCollection({
	collection,
	database,
	host,
	projectId,
	apiKey,
}: {
	collection: any;
	database: any;
	host: string;
	projectId: string;
	apiKey: string;
}) {
	try {
		const res = await deleteRequest(
			`${host}/v1/databases/${database.$id}/collections/${collection.$id}`,
			projectId,
			apiKey,
			{
				collectionId: collection.$id,
			},
		);
		return res.data;
	} catch (e: any) {
		return e.response.data;
	}
}

export async function createCollection({
	collection,
	host,
	projectId,
	apiKey,
	database,
	override = false,
}: {
	collection: any;
	host: string;
	projectId: string;
	apiKey: string;
	database: any;
	override: boolean;
}): Promise<any> {
	try {
		const res = await post(`${host}/v1/databases/${database.$id}/collections`, projectId, apiKey, {
			collectionId: collection.$id,
			name: collection.name,
		});
		return res.data;
	} catch (e: any) {
		if (e.response.data.type === 'collection_already_exists' && override) {
			await deleteCollection({
				collection,
				database,
				host,
				projectId,
				apiKey,
			});
			await wait(2);
			return await createCollection({
				collection,
				host,
				projectId,
				apiKey,
				database,
				override: false,
			});
		} else {
			return e.response.data;
		}
	}
}

async function createAttributes({
	attributes,
	host,
	projectId,
	apiKey,
	collectionId,
	databaseId,
}: {
	attributes: any;
	host: string;
	projectId: string;
	apiKey: string;
	collectionId: string;
	databaseId: string;
}) {
	for (let att of attributes) {
		const path = att.format || (att.type === 'double' ? 'float' : att.type);
		if (att.relatedCollection) att.relatedCollectionId = att.relatedCollection;
		if (att.relationType) att.type = att.relationType;
		if (att.max > 922337203685477600) delete att.max;
		if (att.default === null) delete att.default;
		try {
			// Log for debug
			console.log(att);

			await post(
				`${host}/v1/databases/${databaseId}/collections/${collectionId}/attributes/${path}`,
				projectId,
				apiKey,
				att,
			);
		} catch (e: any) {
			//
		}
	}
}

export async function listAttributes({
	host,
	projectId,
	apiKey,
	collectionId,
	databaseId,
}: {
	host: string;
	projectId: string;
	apiKey: string;
	collectionId: string;
	databaseId: string;
}) {
	const res = await get(`${host}/v1/databases/${databaseId}/collections/${collectionId}/attributes`, projectId, apiKey);
	return res.data;
}

export async function createDocument({
	document,
	host,
	projectId,
	apiKey,
}: {
	document: any;
	host: string;
	projectId: string;
	apiKey: string;
}) {
	let { $id, $databaseId, $collectionId, $permissions, ...data } = document;

	data = removeNotAllowKey(data);
	function removeNotAllowKey(data: any) {
		for (let key in data) {
			if (data[key]) {
				if (data[key].$id) {
					let { $databaseId, $collectionId, $permissions, $createdAt, $updatedAt, ...remainData } = data[key];
					data[key] = remainData;
					for (let k in data[key]) {
						if (data[key][k] && data[key][k].$id) data[key][k] = removeNotAllowKey(data[key][k]);
						if (isArray(data[key][k])) {
							if (data[key][k][0] && data[key][k][0].$id) data[key][k] = removeNotAllowKey(data[key][k]);
						}
					}
				}
				if (isArray(data[key])) {
					if (data[key][0] && data[key][0].$id) {
						data[key] = data[key].map((i: any) => {
							let { $databaseId, $collectionId, $permissions, $createdAt, $updatedAt, ...remainData } = i;
							for (let k in remainData) {
								if (remainData[k] && remainData[k].$id) remainData[k] = removeNotAllowKey(remainData[k]);
								if (isArray(remainData[k])) {
									if (remainData[k][0] && remainData[k][0].$id) remainData[k] = removeNotAllowKey(remainData[k]);
								}
							}
							return remainData;
						});
					}
				}
			}
		}
		return data;
	}

	try {
		console.log(`Cloning document ${$id} in collection ${$collectionId}`);

		const res = await post(
			`${host}/v1/databases/${$databaseId}/collections/${$collectionId}/documents`,
			projectId,
			apiKey,
			{
				databaseId: $databaseId,
				collectionId: $collectionId,
				documentId: $id,
				data,
				permissions: $permissions,
			},
		).catch(async (e: AxiosError) => {
			if (e.response?.status === 401) {
				console.log('Failed to clone this document. Trying to create relationship document with relation ID instead.');

				for (let key in data) {
					if (data[key]) {
						if (data[key].$id) data[key] = data[key].$id;
						if (isArray(data[key])) {
							if (data[key][0] && data[key][0].$id) data[key] = data[key].map((i: any) => i.$id);
						}
					}
				}

				const res = await post(
					`${host}/v1/databases/${$databaseId}/collections/${$collectionId}/documents`,
					projectId,
					apiKey,
					{
						databaseId: $databaseId,
						collectionId: $collectionId,
						documentId: $id,
						data,
						permissions: $permissions,
					},
				).catch((e) => ({ data: e }));

				return res.data;
			} else if (e.response?.status === 409) {
				console.log('Failed to clone this document. Trying to modify the document instead.');

				const res = await patch(
					`${host}/v1/databases/${$databaseId}/collections/${$collectionId}/documents/${$id}`,
					projectId,
					apiKey,
					{
						databaseId: $databaseId,
						collectionId: $collectionId,
						documentId: $id,
						data,
						permissions: $permissions,
					},
				).catch((e) => ({ data: e }));

				return res.data;
			}
			return { data: e };
		});

		return res.data;
	} catch (e: any) {
		//
	}
}

export async function listDocuments({
	host,
	projectId,
	apiKey,
	collectionId,
	databaseId,
}: {
	host: string;
	projectId: string;
	apiKey: string;
	collectionId: string;
	databaseId: string;
}) {
	const res = await get(`${host}/v1/databases/${databaseId}/collections/${collectionId}/documents`, projectId, apiKey);
	return res.data.documents;
}

export async function cloneDatabase(
	database: TreeNode,
	sourceInfo: SourceInfo,
	targetInfo: SourceInfo,
	override: boolean,
	addLog: any,
) {
	addLog(`Clone ${database.name}...`);
	const res = await createDatabase({
		...targetInfo,
		database,
		override,
	});
	if (res.$id) {
		addLog(`Created database ${res.name}`);
	} else {
		addLog(`Database ${database.name} existed`);
	}
	addLog(`Cloning database ${database.name}'s collections`);
	if (isArray(database.children)) {
		for (const collection of database.children.filter((i) => i.checked)) {
			const res2 = await createCollection({
				...targetInfo,
				database,
				collection,
				override,
			});
			if (!res2.$id) {
				addLog(`${collection.name} - ${res2.message}`);
			}
		}
		for (const collection of database.children.filter((i) => i.checked)) {
			const sourceAtt = await listAttributes({
				...sourceInfo,
				collectionId: collection.$id,
				databaseId: database.$id,
			});
			await createAttributes({
				...targetInfo,
				attributes: sourceAtt.attributes,
				collectionId: collection.$id,
				databaseId: database.$id,
			});
		}
		for (const collection of database.children.filter((i) => i.checked)) {
			// get source documents
			const sourceDocs = await listDocuments({
				...sourceInfo,
				collectionId: collection.$id,
				databaseId: database.$id,
			});
			for (const document of sourceDocs) {
				await createDocument({
					...targetInfo,
					document,
				});
			}
			addLog(`Finished cloning collection ${collection.name} (${sourceDocs.length} documents)`);
		}
	}
	addLog(`Finished cloning database ${database.name}`);
}
