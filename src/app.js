import path from 'path';
import React, {
    Component
} from 'react';
import {
    connect
} from 'react-redux';
import Dropzone from 'react-dropzone';

import Graph from './graph';
import './app.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.onDrop = this.onDrop.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    onDrop([file]) {
        const ext = path.extname(file.name);
        this.props.onStartLoad(path.basename(file.name, ext));

        const reader = new FileReader();
        reader.onload = () => {
            this.props.onEndLoad(ext, reader.result);
        };

        reader.readAsText(file);
    }

    onKeyDown(event) {
        switch(event.which) {
            case 83:
                if(event.ctrlKey) {
                    this.save();
                    break;
                }
                return;

            default:
                console.log(event);
                return;
        }

        event.preventDefault();
    }

    save() {
        const file = new File(
            [JSON.stringify({
                nodes: this.props.nodes.toJS(),
                edges: this.props.edges.toJS(),
                declarations: this.props.declarations.toJS()
            })],
            `${this.props.filename}.fump`,
            {
                type: 'application/focus.map'
            }
        );

        location.href = URL.createObjectURL(file);
    }

    componentWillMount() {
        document.addEventListener('keydown', this.onKeyDown, false);
    }


    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown, false);
    }

    render() {
        if(this.props.filename === null) {
            return (
                <Dropzone className="dropzone" style={{}} onDrop={this.onDrop}>
                    <p>Drop a .vmf, .fgd or .fump file here</p>
                </Dropzone>
            );
        }

        if(this.props.loading) {
            return <p>Loading {this.props.filename} ...</p>;
        }

        return <Graph />;
    }
}

export default connect(
    ({loading, nodes, edges, declarations, filename}) => ({loading, nodes, edges, declarations, filename}),
    dispatch => ({
        onStartLoad: filename => dispatch({
            type: 'START_LOAD_FILE',
            filename
        }),
        onEndLoad: (ext, data) => dispatch({
            type: 'END_LOAD_FILE',
            ext, data
        }),
    })
)(App);
