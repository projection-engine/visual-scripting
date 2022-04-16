import Node from '../../base/Node'
import {DATA_TYPES} from "../../base/DATA_TYPES";
import NODE_TYPES from "../../base/NODE_TYPES";
import ImageProcessor from "../../../../services/workers/image/ImageProcessor";
import MATERIAL_TYPES from "../../../../services/engine/templates/MATERIAL_TYPES";


export const TEXTURE_TYPES = {
    RGB: 'RGB',
    RGBA: 'RGBA',
    SRGB8_ALPHA8: 'SRGB8_ALPHA8'
}
export default class TextureSample extends Node {
    texture = {}
    yFlip = false

    format = {
        format: TEXTURE_TYPES.RGB,
        internalFormat: TEXTURE_TYPES.RGB
    }


    constructor() {
        super([
            {
                label: 'Texture format',
                key: 'format',
                type: DATA_TYPES.OPTIONS,
                options: [
                    {
                        label: 'RGB', data: {
                            format: TEXTURE_TYPES.RGB,
                            internalFormat: TEXTURE_TYPES.RGB
                        }
                    },
                    {
                        label: 'RGBA', data: {
                            format: TEXTURE_TYPES.RGBA,
                            internalFormat: TEXTURE_TYPES.RGBA
                        }
                    },
                    {
                        label: 'sRGBA', data: {
                            format: TEXTURE_TYPES.RGBA,
                            internalFormat: TEXTURE_TYPES.SRGB8_ALPHA8
                        }
                    }
                ]
            },

            {
                label: 'Flip Y',
                key: 'yFlip',
                type: DATA_TYPES.OPTIONS,
                options: [
                    {
                        label: 'Yes', data: true
                    },
                    {
                        label: 'No', data: false
                    },
                ]
            },

            {label: 'Texture', key: 'texture', type: DATA_TYPES.TEXTURE},
            {label: 'UV', key: 'uv', accept: [DATA_TYPES.VEC2]},
        ], [
            {label: 'RGBA', key: 'rgba', type: DATA_TYPES.VEC4},
            {label: 'RGB', key: 'rgb', type: DATA_TYPES.VEC3},
            {label: 'R', key: 'r', type: DATA_TYPES.FLOAT, color: 'red'},
            {label: 'G', key: 'g', type: DATA_TYPES.FLOAT, color: 'green'},
            {label: 'B', key: 'b', type: DATA_TYPES.FLOAT, color: 'blue'},
            {label: 'Alpha', key: 'a', type: DATA_TYPES.FLOAT, color: 'white'}
        ]);

        this.name = 'TextureSample'
    }

    get type() {
        return NODE_TYPES.FUNCTION
    }

    getFunctionInstance() {
        return ''
    }

    async getInputInstance(index, uniforms, uniformData, fileSystem) {
        this.uniformName = `sampler${index}`
        if (this.texture.registryID) {
            try {
                const res = await fileSystem.readRegistryFile(this.texture?.registryID)
                if (res) {
                    const file = await fileSystem.readFile(fileSystem.path + '\\assets\\' + res.path, true)
                    uniformData.push({
                        key: this.uniformName,
                        data: file,
                        type: DATA_TYPES.TEXTURE,
                        format: this.format
                    })
                } else
                    uniformData.push({
                        key: this.uniformName,
                        data: await ImageProcessor.colorToImage('rgba(255, 128, 128, 1)', 32),
                        type: DATA_TYPES.TEXTURE,
                        format: this.format
                    })
            } catch (error) {
                console.trace(error)
            }
        } else
            uniformData.push({
                key: this.uniformName,
                data: await ImageProcessor.colorToImage('rgba(255, 128, 128, 1)', 32),
                type: DATA_TYPES.TEXTURE,
                format: this.format
            })
        return `uniform sampler2D sampler${index};`
    }

    // texture and uv = {name: variable name, value: variable value if static}
    getFunctionCall({uv}, index, outputs, body) {
        let response = []
        outputs.forEach(o => {
            this[o] = o + `${index}`

            const outputKey = this.output.find(oo => oo.key === o)
            const hasSampledRGBA = body.find(b => {
                return b.includes('rgba' + index)
            })
            console.log(o, outputs, outputKey)
            if (!hasSampledRGBA)
                response.push(`${outputKey.type} ${this[o]} = texture(${this.uniformName}, ${uv !== undefined ? uv.name : 'texCoord'}).${o};`)
            else
                response.push(`${outputKey.type} ${this[o]} = rgba${index}.${o};`)
        })

        return response.join('\n')
    }
}