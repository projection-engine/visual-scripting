import Node from '../../base/Node'
import {TYPES} from "../../base/TYPES";
import NODE_TYPES from "../../base/NODE_TYPES";

export default class Numeric extends Node {
    constructor(value = 0.0) {
        super([{label: 'Value', key: 'value', type: TYPES.NUMBER}], [{label: 'Value', key: 'value', type: TYPES.NUMBER}]);
        this.value = value
        this.name = 'Number'
    }
    get type (){
        return NODE_TYPES.DATA
    }
    compile( ) {
        if(this.ready)
            return new Promise(r => r())
        return new Promise(resolve => {
            this.ready = true
            resolve()
        })
    }
}