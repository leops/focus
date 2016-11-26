import React from 'react';
import {
    connect,
} from 'react-redux';
import {
    Graph,
} from 'react-graph';

import NodeClass from './node';
import PinClass from './pin';
import styles from './graph.css';

export default connect(
    ({ graph }) => ({ graph }),
    dispatch => ({
        updateGraph: graph => dispatch({
            type: 'UPDATE_GRAPH',
            graph,
        }),
    }),
)(props => (
    <Graph
        className={styles.graph}

        value={props.graph}
        onChange={props.updateGraph}

        nodeClass={NodeClass}
        pinClass={PinClass} />
));
