import {
    createStore
} from 'redux';
import {
    Map, List, Record
} from 'immutable';

import loadFile, {
    Edge
} from './reducers/loading';

const State = Record({
    filename: null,
    loading: false,

    declarations: new Map(),
    entities: new Map(),

    edges: new List(),
    nodes: new Map(),

    dragState: null
});

const DragState = Record({
    node: 0,
    pin: ''
});

export default createStore((state = new State(), action) => {
    switch (action.type) {
        case 'START_LOAD_FILE':
            return state
                .set('filename', action.filename)
                .set('loading', true);

        case 'END_LOAD_FILE':
            return loadFile(state, action);

        case 'MOVE_NODE':
            return state.updateIn(
                ['nodes', action.id],
                node => node
                    .set('x', action.x)
                    .set('y', action.y)
            );

        case 'MEASURE_NODE':
            return state.updateIn(
                ['nodes', action.id],
                node => node
                    .set('width', action.width)
                    .set('height', action.height)
            );

        case 'DRAG_PIN':
            return state
                .set('dragState', new DragState({
                    node: action.node.id,
                    pin: state.nodes.get(action.node.id)
                        .outputs.findKey(({name}) => name === action.pin.name)
                }));

        case 'DROP_PIN': {
            const from = state.dragState.node;
            const output = state.dragState.pin;

            const to = action.node.id;
            const input = state.nodes.get(to)
                .inputs.findKey(({name}) => name === action.pin.name);

            return state
                .update('nodes', nodes =>
                    nodes
                        .updateIn(
                            [from, 'outputs', output],
                            pin => pin.set('connected', true)
                        )
                        .updateIn(
                            [to, 'inputs', input],
                            pin => pin.set('connected', true)
                        )
                )
                .update('edges', edges =>
                    edges.push(new Edge({
                        from, to,
                        output, input
                    }))
                )
                .set('dragState', null);
        }

        case 'CANCEL_DRAG':
            return state
                .set('dragState', null);

        default:
            return state;
    }
});
