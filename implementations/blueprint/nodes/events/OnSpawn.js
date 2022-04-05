import Node from "../../../../flow/Node";
import {TYPES} from "../../../../flow/TYPES";
import NODE_TYPES from "../../../../flow/NODE_TYPES";
import {KEYS} from "../../../../../../services/hooks/useHotKeys";


export default class OnSpawn extends Node {

    constructor() {
        super(
            [],
            [
                {key: 'execute', type: TYPES.EXECUTION}
            ]);
        this.size = 1
        this.name = 'OnSpawn'
    }

    get type() {
        return NODE_TYPES.START_POINT
    }

    static compile(_, obj, nodeID, executors, keys, state = {}, setState) {
        if (!state.wasExecuted) {
            setState(true, 'wasExecuted')
            return obj.branch0
        }
        return []
    }
}