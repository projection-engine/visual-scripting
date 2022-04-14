import Node from "../../../base/Node";
import {TYPES} from "../../../base/TYPES";
import NODE_TYPES from "../../../base/NODE_TYPES";


export default class Delay extends Node {

    constructor() {
        super(
            [
                {key: 'line', accept: [TYPES.EXECUTION]},
                {label: 'Delay', key: 'delay', accept: [TYPES.NUMBER]},
                {label: 'Reset', key: 'reset', accept: [TYPES.BOOL]},
            ],
            [
                {key: 'execute', type: TYPES.EXECUTION},
            ],
        );
        this.name = 'Delay'
    }

    get type() {
        return NODE_TYPES.BRANCH
    }

    static compile({inputs, state, setState, object}) {
        if (inputs.reset) {
            clearTimeout(state.timeout)
            setState(false, 'timeoutSet')
            setState(false, 'canContinue')
        }
        if (!state.canContinue && !state.timeoutSet) {
            setState(true, 'timeoutSet')
            setState(setTimeout(() => setState(true, 'canContinue'), [inputs.delay]), 'timeout')
        } else if (state.canContinue)
            return object.execute

        return []
    }
}