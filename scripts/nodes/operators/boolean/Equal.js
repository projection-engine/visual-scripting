import Node from "../../../../base/Node";
import {DATA_TYPES} from "../../../../base/DATA_TYPES";
import NODE_TYPES from "../../../../base/NODE_TYPES";


export default class Equal extends Node {

    constructor() {
        super(
            [
                {label: 'A', key: 'a', accept: [DATA_TYPES.ANY]},
                {label: 'B', key: 'b', accept: [DATA_TYPES.ANY]}
            ],
            [
                {label: 'Truthful', key: 't', type: DATA_TYPES.BOOL}
            ],
        );
        this.size = 2
        this.name = 'Equal'
    }

    get type (){
        return NODE_TYPES.FUNCTION
    }
    static compile(tick, {a, b},  entities, attributes, nodeID) {

        attributes[nodeID] = {}
        attributes[nodeID].t = a === b

        return attributes
    }
}