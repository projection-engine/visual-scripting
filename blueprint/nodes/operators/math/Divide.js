import Node from "../../../../base/Node";
import {TYPES} from "../../../../base/TYPES";
import NODE_TYPES from "../../../../base/NODE_TYPES";


export default class Divide extends Node {
    a = 0
    b = 1
    constructor() {
        super([
            {label: 'A', key: 'a', accept: [TYPES.NUMBER], bundled: true, type: TYPES.NUMBER},
            {label: 'B', key: 'b', accept: [TYPES.NUMBER], bundled: true, type: TYPES.NUMBER}
        ], [
            {label: 'Result', key: 'res', type: TYPES.NUMBER}
        ]);
        this.name = 'Divide'
        this.size = 1
    }

    get type() {
        return NODE_TYPES.FUNCTION
    }

    static compile(tick, {a, b}, entities, attributes, nodeID, executors) {
        const aValue = a !== undefined ? a : executors[nodeID].a,
            bValue = b !== undefined ? b : executors[nodeID].b
        attributes[nodeID] = {
            res: aValue / bValue
        }
        return attributes
    }
}