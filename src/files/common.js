import {
    Record,
} from 'immutable';

export const TYPE_STRING = Symbol('string');
export const TYPE_INTEGER = Symbol('integer');
export const TYPE_FLOAT = Symbol('float');
export const TYPE_VOID = Symbol('void');

export function getTypeColor(type) {
    switch (type) {
        case TYPE_STRING:
            return `rgb(255, 0, ${0.660537 * 255})`;

        case TYPE_INTEGER:
            return `rgb(${0.013575 * 255}, ${0.77 * 255}, ${0.429609 * 255})`;

        case TYPE_FLOAT:
            return `rgb(${0.357667 * 255}, 255, ${0.06 * 255})`;

        case TYPE_VOID:
        default:
            return '#fff';
    }
}

export const NodeData = Record({
    classname: '',
    targetname: '',
});

export const EdgeData = Record({
    color: getTypeColor(TYPE_VOID),

    args: '',
    delay: 0,
    once: -1,
});
