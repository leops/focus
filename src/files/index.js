import fs from 'fs';
import loadFGD from './fgd';
import {
    loadVMF, saveVMF,
} from './vmf';
import {
    loadFUMP, saveFUMP,
} from './fump';

export function loadFile(state, action) {
    switch (action.ext) {
        case '.vmf':
            return loadVMF(state, action)
                .set('vmf', action.filename);

        case '.fump':
            return loadFUMP(state, action);

        case '.fgd':
            return loadFGD(state, action)
                .update('fgds', sources => sources.push(action.filename));

        default:
            return state;
    }
}

export function saveFile(state, action) {
    let data;
    switch (action.ext) {
        case '.vmf':
            data = saveVMF(state, action);
            break;

        case '.fump':
            data = saveFUMP(state, action);
            break;

        default:
            return;
    }

    fs.writeFile(action.filename, data, err => {
        if (err) {
            console.error(err);
        }
    });
}
