import fs from 'fs';
import path from 'path';
import {
    remote, shell,
} from 'electron';

import {
    saveFile,
} from './files';

const {
    app, Menu, dialog,
} = remote;

export default function (store) {
    const template = [{
        label: 'File',
        submenu: [
            {
                label: 'New',
            },
            {
                label: 'Open',
                click() {
                    dialog.showOpenDialog({
                        properties: ['openFile'],
                        filters: [
                            { name: 'Focus Map', extensions: ['fump'] },
                            { name: 'Valve Map File', extensions: ['vmf'] },
                        ],
                    }, ([filename]) => {
                        const ext = path.extname(filename);
                        store.dispatch({
                            type: 'START_LOAD_FILE',
                            filename: path.basename(filename, ext),
                            ext,
                        });

                        fs.readFile(filename, (err, data) => {
                            store.dispatch({
                                type: 'END_LOAD_FILE',
                                data: data.toString(),
                                filename,
                                ext,
                            });
                        });
                    });
                },
            },
            {
                label: 'Save',
                accelerator: 'CommandOrControl+S',
                click() {
                    dialog.showSaveDialog({
                        filters: [
                            { name: 'Focus Map', extensions: ['fump'] },
                        ],
                    }, filename => {
                        saveFile(store.getState(), {
                            filename,
                            ext: '.fump',
                        });
                    });
                },
            },
            {
                label: 'Save as ...',
            },
            {
                type: 'separator',
            },
            {
                label: 'Import FGDs',
                click() {
                    dialog.showOpenDialog({
                        properties: ['openFile', 'multiSelections'],
                        filters: [
                            { name: 'Forge Game Data', extensions: ['fgd'] },
                        ],
                    }, filenames => {
                        Promise.all(
                            filenames.map(filename => new Promise((resolve, reject) => {
                                fs.readFile(filename, (err, data) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve({
                                            filename,
                                            data: data.toString(),
                                        });
                                    }
                                });
                            })),
                        ).then(files => {
                            files.forEach(({ filename, data }) => {
                                store.dispatch({
                                    type: 'END_LOAD_FILE',
                                    filename,
                                    ext: '.fgd',
                                    data,
                                });
                            });
                        });
                    });
                },
            },
            {
                label: 'Export',
                click() {
                    dialog.showSaveDialog({
                        filters: [
                            { name: 'Valve Map File', extensions: ['vmf'] },
                        ],
                    }, filename => {
                        const state = store.getState();
                        saveFile(state, {
                            data: fs.readFileSync(state.vmf).toString(),
                            filename,
                            ext: '.vmf',
                        });
                    });
                },
            },
            {
                type: 'separator',
            },
            {
                role: 'quit',
            },
        ],
    }, {
        label: 'Edit',
        submenu: [
            {
                role: 'undo',
            },
            {
                role: 'redo',
            },
            {
                type: 'separator',
            },
            {
                role: 'cut',
            },
            {
                role: 'copy',
            },
            {
                role: 'paste',
            },
            {
                role: 'pasteandmatchstyle',
            },
            {
                role: 'delete',
            },
            {
                role: 'selectall',
            },
        ],
    }, {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow) {
                    if (focusedWindow) {
                        focusedWindow.reload();
                    }
                },
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    if (focusedWindow) {
                        focusedWindow.webContents.toggleDevTools();
                    }
                },
            },
            {
                type: 'separator',
            },
            {
                role: 'resetzoom',
            },
            {
                role: 'zoomin',
            },
            {
                role: 'zoomout',
            },
            {
                type: 'separator',
            },
            {
                role: 'togglefullscreen',
            },
        ],
    }, {
        role: 'window',
        submenu: [
            {
                role: 'minimize',
            },
            {
                role: 'close',
            },
        ],
    }, {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click() {
                    shell.openExternal('http://electron.atom.io');
                },
            },
        ],
    }];

    if (process.platform === 'darwin') {
        const name = app.getName();
        template.unshift({
            label: name,
            submenu: [
                {
                    role: 'about',
                },
                {
                    type: 'separator',
                },
                {
                    role: 'services',
                    submenu: [],
                },
                {
                    type: 'separator',
                },
                {
                    role: 'hide',
                },
                {
                    role: 'hideothers',
                },
                {
                    role: 'unhide',
                },
                {
                    type: 'separator',
                },
                {
                    role: 'quit',
                },
            ],
        });

        // Edit menu.
        template[1].submenu.push(
            {
                type: 'separator',
            },
            {
                label: 'Speech',
                submenu: [
                    {
                        role: 'startspeaking',
                    },
                    {
                        role: 'stopspeaking',
                    },
                ],
            },
        );

        // Window menu.
        template[3].submenu = [
            {
                label: 'Close',
                accelerator: 'CmdOrCtrl+W',
                role: 'close',
            },
            {
                label: 'Minimize',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize',
            },
            {
                label: 'Zoom',
                role: 'zoom',
            },
            {
                type: 'separator',
            },
            {
                label: 'Bring All to Front',
                role: 'front',
            },
        ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
