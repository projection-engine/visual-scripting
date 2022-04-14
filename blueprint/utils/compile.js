import cloneClass from "../../../../services/utils/misc/cloneClass";
import {TYPES} from "../../base/TYPES";
import Getter from "../nodes/utils/Getter";
import NODE_TYPES from "../../base/NODE_TYPES";
import EntityReference from "../nodes/events/EntityReference";


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
                    type: currentNode.type,
                    inputs,
                    classExecutor: currentNode.constructor.name,
                    isBranch: currentNode.type === NODE_TYPES.BRANCH || currentNode.type === NODE_TYPES.START_POINT
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
            if ( targetNode.type !== NODE_TYPES.BRANCH ) {
                resolveDependencies(targetNode)
                compiled.push(t.id)
            } else {
                let branches = []
                for (let liExec = 0; liExec < forwardLinks.length; liExec++) {
                    if (forwardLinks[liExec].source.attribute.type === TYPES.EXECUTION)
                        branches.push(forwardLinks[liExec])

                }
                compiled.push(t.id)
                resolveDependencies(targetNode)
                const orderIndex = order.findIndex(oo => oo.nodeID === targetNode.id)
                if (orderIndex > -1) {
                    branches.forEach((b, i) => {
                        const bA = compile(nodes, links, variables, compiled, b)

                        order[orderIndex][b.source.attribute.key] = bA.order

                        executors = {...executors, ...bA.executors}
                    })
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