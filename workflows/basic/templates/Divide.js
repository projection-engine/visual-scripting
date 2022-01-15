import Function from "../../../templates/Function";


export default class Divide extends Function {
    response

    constructor(constA, constB) {
        super([
            {label: 'A', key: 'constA', accept: ['Constant', 'Multiply', 'Divide', 'Add', 'Subtract', 'Power']},
            {label: 'B', key: 'constB', accept: ['Constant', 'Multiply', 'Divide', 'Add', 'Subtract', 'Power']}
        ]);
        this.constA = constA
        this.constB = constB
        this.name = 'Divide'
    }

    execute() {
        this.response = this.constA / this.constB
    }
}