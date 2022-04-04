import Node from "../../../../flow/Node";
import COMPONENTS from "../../../../../../services/engine/templates/COMPONENTS";
import {quat} from "gl-matrix";
import NODE_TYPES from "../../../../flow/NODE_TYPES";
import {TYPES} from "../../../../flow/TYPES";

export default class SetWorldRotation extends Node {

    constructor() {
        super([
            {label: 'Start', key: 'start', accept: [TYPES.EXECUTION]},
            {label: 'Entity', key: 'entity', accept: [TYPES.ENTITY]},
            {label: 'Rotation Quat', key: 'quat', accept: [TYPES.VEC4]},
            {label: 'Rotation Euler', key: 'euler', accept: [TYPES.VEC3]},

        ], [
            {label: 'Execute', key: 'EXECUTION', type: TYPES.EXECUTION}]);
        this.name = 'SetWorldRotation'
    }

    get type() {
        return NODE_TYPES.VOID_FUNCTION
    }
    static  compile(tick, {quat, euler, entity}, entities, attributes, nodeID) {
        if (quat)
            entity.components[COMPONENTS.TRANSFORM].rotationQuat = quat
        else if (euler) {
            const quatA = [0, 0, 0, 1]

            quat.rotateX(quatA, quatA, euler[0])
            quat.rotateY(quatA, quatA, euler[1])
            quat.rotateZ(quatA, quatA, euler[2])

            entity.components[COMPONENTS.TRANSFORM].rotationQuat = quat.multiply([], quatA, entity.components[COMPONENTS.TRANSFORM].rotationQuat)
        }
        return attributes
    }
}