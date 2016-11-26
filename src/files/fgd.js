import fgdparser from 'fgdparser';
import {
    Map, List,
} from 'immutable';
import {
    Pin,
} from 'react-graph';

export default (state, { data }) => {
    const merged = state.update(
        'declarations',
        decl => decl.merge(
            new Map(fgdparser(data)),
        ),
    );

    return merged.update(
        'graph',
        graph => graph.mapNodes(node => {
            const cls = merged.declarations.get(node.data.get('classname'));

            return node.update(
                'inputs',
                list => list.concat(
                    new List((node.data.get('targetname') && cls) ? cls.inputs : [])
                        .filter(p => list.find(pin => pin.name === p.name) === undefined)
                        .map(pin => new Pin(pin)),
                ),
            ).update(
                'outputs',
                list => list.concat(
                    new List(cls ? cls.outputs : [])
                        .filter(p => list.find(pin => pin.name === p.name) === undefined)
                        .map(pin => new Pin(pin)),
                ),
            );
        }),
    );
};
