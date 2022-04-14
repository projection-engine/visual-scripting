import Node from "../../../../base/Node";
import {TYPES} from "../../../../base/TYPES";
import NODE_TYPES from "../../../../base/NODE_TYPES";


export default class GreaterEqual extends Node {

    constructor() {
        super(
            [
                {label: 'A', key: 'a', accept: [TYPES.ANY]},
                {label: 'B', key: 'b', accept: [TYPES.ANY]}
            ],
            [
                {label: 'Truthful', key: 't', type: TYPES.BOOL}
            ]
        );
        this.name = 'GreaterEqual'
        this.size = 2
    }

    get type (){
        return NODE_TYPES.FUNCTION
    }
    static compile(tick, {a, b}, entities, attributes, nodeID) {

        attributes[nodeID] = {}
        attributes[nodeID].t = a >= b

        return attributes
    }
}