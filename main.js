//electron app 'To-Do List'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'; //would rather not have to do this.
const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
	//Create new window
	mainWindow = new BrowserWindow({});
	//Load HTML into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'mainWindow.html'),
		protocol:'file:',
		slashes: true
	}));

	// Quit app when clicking X
	mainWindow.on('closed', function(){
		app.quit();
	});

	// Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

	// Insert menu
	Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow(){
	//Create new window
	addWindow = new BrowserWindow({
		width: 300,
		height:200,
		title:'Add Shopping List Item'
	});
	//Load HTML into window
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'addWindow.html'),
		protocol:'file:',
		slashes: true
	}));

	// memory clr on close
	addWindow.on('close', function(){
		addWindow = null;
	});
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
	console.log(item);
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
	{
		label:'File',
		submenu: [
			{
				label: 'Add Item',
				accelerator: process.platform == 'darwin' ? 'Command+T' : 'Ctrl+T',
				click(){
					createAddWindow();
				}
			},
			{
				label: 'Clear Items',
				accelerator: process.platform == 'darwin' ? 'Command+Y' : 'Ctrl+Y',
				click(){
					mainWindow.webContents.send('item:clear');
				}
			},
			{
				label:"Quit",
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click(){
					app.quit();
				}
			}
		]
	}
];

// if mac, add empty object to menu
if(process.platform == 'darwin'){
	mainMenuTemplate.unshift({});
}

// add developer tools item if not in prod.
if(process.env.NODE_ENV !== 'production'){
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu:[
			{
				label: 'Toggle DevTools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow){
					focusedWindow.toggleDevTools();
				}
			},
			{
				label: 'Refresh DOM',
				role: 'reload',
				accelerator: process.platform == 'darwin' ? 'Command+R' : 'Ctrl+R'
			}
		]
	});
}