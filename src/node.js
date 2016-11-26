// @flow
import React from 'react';

// eslint-disable-next-line no-duplicate-imports
import type {
    Element,
} from 'react';
import type {
    List,
} from 'immutable';
import type {
    Node as NodeData,
} from 'react-graph';

import {
    node,
    inputs,
    outputs,
} from './node.css';

type NodeProps = {
    node: NodeData,
    selected: boolean,
    inputs: List<Element<any>>,
    outputs: List<Element<any>>
};

// eslint-disable-next-line arrow-parens
export default (props: NodeProps) => (
    <div className={node} style={{
        borderColor: props.selected ? undefined : 'transparent',
    }}>
        <h1>{props.node.title}</h1>
        <div>
            <div className={inputs}>
                {props.inputs}
            </div>
            <div className={outputs}>
                {props.outputs}
            </div>
        </div>
    </div>
);
