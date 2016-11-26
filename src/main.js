const {
    app,
    BrowserWindow,
} = require('electron');
const {
    fork
} = require('child_process');

let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    });

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

const child = fork('scripts/start.js', [], {
    silent: true
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on('message', message => {
    mainWindow.loadURL(message); // `file://${__dirname}/public/index.html`
});

child.on('exit', code => {
    process.exit(code);
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        child.exit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
