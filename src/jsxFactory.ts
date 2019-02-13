import { ComponentFactory, VNode, TextVNode, ComponentVNode, DefaultContext, ComponentProps } from './contract'
import { VNODE_NOTHING, VNODE_TEXT, VNODE_ELEMENT, VNODE_COMPONENT } from './constants'

function flattenChildren(children: ((VNode | string)[] | VNode | string)[]) {
    const flattenedChildren = [] as (VNode | string)[]

    for (const child of children) {
        if (child === null || child === undefined || typeof child === 'boolean') {
            flattenedChildren.push({ _: VNODE_NOTHING })
        }
        else if (Array.isArray(child)) {
            for (const c of flattenChildren(child)) {
                flattenedChildren.push(c)
            }
        }
        else if ((child as VNode)._ === undefined) {
            // Any node which is not a vNode will be converted to a TextVNode
            flattenedChildren.push({
                _: VNODE_TEXT,
                value: child as any as string
            } as TextVNode)
        }
        else {
            flattenedChildren.push(child)
        }
    }

    return flattenedChildren as VNode[]
}

/**
 * Creates a JSX.Element/VNode from a JSX tag.
 */
export function h<TProps>(
    tagNameOrComponent: string | ComponentFactory<object, DefaultContext<object>> | undefined | null,
    props: TProps,
    ...children: (string | VNode)[]): JSX.Element {

    if (tagNameOrComponent === 'nothing' ||
        tagNameOrComponent === undefined ||
        tagNameOrComponent === null ||
        typeof tagNameOrComponent === 'boolean') {

        return { _: VNODE_NOTHING }
    }

    if (props === null) {
        props = {} as TProps
    }

    (props as any as ComponentProps).children = flattenChildren(children)

    if (typeof tagNameOrComponent === 'string') {

        return {
            _: VNODE_ELEMENT,
            tagName: tagNameOrComponent,
            props: props as any as ComponentProps
        }
    }
    const vNode = {
        _: VNODE_COMPONENT,
        props,
        dispatchLevel: 0,
        view: tagNameOrComponent
    } as any as ComponentVNode<ComponentProps>

    vNode.link = {
        vNode
    }
    return vNode
}
