import React, {
    Component,
    PropTypes
} from 'react';

import Node from './node';
import Edge from './edge';
import './graph.css';

class Graph extends Component {
    static propTypes = {
        nodes: PropTypes.arrayOf(Node.propTypes.node).isRequired,
        edges: PropTypes.arrayOf(Edge.propTypes.edge).isRequired,
        dragState: PropTypes.shape({
            node: PropTypes.number.isRequired,
            pin: PropTypes.number.isRequired,
        }),

        measureNode: PropTypes.func.isRequired,
        moveNode: PropTypes.func.isRequired,
        dragPin: PropTypes.func.isRequired,
        dropPin: PropTypes.func.isRequired,
        cancelDrag: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.updateSVG = this.updateSVG.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);

        this.state = {
            cursorX: null,
            cursorY: null
        };
    }

    componentDidUpdate(prevProps, prevState) {
        this.updateSVG(this.svg);
    }

    mouseMove(evt) {
        if(this.graph && this.props.dragState) {
            evt.preventDefault();
            evt.stopPropagation();

            this.setState({
                cursorX: evt.clientX + this.graph.scrollLeft,
                cursorY: evt.clientY + this.graph.scrollTop
            });
        }
    }

    mouseUp(evt) {
        if(this.props.dragState) {
            evt.preventDefault();
            evt.stopPropagation();

            this.setState({
                cursorX: null,
                cursorY: null
            });
            this.props.cancelDrag();
        }
    }

    updateSVG(svg) {
        if(svg) {
            const bbox = svg.getBBox();
            svg.setAttribute('width', `${bbox.x + bbox.width}px`);
            svg.setAttribute('height', `${bbox.y + bbox.height}px`);

            this.svg = svg;
        }
    }

    render() {
        let dragState = null;
        if(this.props.dragState && this.state.cursorX && this.state.cursorY) {
            const from = this.props.nodes.get(this.props.dragState.node);
            dragState = (
                <Edge origin={from} dest={{
                    x: this.state.cursorX,
                    y: this.state.cursorY - 68.5
                }} edge={{
                    output: this.props.dragState.pin,
                    input: 0,
                    color: '#fff'
                }} />
            );
        }

        return (
            <div className="graph" onMouseMove={this.mouseMove} onMouseUp={this.mouseUp} ref={graph => this.graph = graph}>
                <svg ref={this.updateSVG}>
                    {this.props.edges.map(edge => {
                        const from = this.props.nodes.get(edge.from);
                        const to = this.props.nodes.get(edge.to);

                        if(from && to) {
                            return <Edge key={`${from.id}:${edge.output}-${to.id}:${edge.input}`} origin={from} dest={to} edge={edge} />;
                        } else {
                            return null;
                        }
                    })}
                    {dragState}
                </svg>
                {this.props.nodes.map(node => (
                    <Node key={node.id} node={node}
                        measureNode={this.props.measureNode}
                        moveNode={this.props.moveNode}
                        dragPin={this.props.dragState ? null : this.props.dragPin}
                        dropPin={this.props.dragState ? this.props.dropPin : null} />
                )).toArray()}
            </div>
        );
    }
}

export default Graph;
