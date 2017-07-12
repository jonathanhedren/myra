import {
    ComponentVNode,
    ComponentFactory,
    VNode,
    Update,
    Updates,
    Effects,
    View
} from './contract'
import { equal } from './helpers'
import { render } from './renderer'

/** 
 * Defines a component from a ComponentSpec returning a factory that creates 
 * ComponentVNode/JSXElement's for the component.
 */
// export function define<TState, TProps>(initialState: TState, render: Render<TState, TProps>): ComponentFactory<TState, TProps>
// export function define<TState, TProps>(spec: ComponentSpec<TState, TProps>): ComponentFactory<TState, TProps>
// export function define<TState, TProps>(specFactory: () => ComponentSpec<TState, TProps>): ComponentFactory<TState, TProps>
// export function define<TState, TProps>(): ComponentFactory<TState, TProps> {
//     let spec: ComponentSpec<TState, TProps>
//     if (arguments.length === 1) {
//         if (typeof arguments[0] === 'function') {
//             spec = arguments[0]()
//         }
//         else {
//             spec = arguments[0]
//         }
//     }
//     else {
//         spec = {
//             init: arguments[0],
//             render: arguments[1]
//         }
//     }
//     return (props: TProps, childNodes: VNode[] = []): ComponentVNode<TState, TProps> => {
//         return {
//             _: 3,
//             spec: spec,
//             children: childNodes,
//             props: props,
//             state: spec.init,
//             dispatchLevel: 0
//         }
//     }
// }

function defineView<TState, TProps, TUpdates extends Updates<TState, TProps>, TEffects extends Effects<TState, TProps, TUpdates>>(
    state: TState,
    updates: TUpdates,
    effects: TEffects) {



    return (view: View<TState, TProps, TUpdates, TEffects>): ComponentFactory<TState, TProps, TUpdates> => {
        const factory: ComponentFactory<TState, TProps, TUpdates> = function (props: TProps, children: VNode[] = []) {
            const vNode: ComponentVNode<TState, TProps, TUpdates, TEffects> = {
                _: 3,
                effects,
                updates,
                children,
                props,
                state,
                view,
                dispatchLevel: 0
            }

            for (const key in updates) {
                const updateFn = updates[key]
                updates[key] = <any>((ev: Event) => dispatch(vNode, render, updateFn, ev))
            }

            for (const key in effects) {
                const effectFn = effects[key]
                updates[key] = <any>((ev: Event) => effectFn(vNode, ev).then(r => dispatch(vNode, render, _ => r)))
            }

            return vNode
        } as any
        factory.updates = updates
        factory.state = state
        return factory
    }
}

function defineEffects<TState, TProps, TUpdates extends Updates<TState, TProps>>(state: TState, actions: TUpdates) {
    return <T extends Effects<TState, TProps, TUpdates>>(effects: T) => {
        return {
            view: defineView(state, actions, effects)
        }
    }
}

function defineUpdates<TState, TProps>(state: TState) {
    return <TUpdates extends Updates<TState, TProps>>(updates: TUpdates) => {
        return {
            effects: defineEffects<TState, TProps, TUpdates>(state, updates),
            view: defineView(state, updates, {})
        }
    }
}

export function define<TState, TProps>(state: TState) {
    return {
        updates: defineUpdates<TState, TProps>(state),
        view: defineView(state, {}, {})
    }
}
/** 
 * Mounts the component onto the supplied element by calling the supplied 
 * component factory. 
 */
export function mount(componentFactory: ComponentFactory<any, any, any>, element: Element) {
    initComponent(componentFactory({}, []), element)
}

/** 
 * Initializes a component from a ComponentVNode.
 * 
 * Will create a ComponentContext for for the component instance and call 
 * dispatch with the intial value from the component spec. If spec.onMount is
 * set, it will also be applied.
 */
export function initComponent<TState, TProps>(vNode: ComponentVNode<TState, TProps, any, any>, parentElement: Element) {

    vNode.parentElement = parentElement

    mountComponent(vNode)

    return vNode.domRef!
}


/** 
 * Updates a component by comparing the new and old virtual nodes. 
 */
export function updateComponent<TState, TProps>(newVNode: ComponentVNode<TState, TProps, any, any>, oldVNode: ComponentVNode<TState, TProps, any, any>) {

    newVNode.parentElement = oldVNode.parentElement
    newVNode.rendition = oldVNode.rendition
    newVNode.state = oldVNode.state

    if (newVNode.props !== undefined && newVNode.props !== null && (newVNode.props as any).forceUpdate
        || !equal(oldVNode.props, newVNode.props)) {

        mountComponent(newVNode)
    }
}

function mountComponent<TState, TProps>(vNode: ComponentVNode<TState, TProps, any, any>) {

    let onMount: Update<TState, TProps> | undefined
    // if (vNode.events.onMount !== undefined) {
    //     const post: Post<TState> = (update: Update<TState>) => {
    //         dispatch(vNode, render, update)
    //     }
    //     onMount = (s: TState) => vNode.events.onMount!(s, vNode.props, post)
    // }

    // Dispatch to render the view. 
    dispatch(vNode, render, onMount)
}

/** 
 * Traverses the virtual node hierarchy and unmounts any components in the 
 * hierarchy.
 */
export function findAndUnmountComponentsRec(vNode: VNode) {
    if (vNode._ === 3) {
        let onUnmount: Update<any, any> | undefined
        // if (vNode.events.onUnmount !== undefined) {
        //     onUnmount = (s: any) => vNode.spec.onUnmount!(s, vNode.props)
        // }

        dispatch(vNode, render, onUnmount)

        findAndUnmountComponentsRec(vNode.rendition!)
    }
    else if (vNode._ === 2) {
        for (const c of vNode.children) {
            findAndUnmountComponentsRec(c)
        }
    }
}

function dispatch<TState extends {}, TProps extends {}>(
    vNode: ComponentVNode<TState, TProps, any, any>,
    render: (parentNode: Element, view: VNode, oldView: VNode | undefined, oldRootNode: Node | undefined) => void,
    update?: Update<TState, TProps>,
    arg?: any) {

    vNode.dispatchLevel++

    if (update !== undefined) {
        vNode.state = { ...<any>vNode.state, ...(update(vNode, arg) as object) }
    }

    // Update view if the component was already initialized and the 
    // dispatchLevel is at "lowest" level (i.e. 1).
    if (vNode.dispatchLevel === 1) {
        // const ctx = {
        //     props: vNode.props,
        //     state: vNode.state!,
        //     children: vNode.children,
        //     parentElement: vNode.parentElement,
        //     updates: vNode.updates,
        //     effects: vNode.effects
        // } as ViewContext<TState, any, any, any>

        const newView = vNode.view(vNode)

        const oldNode = vNode.rendition ? vNode.rendition.domRef : undefined
        render(vNode.parentElement!, newView, vNode.rendition, oldNode)

        vNode.rendition = newView

        if (newView.domRef !== undefined) {
            vNode.domRef = newView.domRef
        }
        else {
            vNode.domRef = undefined
        }
    }
    vNode.dispatchLevel--
}
