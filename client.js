import {Gitlab} from "@gitbeaker/node";

import {cutil} from "@ghasemkiani/base";
import {Obj} from "@ghasemkiani/base";

class Client extends Obj {
	get token() {
		if (!this._token) {
			this._token = process.env.GITLAB_PERSONAL_ACCESS_TOKEN;
		}
		return this._token;
	}
	set token(token) {
		this._token = token;
	}
	get api() {
		if (!this._api) {
			let {token} = this;
			this._api = new Gitlab({token});
		}
		return this._api;
	}
	set api(api) {
		this._api = api;
	}
	async toGetAllGroups() {
		let client = this;
		let {api} = client;
		let groups = await api.Groups.all({
			owned: true,
			perPage: 100,
			maxPages: 10,
			showExpanded: false,
		});
		// path, id
		return groups;
	}
	async toGetAllProjects() {
		let client = this;
		let {api} = client;
		let projects = await api.Projects.all({
			owned: true,
			perPage: 100,
			maxPages: 10,
			showExpanded: false,
		});
		// path_with_namespace
		return projects;
	}
	async toGet(path) {
		let client = this;
		let {url, token} = client;
		let rsp = await fetch(url + path, {
			method: "GET",
			headers: {
				"PRIVATE-TOKEN": token,
			},
		});
		let json = await rsp.json();
		return json;
	}
	async toPost(path, data) {
		let client = this;
		let {url, token} = client;
		let rsp = await fetch(url + path, {
			method: "POST",
			headers: {
				"PRIVATE-TOKEN": token,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: Object.entries(Object(data)).map(bi => bi.map(encodeURIComponent).join("=")).join("&"),
		});
		let json = await rsp.json();
		return json;
	}
	async toPut(path, data) {
		let client = this;
		let {url, token} = client;
		let rsp = await fetch(url + path, {
			method: "PUT",
			headers: {
				"PRIVATE-TOKEN": token,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: Object.entries(Object(data)).map(bi => bi.map(encodeURIComponent).join("=")).join("&"),
		});
		let json = await rsp.json();
		return json;
	}
	async toDelete(path) {
		let client = this;
		let {url, token} = client;
		let rsp = await fetch(url + path, {
			method: "DELETE",
			headers: {
				"PRIVATE-TOKEN": token,
			},
		});
		let json = await rsp.text();
		return json;
	}
	async toGetProject({id}) {
		let client = this;
		id = encodeURIComponent(id); // id or path_with_namespace
		let path = `/projects/${id}`;
		let json = await client.toGet(path);
		return json;
	}
	async toListRemoteMirrors({id}) {
		let client = this;
		id = encodeURIComponent(id); // id or path_with_namespace
		let path = `/projects/${id}/remote_mirrors`;
		let json = await client.toGet(path);
		return json;
	}
	async toCreatePushMirror({id, url, enabled, keep_divergent_refs, only_protected_branches}) {
		let client = this;
		id = encodeURIComponent(id); // id or path_with_namespace
		let path = `/projects/${id}/remote_mirrors`;
		if (cutil.isNil(enabled)) {
			enabled = true;
		}
		if (cutil.isNil(keep_divergent_refs)) {
			keep_divergent_refs = true;
		}
		if (cutil.isNil(only_protected_branches)) {
			only_protected_branches = false;
		}
		let data = {
			url,
			enabled,
			keep_divergent_refs,
			only_protected_branches,
		};
		let json = await client.toPost(path, data);
		return json;
	}
	async toGetRemoteMirror({id, mirror_id}) {
		let client = this;
		id = encodeURIComponent(id); // id or path_with_namespace
		let path = `/projects/${id}/remote_mirrors/${mirror_id}`;
		let json = await client.toGet(path);
		return json;
	}
	async toUpdateRemoteMirror({id, mirror_id, enabled, keep_divergent_refs, only_protected_branches}) {
		let client = this;
		id = encodeURIComponent(id); // id or path_with_namespace
		let path = `/projects/${id}/remote_mirrors/${mirror_id}`;
		let data = Object.entries({enabled, keep_divergent_refs, only_protected_branches}).reduce((data, [k, v]) => (cutil.isNil(v) ? data : ((data[k] = v), data)), {});
		let json = await client.toPut(path, data);
		return json;
	}
	async toDeleteRemoteMirror({id, mirror_id}) {
		let client = this;
		id = encodeURIComponent(id); // id or path_with_namespace
		let path = `/projects/${id}/remote_mirrors/${mirror_id}`;
		let json = await client.toDelete(path);
		return json;
	}
	async toCreateRepo({name, desc, org, pub}) {
		let client = this;
		let {api} = client;
		let arg = {
			path: name,
			initialize_with_readme: false,
			"public": !!pub,
		};
		if (desc) {
			arg.description = desc;
		}
		if (org) {
			let groups = await client.toGetAllGroups();
			// namespace_id
			org = groups.find(({path, id}) => (path === org)).id;
		}
		let result = await api.Projects.create(arg);
		return result;
	}
	async toCreateRepoByUri(uri, pub) {
		let client = this;
		let username = await client.toGetUsername();
		console.log(`Gitlab username: [${username}]`);
		let [org, name] = uri.split("/");
		console.log(`org: [${org}]`);
		if (!name) {
			name = org;
			org = username;
		}
		if (org == username) {
			org = null;
		}
		let desc = null;
		let result = await client.toCreateRepo({name, desc, org, pub});
		return result;
	}
	async toCreatePublicRepo(uri) {
		let client = this;
		let pub = true;
		let result = await client.toCreateRepoByUri(uri, pub);
		return result;
	}
	async toCreatePrivateRepo(uri) {
		let client = this;
		let pub = false;
		let result = await client.toCreateRepoByUri(uri, pub);
		return result;
	}
	async toGetUser() {
		let client = this;
		let user = await client.toGet("/user");
		// username
		return user;
	}
	async toGetUsername() {
		let client = this;
		let {username} = await client.toGetUser();
		return username;
	}
}
cutil.extend(Client.prototype, {
	_token: null,
	_api: null,
	url: "https://gitlab.com/api/v4",
});

export {Client};

// https://docs.gitlab.com/ee/api/projects.html#create-project
