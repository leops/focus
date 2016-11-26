import {
    createStore,
} from 'redux';
import {
    Map, List, Record,
} from 'immutable';
import {
    GraphState,
} from 'react-graph';

import {
    loadFile,
} from './files';

const State = Record({
    filename: null,
    loading: false,

    fgds: new List(),
    vmf: null,
    ast: null,

    declarations: new Map(),
    entities: new Map(),

    graph: GraphState.createEmpty(),
});

export default createStore((state = new State(), action) => {
    switch (action.type) {
        case 'START_LOAD_FILE':
            return state
                .set('filename', action.filename)
                .set('loading', true);

        case 'END_LOAD_FILE':
            return loadFile(state, action)
                .set('loading', false);

        case 'UPDATE_GRAPH':
            return state.set('graph', action.graph);

        default:
            return state;
    }
});
