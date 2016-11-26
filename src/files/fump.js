import fs from 'fs';
import {
    List,
} from 'immutable';
import {
    GraphState,
} from 'react-graph';
import loadFGD from './fgd';

export function loadFUMP(state, action) {
    const { vmf, fgds, graph } = JSON.parse(action.data);

    const fgdLst = new List(fgds);
    return fgdLst
        .reduce((st, path) => loadFGD(st, {
            data: fs.readFileSync(path).toString(),
        }), state)
        .set('vmf', vmf)
        .set('fgds', fgdLst)
        .set(
            'graph',
            GraphState.restore(graph),
        );
}

export function saveFUMP({ vmf, fgds, graph }) {
    return JSON.stringify({
        vmf,
        fgds: fgds.toJS(),
        graph: graph.save(),
    }, null, '    ');
}
