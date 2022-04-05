import {useContext, useEffect, useMemo, useRef, useState} from "react";
import getBezierCurve from "../utils/bezierCurve";
import {TYPES} from "../TYPES";
import TYPES_INFO from "../TYPES_INFO";
import {AlertProvider} from "@f-ui/core";


export default function useBoard(hook, scale, setScale) {
    const ref = useRef()
    const alert = useContext(AlertProvider)
    const handleWheel = (e) => {
        e.preventDefault()

        if (e.wheelDelta > 0 && scale < 3)
            setScale(scale + scale * .1)
        else if (e.wheelDelta < 0 && scale >= .5)
            setScale(scale - scale * .1)

    }
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        let resize
        if (!scrolled && hook.nodes.length > 0) {
            resize = new ResizeObserver(() => {
                let biggestX, biggestY
                hook.nodes.forEach(n => {
                    const cX = n.x
                    const cY = n.y

                    if (!biggestX || cX > biggestX)
                        biggestX = cX
                    if (!biggestY || cY > biggestY)
                        biggestY = cY
                })


                if (biggestX)
                    ref.current.parentNode.scrollLeft = biggestX - ref.current.parentNode.offsetWidth / 2

                if (biggestY)
                    ref.current.parentNode.scrollTop = biggestY - ref.current.parentNode.offsetHeight / 2


                setScrolled(true)
            })

            resize.observe(ref.current.parentNode)
        }
        return () => {
            if (resize)
                resize.disconnect()
        }
    }, [scrolled, hook.nodes])
    useEffect(() => {
        ref.current?.parentNode.addEventListener('wheel', handleWheel, {passive: false})
        return () => {
            ref.current?.parentNode.removeEventListener('wheel', handleWheel, {passive: false})
        }
    }, [scale])


    const handleLink = (src, target, isExecution) => {
        hook.setLinks(prev => {
            let c = [...prev]
            const existing = c.filter(c => (c.target.id === target.id && c.target.attribute.key === target.attribute.key) || (isExecution && c.source.id === src.id && c.source.attribute.key === src.attribute.key))
            c = c.filter(cc => {
                return !existing.find(e => e === cc)
            })
            if (!target.attribute.componentRequired || src.attribute.components.includes(target.attribute.componentRequired))
                c.push({
                    source: src,
                    target: target
                })
            else
                alert.pushAlert('Missing component on entity', 'error')
            return c
        })
    }
    const links = useMemo(() => {
        return hook.links.map(l => {
            let key = (Object.entries(TYPES).find(([_, value]) => value === l.source.attribute.type))
            if (key)
                key = key[0]

            return {
                target: l.target.id + l.target.attribute.key,
                source: l.source.id + l.source.attribute.key,
                targetKey: l.target.attribute.key,
                sourceKey: l.source.attribute.key,
                color: TYPES_INFO[key]
            }
        })
    }, [hook.links])

    let currentFrame = 0

    const updateLinks = () => {
        try {
            let parentBBox = ref.current?.getBoundingClientRect()
            const bounding = {
                x: ref.current?.scrollLeft - parentBBox.left,
                y: ref.current?.scrollTop - parentBBox.top
            }

            links.forEach(l => {
                const target = document.getElementById(l.target)?.getBoundingClientRect()
                const source = document.getElementById(l.source)?.getBoundingClientRect()
                const linkPath = document.getElementById(l.target + '-' + l.source)
                const supplementary = linkPath.nextSibling
                if (target && source && linkPath) {
                    const curve = getBezierCurve(
                        {
                            x: (source.x + bounding.x + 7.5) / scale,
                            y: (source.y + bounding.y + 7.5) / scale
                        },
                        {
                            x1: (target.x + bounding.x + 7.5) / scale,
                            y1: (target.y + bounding.y + 7.5) / scale
                        })
                    supplementary.setAttribute('d', curve)
                    linkPath.setAttribute('d', curve)
                }
            })
        } catch (error) {
        }
        currentFrame = requestAnimationFrame(updateLinks)
    }

    useEffect(() => {
        currentFrame = requestAnimationFrame(updateLinks)
        return () => {
            cancelAnimationFrame(currentFrame)
        }
    }, [links, scale])
    return {

        links,
        ref,
        handleLink
    }
}