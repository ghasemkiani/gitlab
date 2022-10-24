import {Gitlab} from '@gitbeaker/node';

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
	async toGetAllProjects() {
		let app = this;
		let {api} = app;
		let projects = await api.Projects.all({
			perPage: 100,
			maxPages: 10,
			showExpanded: false,
			owned: true,
		});
		return projects;
	}
	async toGet(path) {
		let app = this;
		let {url, token} = app;
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
		let app = this;
		let {url, token} = app;
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
		let app = this;
		let {url, token} = app;
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
		let app = this;
		let {url, token} = app;
		let rsp = await fetch(url + path, {
			method: "DELETE",
			headers: {
				"PRIVATE-TOKEN": token,
			},
		});
		let json = await rsp.json();
		return json;
	}
	async toListRemoteMirrors({id}) {
		let app = this;
		let path = `/projects/${id}/remote_mirrors`;
		let json = await app.toGet(path);
		return json;
	}
	async toCreatePushMirror({id, url, enabled, keep_divergent_refs, only_protected_branches}) {
		let app = this;
		let path = `/projects/${id}/remote_mirrors/${mirror_id}`;
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
		let json = await app.toPost(path, data);
		return json;
	}
	async toGetRemoteMirror({id, mirror_id}) {
		let app = this;
		let path = `/projects/${id}/remote_mirrors/${mirror_id}`;
		let json = await app.toGet(path);
		return json;
	}
	async toUpdateRemoteMirror({id, mirror_id, enabled, keep_divergent_refs, only_protected_branches}) {
		let app = this;
		let path = `/projects/${id}/remote_mirrors/${mirror_id}`;
		let data = Object.entries({enabled, keep_divergent_refs, only_protected_branches}).reduce((data, [k, v]) => (cutil.isNil(v) ? data : ((data[k] = v), data)), {});
		let json = await app.toPut(path, data);
		return json;
	}
	async toDeleteRemoteMirror({id, mirror_id}) {
		let app = this;
		let path = `/projects/${id}/remote_mirrors/${mirror_id}`;
		let json = await app.toDelete(path);
		return json;
	}
}
cutil.extend(Client.prototype, {
	_token: null,
	_api: null,
	url: "https://gitlab.com/api/v4",
})

export {Client};
