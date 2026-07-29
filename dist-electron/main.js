import { BrowserWindow, Menu, app, ipcMain, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
//#region electron/main.ts
app.setName("Bloom");
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var APP_ROOT = path.join(__dirname, "..");
var ICON_PATH = path.join(APP_ROOT, "public", "app-icon.png");
ipcMain.handle("open-external", async (event, url) => {
	await shell.openExternal(url);
});
var win = null;
var pendingDeepLink = null;
function sendDeepLink(url) {
	if (win && win.webContents) win.webContents.send("deep-link", url);
	else pendingDeepLink = url;
}
function createWindow() {
	win = new BrowserWindow({
		width: 1440,
		height: 900,
		title: "Bloom",
		icon: ICON_PATH,
		titleBarStyle: "hiddenInset",
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			webSecurity: false
		}
	});
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("http://") || url.startsWith("https://")) {
			shell.openExternal(url);
			return { action: "deny" };
		}
		return { action: "allow" };
	});
	win.webContents.once("did-finish-load", () => {
		if (pendingDeepLink) {
			win?.webContents.send("deep-link", pendingDeepLink);
			pendingDeepLink = null;
		}
	});
	if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
	else win.loadFile(path.join(process.env.APP_ROOT || path.join(__dirname, ".."), "dist/index.html"));
}
if (process.defaultApp) {
	if (process.argv.length >= 2) app.setAsDefaultProtocolClient("bloom", process.execPath, [path.resolve(process.argv[1])]);
} else app.setAsDefaultProtocolClient("bloom");
var gotTheLock = app.requestSingleInstanceLock();
function createMenu() {
	const isMac = process.platform === "darwin";
	const template = [
		...isMac ? [{
			label: "Bloom",
			submenu: [
				{
					role: "about",
					label: "About Bloom"
				},
				{ type: "separator" },
				{ role: "services" },
				{ type: "separator" },
				{
					role: "hide",
					label: "Hide Bloom"
				},
				{ role: "hideOthers" },
				{ role: "unhide" },
				{ type: "separator" },
				{
					role: "quit",
					label: "Quit Bloom"
				}
			]
		}] : [],
		{
			label: "File",
			submenu: [isMac ? { role: "close" } : { role: "quit" }]
		},
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ role: "selectAll" }
			]
		},
		{
			label: "View",
			submenu: [
				{ role: "reload" },
				{ role: "forceReload" },
				{ role: "toggleDevTools" },
				{ type: "separator" },
				{ role: "resetZoom" },
				{ role: "zoomIn" },
				{ role: "zoomOut" },
				{ type: "separator" },
				{ role: "togglefullscreen" }
			]
		},
		{
			label: "Window",
			submenu: [
				{ role: "minimize" },
				{ role: "zoom" },
				...isMac ? [
					{ type: "separator" },
					{ role: "front" },
					{ type: "separator" },
					{ role: "window" }
				] : [{ role: "close" }]
			]
		}
	];
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}
if (!gotTheLock) app.quit();
else {
	app.on("second-instance", (event, commandLine, workingDirectory) => {
		if (win) {
			if (win.isMinimized()) win.restore();
			win.focus();
			const url = commandLine.find((arg) => arg.startsWith("bloom://"));
			if (url) sendDeepLink(url);
		}
	});
	app.whenReady().then(() => {
		createMenu();
		createWindow();
		if (process.platform === "darwin" && app.dock) app.dock.setIcon(ICON_PATH);
	});
}
app.on("open-url", (event, url) => {
	event.preventDefault();
	if (url.startsWith("bloom://")) {
		if (win) {
			if (win.isMinimized()) win.restore();
			win.show();
			win.focus();
		}
		sendDeepLink(url);
	}
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion
export {};
