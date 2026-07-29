import { contextBridge, ipcRenderer } from "electron";
//#region electron/preload.ts
contextBridge.exposeInMainWorld("electronAPI", {
	ping: () => ipcRenderer.invoke("ping"),
	onDeepLink: (callback) => {
		ipcRenderer.on("deep-link", (_event, url) => callback(url));
	},
	openExternal: (url) => ipcRenderer.invoke("open-external", url)
});
//#endregion
export {};
