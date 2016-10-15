import React, {
    Component,
    PropTypes
} from 'react';

import Node from './node';

export default class Edge extends Component {
    static propTypes = {
        edge: PropTypes.shape({
            output: PropTypes.number.isRequired,
            input: PropTypes.number.isRequired,
            color: PropTypes.string.isRequired
        }).isRequired,
        origin: Node.propTypes.node,
        dest: Node.propTypes.node,
    };

    shouldComponentUpdate(nextProps) {
        return this.props.edge !== nextProps.edge ||
            this.props.origin !== nextProps.origin ||
            this.props.dest !== nextProps.dest;
    }

    render() {
        const {output, input, color} = this.props.edge;
        const from = this.props.origin;
        const to = this.props.dest;

        const start = {
            x: from.x + from.width,
            y: from.y + 68.5 + output * 36
        };
        const end = {
            x: to.x,
            y: to.y + 68.5 + input * 36
        }
        const delta = {
            x: end.x - start.x,
            y: end.y - start.y
        };

        const goingForward = delta.x >= 0.0;
        const tension = {
            x: Math.min(Math.abs(delta.x), goingForward ? 1000 : 200),
            y: Math.min(Math.abs(delta.y), goingForward ? 1000 : 200)
        };

        const tangent = goingForward ? {
            x: (tension.x + tension.y) * 0.5,
            y: 0
        } : {
            x: (tension.x * 1.5) + (tension.y * 0.75),
            y: 0
        };

        return (
            <path
                fill="none"
                stroke={color}
                d={`
                    M${start.x} ${start.y}
                    C${start.x + tangent.x} ${start.y + tangent.y},
                     ${end.x - tangent.x} ${end.y - tangent.y},
                     ${end.x} ${end.y}
                 `} />
        );
    }
}
