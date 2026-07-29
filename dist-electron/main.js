import { BrowserWindow, app, ipcMain, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
//#region electron/main.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
ipcMain.handle("open-external", async (event, url) => {
	await shell.openExternal(url);
});
var win = null;
function createWindow() {
	win = new BrowserWindow({
		width: 1440,
		height: 900,
		titleBarStyle: "hiddenInset",
		webPreferences: { preload: path.join(__dirname, "preload.js") }
	});
	if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
	else win.loadFile(path.join(process.env.APP_ROOT || path.join(__dirname, ".."), "dist/index.html"));
}
if (process.defaultApp) {
	if (process.argv.length >= 2) app.setAsDefaultProtocolClient("bloom", process.execPath, [path.resolve(process.argv[1])]);
} else app.setAsDefaultProtocolClient("bloom");
if (!app.requestSingleInstanceLock()) app.quit();
else {
	app.on("second-instance", (event, commandLine, workingDirectory) => {
		if (win) {
			if (win.isMinimized()) win.restore();
			win.focus();
			const url = commandLine.find((arg) => arg.startsWith("bloom://"));
			if (url) win.webContents.send("deep-link", url);
		}
	});
	app.whenReady().then(createWindow);
}
app.on("open-url", (event, url) => {
	event.preventDefault();
	if (win && url.startsWith("bloom://")) win.webContents.send("deep-link", url);
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion
export {};
