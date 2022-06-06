import Node from "../../../../../../components/templates/Node"
import {DATA_TYPES} from "../../../../../../../../engine/templates/DATA_TYPES"
import NODE_TYPES from "../../../../../../components/templates/NODE_TYPES"


export default class Xor extends Node {

    constructor() {
        super(
            [
                {label: 'A', key: 'a', accept: [DATA_TYPES.ANY]},
                {label: 'B', key: 'b', accept: [DATA_TYPES.ANY]}
            ],
            [
                {label: 'Truthful', key: 't', type: DATA_TYPES.BOOL}
            ]
        );
        this.name = 'Xor'
        this.size = 2
    }

    get type (){
        return NODE_TYPES.FUNCTION
    }
    static compile(tick, {a, b}, entities, attributes, nodeID) {
        attributes[nodeID] = {}
        attributes[nodeID].t = (!a && b) || (a && !b)

        return attributes
    }
}