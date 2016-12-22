import { ComponentFactory, ComponentDescriptor, ComponentSpec, ComponentContext, Update, NodeDescriptor } from './contract'
import { equal } from './helpers'
import { dispatch } from './dispatch'
import { render } from './view'
import { subscriptions } from './subscriptions'

type Subscribe = <TState, TArg>(msg: string, update: Update<TState, TArg>, context: ComponentContext<TState, any>) => void
const subscribe: Subscribe = <TState, TArg>(msg: string, update: Update<TState, TArg>, context: ComponentContext<TState, any>) => {
    if (!subscriptions[msg]) {
        subscriptions[msg] = []
    }
    subscriptions[msg].push([update, context])
}

/** Holds all component specs. The component name is used as key. */
const componentSpecs = {} as { [name: string]: ComponentSpec<any, any> }

/** Holds all component  */
const contexts: { [key: number]: ComponentContext<any, any> } = {}
let nextId = 1

/** Internal class that holds component state. */
class ComponentContextImpl<TState, TProps> implements ComponentContext<TState, TProps> {
    constructor(readonly parentNode: Element,
        readonly spec: ComponentSpec<TState, any>,
        public childNodes?: NodeDescriptor[]) {
    }

    private _mounted = false
    get mounted() {
        return this._mounted
    }
    set mounted(_) {
        if (!this._mounted) {
            this._mounted = true
        }
    }

    dispatchLevel = 0
    isUpdating = false
    props: TProps | undefined
    state: TState | undefined
    rendition: NodeDescriptor | undefined
    rootNode: Node
}

/** 
 * Initializes a component from a descriptor.
 * 
 * Will create a ComponentContext for for the component instance and call 
 * dispatch with the intial value from the component spec. If spec.onMount is
 * set, it will also be applied.
 */
export function initComponent<T>(descriptor: ComponentDescriptor<T>, parentNode: Element) {

    const spec = componentSpecs[descriptor.name]
    const context = new ComponentContextImpl<any, any>(
        parentNode,
        spec,
        descriptor.children
    )

    context.props = descriptor.props

    descriptor.id = nextId++
    contexts[descriptor.id] = context

    if (typeof spec.subscriptions !== 'undefined') {
        for (const k in spec.subscriptions) {
            subscribe(k, spec.subscriptions[k], context)
        }
    }

    // Dispatch once with init. The view won't be rendered.
    dispatch(context, render, () => spec.init, undefined)

    context.mounted = true

    // Dispatch again to render the view. 
    dispatch(
        context,
        render,
        typeof spec.onMount !== 'undefined' ? spec.onMount : (<S>(m: S) => ({ state: m })),
        descriptor.props
    )

    if (context.rendition) {
        descriptor.node = context.rendition.node
        descriptor.rendition = context.rendition
    }
    else {
        descriptor.node = undefined
    }
}

/** Updates a component by comparing the new and old descriptors. */
export function updateComponent<T>(newDescriptor: ComponentDescriptor<T>,
    oldDescriptor: ComponentDescriptor<T>) {

    newDescriptor.id = oldDescriptor.id

    const context = contexts[oldDescriptor.id]
    context.props = newDescriptor.props

    // The node might have changed if the descriptor was "keyed"
    context.rendition!.node = oldDescriptor.node

    if (typeof newDescriptor.props !== 'undefined' && newDescriptor.props !== null && (newDescriptor.props as any).forceUpdate
        || !equal(oldDescriptor.props, newDescriptor.props)) {

        context.childNodes = newDescriptor.children

        if (!context.isUpdating) {
            dispatch(
                context,
                render,
                typeof context.spec.onMount !== 'undefined' ?
                    context.spec.onMount :
                    (<TState>(s: TState) => ({ state: s })),
                newDescriptor.props)
        }

        newDescriptor.node = context.rendition!.node
        newDescriptor.rendition = context.rendition
    }
}

/** 
 * Defines a component from a ComponentSpec. 
 * 
 * @param ComponentSpec<TState, TProps> spec - the component specification 
 * 
 * @returns a factory that creates ComponentDescriptor's of the component  
 */
export function defineComponent<TState, TProps>(spec: ComponentSpec<TState, TProps>): ComponentFactory<TProps> {
    if (componentSpecs[spec.name]) {
        throw `A component with name '${spec.name}' is already defined!`
    }

    componentSpecs[spec.name] = spec

    return (props: TProps, childNodes: NodeDescriptor[] = []) => {
        return {
            __type: 3,
            name: spec.name,
            id: 0,
            children: childNodes,
            rendition: undefined,
            props: props,
            node: undefined
        }
    }
}

/** 
 * Mounts the component onto the supplied element by calling the supplied 
 * component factory. 
 */
export function mountComponent(componentFactory: ComponentFactory<any>, element: Element) {
    initComponent(componentFactory({}), element)
}

/** Unmounts the component, calling onUnmount if defined */
export function unmountComponent(componentId: number) {
    unmountComponentRec(contexts[componentId])
    delete contexts[componentId]
}

/** Recursively unmounts any components in the hierarchy */
function unmountComponentRec(ctx: ComponentContext<any, any>) {
    if (typeof ctx.spec.onUnmount === 'function') {
        dispatch(ctx, render, ctx.spec.onUnmount, undefined)
    }
    for (const id of findChildComponentsRec(ctx.rendition!)) {
        unmountComponent(id)
    }
}

/** 
 * Traverses the descriptor hierarchy and returns the ids of every component
 * that is a "direct" child of the component.
 */
function findChildComponentsRec(descriptor: NodeDescriptor) {
    const ids: number[] = []
    if (descriptor.__type === 3) {
        ids.push(descriptor.id)
    }
    else if (descriptor.__type === 2) {
        for (const c of descriptor.children) {
            for (const id of findChildComponentsRec(c)) {
                ids.push(id)
            }
        }
    }
    return ids
}