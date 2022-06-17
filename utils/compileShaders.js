import compiler from "./compiler/compiler"
import MaterialInstance from "../../../engine/instances/MaterialInstance"
import {trimString} from "../../../engine/instances/ShaderInstance"
import {v4} from "uuid"

export default async function compileShaders(hook,setStatus, mat, setMat ){
    alert.pushAlert("Compiling shaders", "info")
    hook.setImpactingChange(false)
    const {
        shader,
        vertexShader,
        uniformData,
        settings,
        info,
        cubeMapShader
    } = await compiler(hook.nodes, hook.links, document.fileSystem)

    if (shader) {
        const onOverride = mat
        let promise, newMat
        if (!onOverride)
            promise = new Promise(resolve => {
                newMat = new MaterialInstance(hook.renderer.gpu, vertexShader, shader, uniformData, settings, (shaderMessage) => resolve(shaderMessage), v4().toString(), cubeMapShader.code)
            })
        else {
            newMat = onOverride
            promise = new Promise(resolve => {
                newMat.shader = [shader, vertexShader, uniformData, (shaderMessage) => resolve(shaderMessage), settings]
                newMat.cubeMapShader = [cubeMapShader.code, vertexShader]
            })
        }
        const message = await promise
        const shaderSplit = trimString(shader).split(";")
        let parsed = []
        setStatus({
            ...{
                ...message,
                messages:
                    message.messages
                        .map(m => m.split("ERROR"))
                        .flat()
                        .map(m => {
                            const data = {lines: []}
                            if (m.length > 0) {
                                const match = m.match(/:\s([0-9]+):([0-9]+)/gm),
                                    matchS = m.match(/:\s([0-9]+):([0-9]+)/m)
                                if (matchS) {
                                    let s = matchS[0].split("")
                                    s.shift()
                                    const [, end] = s.join("").split(":")
                                    if (!parsed.includes(end)) {

                                        data.lines = shaderSplit.slice(end - 9, end - 8)
                                        parsed.push(end)
                                        data.error = "ERROR" + m
                                        data.label = "ERROR" + match[0]
                                        return data
                                    }
                                    return undefined
                                }
                            } else
                                return undefined
                        })
                        .filter(e => e)
            },
            info
        })
        setMat(newMat)

    }
}