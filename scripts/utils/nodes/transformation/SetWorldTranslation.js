import Node from "../../../../components/templates/Node"
import COMPONENTS from "../../../../../../engine/templates/COMPONENTS"
import {DATA_TYPES} from "../../../../../../engine/templates/DATA_TYPES"
import NODE_TYPES from "../../../../components/templates/NODE_TYPES"

export default class SetWorldTranslation extends Node {

    constructor() {
        super([

            {label: 'Start', key: 'start', accept: [DATA_TYPES.EXECUTION]},
            {label: 'Entity', key: 'entity', accept: [DATA_TYPES.ENTITY], componentRequired: COMPONENTS.TRANSFORM},
            {label: 'X', key: 'x', accept: [DATA_TYPES.NUMBER]},
            {label: 'Y', key: 'y', accept: [DATA_TYPES.NUMBER]},
            {label: 'Z', key: 'z', accept: [DATA_TYPES.NUMBER]},

        ], [
            {label: 'Execute', key: 'EXECUTION', type: DATA_TYPES.EXECUTION}
        ]);
        this.name = 'SetWorldTranslation'
    }

    get type() {
        return NODE_TYPES.VOID_FUNCTION
    }




    getFunctionInstance() {
        return ''
    }

    async getInputInstance(index) {
        return ''
    }

    getFunctionCall({x, y, z, entity}) {
        if (x && y && z && entity)
            return `
               ${entity.name}.components[params.COMPONENTS.TRANSFORM].translation = [${x.name}, ${y.name}, ${z.name}]
            `
        return ''
    }
}