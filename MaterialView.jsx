import Board from "./components/Board";
import usePrototype from "./hooks/usePrototype";
import NodeEditor from "./components/NodeEditor";
import Available from "./components/Available";
import styles from './styles/Board.module.css'

import {useContext, useEffect, useMemo, useRef} from "react";
import PropTypes from "prop-types";


import ControlProvider from "../../components/tabs/components/ControlProvider";
import ResizableBar from "../../components/resizable/ResizableBar";
import MaterialClass from './workflows/material/Material'
import EVENTS from "../../pages/project/utils/misc/EVENTS";
import compile from "./utils/compile";
import ImageProcessor from "../../services/workers/ImageProcessor";
import applyViewport from "./utils/applyViewport";


export default function MaterialView(props) {
    const hook = usePrototype(props.file)
    const ref = useRef()
    const fallbackSelected = useMemo(() => {
        return hook.nodes.find(n => n.constructor.name === MaterialClass.constructor.name)
    }, [hook.nodes])

    const controlProvider = useContext(ControlProvider)

    const mapNodes = (res) => {
        const parsedNodes = hook.nodes.map(n => {
            const docNode = document.getElementById(n.id).parentNode
            const transformation = docNode
                .getAttribute('transform')
                .replace('translate(', '')
                .replace(')', '')
                .split(' ')

            return {
                ...n,
                x: parseFloat(transformation[0]),
                y: parseFloat(transformation[1]),
                instance: n.constructor.name
            }
        })

        return JSON.stringify({
            nodes: parsedNodes,
            links: hook.links,
            response: res
        })
    }
    useEffect(() => {
            controlProvider.setTabAttributes(
                [
                    {
                        label: 'Save',
                        disabled: hook.disabled,
                        icon: <span className={'material-icons-round'} style={{fontSize: '1.2rem'}}>save</span>,
                        onClick: () => {
                            hook.load.pushEvent(EVENTS.LOADING_MATERIAL)
                            compile(hook.load, hook.nodes, hook.links, hook.quickAccess.fileSystem)
                                .then(res => {
                                    applyViewport(res, hook.engine, hook.load)
                                    props.submitPackage(
                                        res.albedo ? res.albedo : ImageProcessor.colorToImage('rgb(128, 128, 128)'),
                                        mapNodes(res),
                                        false
                                    )
                                })
                        }
                    },
                    {
                        label: 'Save & close',
                        disabled: hook.disabled,
                        icon: <span className={'material-icons-round'} style={{fontSize: '1.2rem'}}>save_alt</span>,
                        onClick: () => {
                            hook.load.pushEvent(EVENTS.LOADING_MATERIAL)
                            compile(hook.load, hook.nodes, hook.links, hook.quickAccess.fileSystem)
                                .then(res => {
                                    props.submitPackage(
                                        res.albedo ? res.albedo : ImageProcessor.colorToImage('rgb(128, 128, 128)'),
                                        mapNodes(res),
                                        true
                                    )
                                })
                        }
                    },
                    {
                        label: 'Apply',
                        group: 'b',
                        disabled: hook.disabled,
                        icon: <span className={'material-icons-round'} style={{fontSize: '1.2rem'}}>check</span>,
                        onClick: () => {
                            hook.load.pushEvent(EVENTS.LOADING_MATERIAL)
                            compile(hook.load, hook.nodes, hook.links, hook.quickAccess.fileSystem)
                                .then(res => {
                                    applyViewport(res, hook.engine, hook.load)
                                })

                        }
                    }
                ],
                props.file.name,
                <span
                    style={{fontSize: '1.2rem'}}
                    className={`material-icons-round`}>texture</span>,
                (newTab) => {
                    if (newTab === props.index)
                        hook.engine.setCanRender(true)
                    else
                        hook.engine.setCanRender(false)
                },
                true,
                props.index
            )

    }, [hook.nodes, hook.links, hook.engine.gpu, hook.engine.gpu])


    return (
        <div className={styles.prototypeWrapper} ref={ref}>
            <NodeEditor hook={hook}
                        engine={hook.engine}
                        selected={!hook.selected && fallbackSelected ? fallbackSelected.id : hook.selected}/>
            <ResizableBar type={"width"}/>
            <div className={styles.prototypeWrapperBoard}>
                <Board
                    setAlert={props.setAlert}
                    parentRef={ref}
                    hook={hook}
                    selected={hook.selected}
                    setSelected={hook.setSelected}/>
            </div>
            <Available/>
        </div>
    )
}

MaterialView.propTypes = {
    index: PropTypes.number.isRequired,
    setAlert: PropTypes.func.isRequired,
    file: PropTypes.shape({
        fileID: PropTypes.string,
        name: PropTypes.string,
        blob: PropTypes.any,
        type: PropTypes.string,
    }),
    submitPackage: PropTypes.func.isRequired,

}