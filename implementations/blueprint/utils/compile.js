import cloneClass from "../../../../../services/utils/misc/cloneClass";
import EventTick from "../nodes/events/EventTick";
import {TYPES} from "../../../flow/TYPES";
import Getter from "../nodes/utils/Getter";
import Branch from "../nodes/operators/boolean/Branch";
import NODE_TYPES from "../../../flow/NODE_TYPES";
import EntityReference from "../nodes/events/EntityReference";
import KeyPress from "../nodes/events/KeyPress";


export default function compile(n, links, variables, alreadyCompiled = [], startPoint) {
    let order = [], executors = {}, nodes = alreadyCompiled.length > 0 ? n : n.map(node => cloneClass(node))


    const resolveDependencies = (currentNode) => {
        const linksToResolve = links.filter(l => l.target.id === currentNode.id)
        let applied = 0

        for (let i = 0; i < linksToResolve.length; i++) {
            const source = nodes.find(n => n.id === linksToResolve[i].source.id)

            if (!source.ready) {
                resolveDependencies(source)
                applied++
            }
        }

        if (applied > 0 || !currentNode.ready) {

            if (!currentNode.ready) {
                let inputs = []
                linksToResolve.forEach(l => {
                    if (l.source.attribute.type !== TYPES.EXECUTION)
                        inputs.push({
                            localKey: l.target.attribute.key,
                            sourceKey: l.source.attribute.key,
                            sourceID: l.source.id
                        })
                })

                if (currentNode instanceof Getter)
                    executors[currentNode.id.split('/')[0]] = {
                        value: variables.find(v => v.id === currentNode.id.split('/')[0])?.value
                    }
                if (currentNode instanceof EntityReference)
                    executors[currentNode.id] = {
                        value: currentNode.id.split('/')[0]
                    }
                const bundledKeys = currentNode.inputs.filter(i => i.bundled)
                bundledKeys
                    .forEach(bk => {
                        const old = executors[currentNode.id]
                        if (old)
                            executors[currentNode.id] = {...old, [bk.key]: currentNode[bk.key]}
                        else
                            executors[currentNode.id] = {[bk.key]: currentNode[bk.key]}
                    })

                order.push({
                    nodeID: currentNode.id,
                    inputs,
                    classExecutor: currentNode.constructor.name,
                    isBranch: currentNode.type === NODE_TYPES.BRANCH || currentNode instanceof KeyPress
                })
            }
            currentNode.ready = true
        }
    }
    let compiled = [...alreadyCompiled], organizedLinks = []
    const getForward = (l) => {
        organizedLinks.push(l)
        const forward = links.filter(ll => {
            return l.target.id === ll.source.id && ll.source.attribute.type === TYPES.EXECUTION
        })

        forward.forEach(ff => {
            getForward(ff)
        })
    }
    getForward(startPoint)
    for (let exec = 0; exec < organizedLinks.length; exec++) {
        const t = organizedLinks[exec].target
        const targetNode = nodes.find(n => n.id === t.id)

        if (!alreadyCompiled.includes(t.id)) {
            const forwardLinks = links.filter(l => l.source.id === targetNode.id)
            if (!(targetNode instanceof Branch || targetNode instanceof KeyPress)) {
                resolveDependencies(targetNode)
                compiled.push(t.id)
            } else {
                let branchA, branchB
                for (let liExec = 0; liExec < forwardLinks.length; liExec++) {
                    if (forwardLinks[liExec].source.attribute.type === TYPES.EXECUTION) {
                        if (!branchA)
                            branchA = forwardLinks[liExec]
                        else
                            branchB = forwardLinks[liExec]
                    }
                }
                compiled.push(t.id)
                resolveDependencies(targetNode)

                const orderIndex = order.findIndex(oo => oo.nodeID === targetNode.id)


                if (orderIndex > -1) {


                    if (branchA) {
                        const bA = compile(nodes, links, variables, branchB ? [...compiled, branchB.target.id] : compiled, branchA)
                        order[orderIndex].branchA = bA.order

                        executors = {...executors, ...bA.executors}
                    }
                    if (branchB) {
                        const bB = compile(nodes, links, variables, branchA ? [...compiled, branchA.target.id] : compiled, branchB)

                        order[orderIndex].branchB = bB.order
                        executors = {...executors, ...bB.executors}
                    }
                }

                break
            }
        }
    }


    return {
        executors,
        order
    }
}