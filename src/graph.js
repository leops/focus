import React, {
    Component
} from 'react';
import {
    connect
} from 'react-redux';

import Graph from './react-graph';
import './graph.css';

class FocusGraph extends Component {
    render() {
        return (
            <Graph
                nodes={this.props.nodes}
                edges={this.props.edges}
                dragState={this.props.dragState}

                moveNode={this.props.onMoveNode}
                measureNode={this.props.onMeasureNode}
                dragPin={this.props.onDrag}
                dropPin={this.props.onDrop}
                cancelDrag={this.props.onCancelDrag} />
        );
    }
}

export default connect(
    ({nodes, edges, dragState}) => ({nodes, edges, dragState}),
    dispatch => ({
        onMoveNode: (id, x, y) => dispatch({
            type: 'MOVE_NODE',
            id, x, y
        }),
        onMeasureNode: (id, width, height) => dispatch({
            type: 'MEASURE_NODE',
            id, width, height
        }),
        onDrag: (node, pin) => dispatch({
            type: 'DRAG_PIN',
            node, pin
        }),
        onDrop: (node, pin) => dispatch({
            type: 'DROP_PIN',
            node, pin
        }),
        onCancelDrag: () => dispatch({
            type: 'CANCEL_DRAG'
        })
    })
)(FocusGraph);
