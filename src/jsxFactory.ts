import { ComponentFactory, VNode, TextVNode } from './contract'

function flattenChildren(children: ((VNode | string)[] | VNode | string)[]) {
    const flattenedChildren = [] as (VNode | string)[]

    for (const child of children) {
        if (child === null || child === undefined) {
            flattenedChildren.push({ _: 0 })
        }
        else if (Array.isArray(child)) {
            for (const c of flattenChildren(child)) {
                flattenedChildren.push(c)
            }
        }
        else if (typeof child === 'string') {
            flattenedChildren.push({
                _: 1,
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
export function createElement<TState, TProps>(
    tagNameOrComponent: string | ComponentFactory<TState, TProps>,
    props: TProps,
    ...children: (string | VNode)[]): JSX.Element {

    if (tagNameOrComponent === 'nothing') {
        return { _: 0 }
    }

    if (props === null) {
        props = {} as TProps
    }

    if (typeof tagNameOrComponent === 'string') {

        return {
            _: 2,
            tagName: tagNameOrComponent,
            props: props,
            children: flattenChildren(children)
        }
    }

    return tagNameOrComponent(props, children as VNode[])
}
