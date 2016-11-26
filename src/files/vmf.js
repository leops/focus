import Immutable, {
    List, Map,
} from 'immutable';

import parser from 'vmfparser';
import generator from 'vmfparser/src/generator';

import {
    GraphState, Edge, Node, Pin,
} from 'react-graph';

export function loadVMF(state, action) {
    const map = parser(action.data);

    let x = 0;
    let y = 0;
    const getNextCoords = () => {
        const ret = { x, y };

        x += 300;
        if (x + 300 >= window.innerWidth) {
            x = 0;
            y += 130;
        }

        return ret;
    };

    let id = -1;
    let entities = new Map();
    const getEntityByName = name => {
        if (entities.has(name)) {
            return entities.get(name);
        }

        const ent = map.entity.find(e => e.targetname === name);
        entities = entities.set(name, ent);
        return ent;
    };

    let nodes = new Map();
    const addNode = ent => {
        const nodeId = Number(ent.id);
        if (nodes.has(nodeId)) {
            return nodes.get(nodeId);
        }

        const cls = state.declarations.get(ent.classname);
        const inputs = new List((ent.targetname && cls) ? cls.inputs : []).map(pin => new Pin(pin));
        const outputs = new List(cls ? cls.outputs : []).map(pin => new Pin(pin));

        const node = new Node({
            id: nodeId,
            title: `${ent.targetname} - ${ent.classname}`,
            ...getNextCoords(),
            inputs,
            outputs,
            data: new Map(ent),
        });

        nodes = nodes.set(nodeId, node);
        return node;
    };

    let edges = new List();
    const addLink = (activator, outputName, link) => {
        const [targetname, inputName, args, delay, once] = link.split('\u001B');

        const target = targetname === '!self' ? activator : (
            getEntityByName(targetname) ||
                {
                    id: id--,
                    targetname,
                }
        );

        const from = Number(activator.id);
        const to = Number(target.id);

        const origin = addNode(activator).update(
            'outputs',
            list => {
                const index = list.findKey(pin => pin.name === outputName);
                if (index === undefined) {
                    return list.push(new Pin({
                        name: outputName,
                    }));
                }

                return list;
            },
        );

        const output = origin.outputs.findKey(pin => pin.name === outputName);
        nodes = nodes.set(from, origin.setIn(['outputs', output, 'connected'], true));

        const dest = addNode(target).update(
            'inputs',
            list => {
                const index = list.findKey(pin => pin.name === inputName);
                if (index === undefined) {
                    return list.push(new Pin({
                        name: inputName,
                    }));
                }

                return list;
            },
        );

        const input = dest.inputs.findKey(pin => pin.name === inputName);
        nodes = nodes.set(to, dest.setIn(['inputs', input, 'connected'], true));

        edges = edges.push(new Edge({
            from,
            to,
            output,
            input,
            data: new Map({ args, delay, once }),
        }));

        // console.log(activator.targetname || from, output, targetname, input);
    };


    map.entity
        .map(ent => ({
            ...ent,
            connections: new Map(ent.connections),
        }))
        .forEach(ent => {
            if (ent.connections.size > 0) {
                ent.connections.forEach((output, key) => {
                    if (output instanceof Array) {
                        output.forEach(link => addLink(ent, key, link));
                    } else {
                        addLink(ent, key, output);
                    }
                });
            } else {
                const cls = state.declarations.get(ent.classname);
                if (cls && (cls.outputs || (cls.inputs && ent.targetname))) {
                    addNode(ent);
                }
            }
        });

    return state
        .set('entities', entities)
        .set(
            'graph',
            GraphState.fromGraph(nodes, edges),
        );
}

function setProp(node, prop) {
    const index = node.findKey(p => p.get('name') === prop.name);
    if (index !== undefined) {
        if (prop.body) {
            return node.setIn(
                [index, 'body'],
                prop.body,
            );
        }

        return node.setIn(
            [index, 'value'],
            prop.value,
        );
    }

    return node.push(new Map(prop));
}

export function saveVMF(state, action) {
    const {
        nodes, edges,
    } = state.graph.editorState;

    return `${generator(
       Immutable.fromJS(parser(action.data, {
           ast: true,
       })).update(
           'body',
           file => file.map(item => {
               if (item.get('name') !== 'entity') {
                   return item;
               }

               return item.update(
                   'body',
                   props => {
                       const id = Number(props.find(prop => prop.get('name') === 'id').get('value'));
                       const node = nodes.get(id);
                       if (!node) {
                           return props;
                       }

                       const outputs = edges
                           .filter(edge => edge.from === id)
                           .map(edge => {
                               const isSelf = edge.from === edge.to;
                               const target = isSelf ? node : nodes.get(edge.to);
                               const targetname = isSelf ? '!self' : target.data.get('targetname');

                               const output = node.outputs.get(edge.output);
                               const input = target.inputs.get(edge.input);

                               return new Map({
                                   type: 'Property',
                                   name: output.name,
                                   value: `${targetname}\u001B${input.name}\u001B${edge.args}\u001B${edge.delay}\u001B${edge.once}`,
                               });
                           });

                       const editor = props.findKey(prop => prop.get('name') === 'editor');
                       const logicalpos = {
                           type: 'Property',
                           name: 'logicalpos',
                           value: `[${node.x} ${node.y}]`,
                       };

                       let propsEditor;
                       if (editor !== undefined) {
                           propsEditor = props.updateIn(
                               [editor, 'body'],
                               body => setProp(body, logicalpos),
                           );
                       } else {
                           propsEditor = props.push(new Map({
                               type: 'Object',
                               name: 'editor',
                               body: new List([
                                   new Map(logicalpos),
                               ]),
                           }));
                       }

                       if (outputs.isEmpty()) {
                           return propsEditor;
                       }

                       return setProp(propsEditor, {
                           type: 'Object',
                           name: 'connections',
                           body: outputs,
                       });
                   },
               );
           }),
       ).toJS(),
   ).replace(/ {4}/g, '\t')}\n`;
}
