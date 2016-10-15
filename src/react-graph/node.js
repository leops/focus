import React, {
    Component,
    PropTypes
} from 'react';
import Measure from 'react-measure';

import Pin from './pin.js';
import './node.css';

export default class Node extends Component {
    static propTypes = {
        node: PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,

            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
            width: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,

            inputs: PropTypes.arrayOf(Pin.propTypes.pin),
            outputs: PropTypes.arrayOf(Pin.propTypes.pin)
        }).isRequired,

        measureNode: PropTypes.func.isRequired,
        moveNode: PropTypes.func.isRequired,
        dragPin: PropTypes.func.isRequired,
        dropPin: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.mouseDown = this.mouseDown.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
        this.measure = this.measure.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        return this.props.node !== nextProps.node;
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.mouseMove);
        window.removeEventListener('mouseup', this.mouseUp);
    }

    mouseDown(evt) {
        evt.preventDefault();

        this.nodeStartX = this.props.node.x;
        this.nodeStartY = this.props.node.y;
        this.mouseStartX = evt.clientX;
        this.mouseStartY = evt.clientY;

        window.addEventListener('mousemove', this.mouseMove);
        window.addEventListener('mouseup', this.mouseUp);
    }

    mouseMove(evt) {
        evt.preventDefault();

        this.props.moveNode(
            this.props.node.id,
            this.nodeStartX + (evt.clientX - this.mouseStartX),
            this.nodeStartY + (evt.clientY - this.mouseStartY)
        );
    }

    mouseUp(evt) {
        evt.preventDefault();

        window.removeEventListener('mousemove', this.mouseMove);
        window.removeEventListener('mouseup', this.mouseUp);
    }

    measure({width, height}) {
        this.props.measureNode(
            this.props.node.id,
            width, height
        );
    }

    render() {
        return (
            <Measure whiteList={['width', 'height']} onMeasure={this.measure}>
                <div className="entity" onMouseDown={this.mouseDown} style={{
                    left: this.props.node.x,
                    top: this.props.node.y
                }}>
                    <h1>{this.props.node.title}</h1>
                    <div>
                        <div className="inputs">
                            {this.props.node.inputs.map(pin => (
                                <Pin key={pin.name} pin={pin} onDrop={() => this.props.dropPin(this.props.node, pin)} />
                            ))}
                        </div>
                        <div className="outputs">
                            {this.props.node.outputs.map(pin => (
                                <Pin key={pin.name} pin={pin} onDrag={() => this.props.dragPin(this.props.node, pin)} />
                            ))}
                        </div>
                    </div>
                </div>
            </Measure>
        );
    }
}
