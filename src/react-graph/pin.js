import React, {
    Component,
    PropTypes
} from 'react';

export default class Pin extends Component {
    static propTypes = {
        pin: PropTypes.shape({
            name: PropTypes.string.isRequired,
            connected: PropTypes.bool.isRequired
        }).isRequired,
        onDrag: PropTypes.func,
        onDrop: PropTypes.func
    };

    constructor(props) {
        super(props);

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        return this.props.pin !== nextProps.pin;
    }

    onMouseDown(evt) {
        if(this.props.onDrag) {
            evt.preventDefault();
            evt.stopPropagation();

            this.props.onDrag();
        }
    }

    onMouseUp(evt) {
        if(this.props.onDrop) {
            evt.preventDefault();
            evt.stopPropagation();

            this.props.onDrop();
        }
    }

    render() {
        return (
            <p className="pin" onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp} data-connected={this.props.pin.connected}>
                {this.props.pin.name}
            </p>
        );
    }
}
