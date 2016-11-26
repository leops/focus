// @flow
import React from 'react';

import type {
    Pin as PinData,
} from 'react-graph';

import {
    pin,
} from './node.css';

type PinProps = {
    pin: PinData
};

// eslint-disable-next-line arrow-parens
export default (props: PinProps) => (
    <p className={pin} data-connected={props.pin.connected}>
        {props.pin.name}
    </p>
);
