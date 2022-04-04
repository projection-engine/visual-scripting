import Node from "../../../../../flow/Node";
import {TYPES} from "../../../../../flow/TYPES";
import NODE_TYPES from "../../../../../flow/NODE_TYPES";


export default class ToVector extends Node {
    constructor() {
        super([
            {label: 'X', key: 'x', accept: [TYPES.NUMBER]},
            {label: 'Y', key: 'y', accept: [TYPES.NUMBER]},
            {label: 'Z', key: 'z', accept: [TYPES.NUMBER]},
            {label: 'W', key: 'w', accept: [TYPES.NUMBER]},
        ], [
            {label: 'Vector 2D', key: 'v2', type: TYPES.VEC2},
            {label: 'Vector 3D', key: 'v3', type: TYPES.VEC3},
            {label: 'Vector 4D', key: 'v4', type: TYPES.VEC4}
        ]);
        this.name = 'ToVector'
    }

    get type() {
        return NODE_TYPES.FUNCTION
    }

    static compile(tick, {x, y, z, w}, entities, attributes, nodeID) {
        attributes[nodeID] = {}

        attributes[nodeID].v2 = [x, y]
        attributes[nodeID].v3 = [x, y, z]
        attributes[nodeID].v4 = [x, y, z, w]

        return attributes
    }
}