import Node from "../../../../base/Node";
import {TYPES} from "../../../../base/TYPES";
import NODE_TYPES from "../../../../base/NODE_TYPES";


export default class FromVector extends Node {
    constructor() {
        super([
            {label: 'Vector', key: 'v', accept: [TYPES.VEC2, TYPES.VEC3, TYPES.VEC4]}
        ], [
            {label: 'X', key: 'x', type: TYPES.NUMBER},
            {label: 'Y', key: 'y', type: TYPES.NUMBER},
            {label: 'Z', key: 'z', type: TYPES.NUMBER},
            {label: 'W', key: 'w', type: TYPES.NUMBER},
        ]);
        this.name = 'FromVector'
    }

    get type() {
        return NODE_TYPES.FUNCTION
    }

    static compile(tick, {v}, entities, attributes, nodeID) {
        attributes[nodeID] = {}

        attributes[nodeID].x = v[0]
        attributes[nodeID].y = v[1]
        attributes[nodeID].z = v[2]
        attributes[nodeID].w = v[3]

        return attributes
    }
}