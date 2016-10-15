import {
    Map, List, Record
} from 'immutable';

import vmfparser from 'vmfparser';
import fgdparser from '../fgd';

export const TYPE_STRING = Symbol('string');
export const TYPE_INTEGER = Symbol('integer');
export const TYPE_FLOAT = Symbol('float');
export const TYPE_VOID = Symbol('void');

export const Pin = Record({
    name: '',
    connected: false
});

export const NodeData = Record({
    classname: '',
    targetname: ''
});
export const Node = Record({
    id: 0,
    title: '',
    x: 0, y: 0,
    width: 0, height: 0,
    data: new NodeData(),
    inputs: new List(),
    outputs: new List()
});

export const Edge = Record({
    from: 0,
    output: 0,
    to: 0,
    input: 0,
    color: getTypeColor(TYPE_VOID)
});

function indexOf(list, name) {
    return list.findKey(pin => pin.name === name);
}

function getTypeColor(type) {
    switch(type) {
        case TYPE_STRING:
            return `rgb(255, 0, ${0.660537 * 255})`;

        case TYPE_INTEGER:
            return `rgb(${0.013575 * 255}, ${0.77 * 255}, ${0.429609 * 255})`;

        case TYPE_FLOAT:
            return `rgb(${0.357667 * 255}, 255, ${0.06 * 255})`;

        case TYPE_VOID:
        default:
            return '#fff';
    }
}

export default function(state, action) {
    switch(action.ext) {
        case '.vmf': {
            const map = vmfparser(action.data);

            let x = 0, y = 0;
            const getNextCoords = () => {
                const ret = {x, y};

                x += 300;
                if(x + 300 >= window.innerWidth) {
                    x = 0;
                    y += 74;
                }

                return ret;
            };

            let entities = new Map();
            const getEntityByName = name => {
                if(entities.has(name)) {
                    return entities.get(name);
                }

                const ent = map.entity.find(ent => ent.targetname === name);
                entities = entities.set(name, ent);
                return ent;
            };

            let nodes = new Map();
            const addNode = ent => {
                const id = Number(ent.id);
                if(nodes.has(id)) {
                    return nodes.get(id);
                }

                const cls = state.declarations.get(ent.classname);
                const inputs = new List((ent.targetname && cls) ? cls.inputs : []).map(pin => new Pin(pin));
                const outputs = new List(cls ? cls.outputs : []).map(pin => new Pin(pin));

                const node = new Node({
                    id,
                    title: `${ent.targetname} - ${ent.classname}`,
                    ...getNextCoords(),
                    inputs, outputs,
                    data: new NodeData(ent)
                });

                nodes = nodes.set(id, node);
                return node;
            };

            let edges = new List();
            const addLink = (activator, outputName, link) => {
                const [targetname, inputName] = link.split('\u001B');
                const target = getEntityByName(targetname);

                if(target) {
                    const origin = addNode(activator).update(
                        'outputs',
                        list => {
                            const index = indexOf(list, outputName);
                            if(index === undefined) {
                                return list.push(new Pin({
                                    name: outputName
                                }));
                            }

                            return list;
                        }
                    );
                    const dest = addNode(target).update(
                        'inputs',
                        list => {
                            const index = indexOf(list, inputName);
                            if(index === undefined) {
                                return list.push(new Pin({
                                    name: inputName
                                }));
                            }

                            return list;
                        }
                    );

                    const output = indexOf(origin.outputs, outputName);
                    const input = indexOf(dest.inputs, inputName);

                    const from = Number(activator.id);
                    const to = Number(target.id);
                    nodes = nodes
                        .set(
                            from,
                            origin.updateIn(
                                ['outputs', output],
                                pin => pin.set('connected', true)
                            )
                        )
                        .set(
                            to,
                            dest.updateIn(
                                ['inputs', input],
                                pin => pin.set('connected', true)
                            )
                        );

                    edges = edges.push(new Edge({
                        from, to,
                        output, input
                    }));

                    // console.log(activator.targetname || from, output, targetname, input);
                } else {
                    console.warn(`Could not find entity ${target}`);
                }
            }


            map.entity
                .map(ent => ({
                    ...ent,
                    connections: new Map(ent.connections)
                }))
                .forEach(ent => {
                    if(ent.connections.size > 0) {
                        ent.connections.forEach((output, key) => {
                            if(output instanceof Array) {
                                output.forEach(link => addLink(ent, key, link));
                            } else {
                                addLink(ent, key, output);
                            }
                        });
                    } else {
                        const cls = state.declarations.get(ent.classname);
                        if(cls && (cls.outputs || (cls.inputs && ent.targetname))) {
                            addNode(ent);
                        }
                    }
                });

            return state
                .set('entities', entities)
                .set('edges', edges)
                .set('nodes', nodes)
                .set('loading', false);
        }

        case '.fump': {
            const {declarations, edges, nodes} = JSON.parse(action.data);

            return state
                .set(
                    'declarations',
                    state.declarations.merge(new Map(declarations))
                )
                .set(
                    'edges',
                    new List(edges)
                        .map(v => new Edge(v))
                )
                .set(
                    'nodes',
                    new Map(nodes)
                        .mapEntries(([k, v]) => ([
                            Number(k),
                            new Node({
                                ...v,
                                inputs: new List(v.inputs)
                                    .map(p => new Pin(p)),
                                outputs: new List(v.outputs)
                                    .map(p => new Pin(p)),
                                data: new NodeData(v.data)
                            })
                        ]))
                )
                .set('loading', false);
        }

        case '.fgd': {
            const decl = state.declarations.merge(new Map(fgdparser(action.data)));
            console.log(decl.toJS());

            return state
                .set('declarations', decl)
                .set('filename', null)
                .set('loading', false);
        }

        default:
            return state
                .set('filename', null)
                .set('loading', false);
    }
}
