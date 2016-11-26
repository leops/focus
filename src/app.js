import React from 'react';
import {
    connect,
} from 'react-redux';

import Graph from './graph';
import {
    dropzone,
} from './app.css';

export default connect(
    state => ({
        state,
        loading: state.loading,
        filename: state.filename,
        sources: state.sources,
    }),
)(props => {
    if (props.loading) {
        return <p>Loading {props.filename} ...</p>;
    }

    if (props.state.vmf === null) {
        return (
            <div className={dropzone}>
                <p>Start by opening a .vmf or .fump file</p>
            </div>
        );
    }

    return <Graph />;
});
