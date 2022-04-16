 import Node from '../../base/Node'
 import {DATA_TYPES} from "../../base/DATA_TYPES";
 import NODE_TYPES from "../../base/NODE_TYPES";


export default class Sin extends Node {
    constructor() {
        super([
            {label: 'A', key: 'a', accept: [DATA_TYPES.FLOAT]}
        ], [
            {label: 'Result', key: 'sineRes', type: DATA_TYPES.FLOAT}
        ]);
        this.equalTypeInputs = true
        this.name = 'Sine'
        this.size = 2
    }

    get type() {
        return NODE_TYPES.FUNCTION
    }


     getFunctionInstance() {
        return ''
    }

    async  getInputInstance(index) {
        return ''
    }

    getFunctionCall({a}, index) {
        this.sineRes = 'sineRes' + index

        if(a)
            return `float ${this.sineRes} = sin(${a.name});`
        else
            return `float ${this.sineRes} = 0.;`
    }

}