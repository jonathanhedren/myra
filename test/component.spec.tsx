import { render, useErrorHandler, useMemo, useRef, useState } from '../src/component'
import { Ref, ComponentVNode, ComponentProps } from '../src/contract'
import * as myra from '../src/myra'

const q = (x: string) => document.querySelector(x)

/**
 * mount
 */
describe('mount', () => {

    it('mounts the component', done => {

        const Component = () => <div id="root" />

        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            const rootNode = q('#root')

            expect(rootNode).not.toBeNull()

            done()
        })
    })

    it('mounts any JSX element', done => {

        myra.mount(<div id="root" />, document.body)

        requestAnimationFrame(() => {
            const rootNode = q('#root')

            expect(rootNode).not.toBeNull()

            done()
        })
    })
})

// describe('useLifecycle', () => {

//     it('calls the didMount listener', done => {
//         const mock = {
//             callback: () => { }
//         }

//         spyOn(mock, 'callback').and.callThrough()

//         const Component = () => {
//             useLifecycle(ev => ev.phase === LifecyclePhase.AfterMount && mock.callback())
//             return <div />
//         }

//         render(document.body, <Component />, undefined, undefined)

//         setTimeout(() => {
//             expect(mock.callback).toHaveBeenCalled()

//             done()
//         }, 0)
//     })

//     it('calls the beforeRender listener', done => {
//         const mock = {
//             callback: () => { }
//         }

//         spyOn(mock, 'callback').and.callThrough()

//         const Component = () => {
//             useLifecycle(ev => ev.phase === LifecyclePhase.BeforeRender && mock.callback())
//             return <div />
//         }

//         render(document.body, <Component />, undefined, undefined)

//         expect(mock.callback).toHaveBeenCalled()

//         done()
//     })

//     it('calls the didRender listener', done => {
//         const mock = {
//             callback: () => { }
//         }

//         spyOn(mock, 'callback').and.callThrough()

//         const Component = () => {
//             useLifecycle(ev => ev.phase === LifecyclePhase.AfterRender && mock.callback())
//             return <div />
//         }

//         render(document.body, <Component />, undefined, undefined)

//         setTimeout(() => {
//             expect(mock.callback).toHaveBeenCalled()

//             done()
//         }, 0)
//     })

//     it('calls the preUnmount listener', () => {
//         const mock = {
//             unmount: () => { }
//         }

//         spyOn(mock, 'unmount').and.callThrough()

//         const Component = () => {
//             useLifecycle(ev => ev.phase === LifecyclePhase.BeforeUnmount && mock.unmount())
//             return <div />
//         }

//         const instance = <Component />

//         const domNode = render(document.body, instance, undefined, undefined)
//         render(document.body, <div></div>, instance, domNode)

//         expect(mock.unmount).toHaveBeenCalledTimes(1)
//     })

//     it('calls the preUnmount listener on child components', () => {
//         const mock = {
//             unmount: () => { }
//         }

//         spyOn(mock, 'unmount').and.callThrough()

//         const ChildChildComponent = () => {
//             useLifecycle(ev => ev.phase === LifecyclePhase.BeforeUnmount && mock.unmount())
//             return <div />
//         }

//         const ChildComponent = () => {
//             useLifecycle(ev => ev.phase === LifecyclePhase.BeforeUnmount && mock.unmount())
//             return <ChildChildComponent />
//         }

//         const component = () => <div><ChildComponent /></div>

//         const instance = component()
//         const domNode = render(document.body, instance, undefined, undefined)
//         render(document.body, <div></div>, instance, domNode)

//         expect(mock.unmount).toHaveBeenCalledTimes(2)
//     })

//     it('calls the preUnmount listener on child components of a component', () => {
//         const mock = {
//             unmount: () => { }
//         }

//         spyOn(mock, 'unmount').and.callThrough()

//         const ChildChildComponent = () => {
//             useLifecycle(ev => ev.phase === LifecyclePhase.BeforeUnmount && mock.unmount())
//             return <div />
//         }

//         const ChildComponent = () => {
//             useLifecycle(ev => ev.phase === LifecyclePhase.BeforeUnmount && mock.unmount())
//             return <ChildChildComponent />
//         }

//         const StateLessComponent = () => <ChildComponent />

//         const component = () => <div><StateLessComponent /></div>

//         const instance = component()
//         const domNode = render(document.body, instance, undefined, undefined)
//         render(document.body, <div></div>, instance, domNode)

//         expect(mock.unmount).toHaveBeenCalledTimes(2)
//     })

//     it('calls a function that captures a new variable', done => {
//         const mock = {
//             callback: () => { }
//         }

//         spyOn(mock, 'callback').and.callThrough()

//         type Props = {
//             test: boolean
//         }

//         const Component = ({ test }: Props) => {
//             useLifecycle(ev => ev.phase === LifecyclePhase.BeforeRender && test && mock.callback())
//             return <div />
//         }

//         render(document.body, <Component test={true} />, undefined, undefined)
//         render(document.body, <Component test={false} />, undefined, undefined)

//         expect(mock.callback).toHaveBeenCalledTimes(1)

//         done()
//     })
// })
describe('useMemo', () => {
    it('returns the same value when the inputs does not change', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        let fn: Function

        const Component = () => {
            fn = useMemo(() => () => { }, 0)

            return <div />
        }
        const vNode = <Component />
        render(document.body, vNode, undefined, undefined)

        setTimeout(() => {
            const firstFn = fn!

            setTimeout(() => {
                render(document.body, <Component />, vNode, vNode.domRef)

                expect(firstFn).toBe(fn!)

                done()
            })
        })
    })

    it('returns a new value when the inputs does change', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        let fn: Function

        const Component = (p: { input: number }) => {
            fn = useMemo(() => () => { }, p.input)

            return <div />
        }
        const vNode1 = <Component input={1} />
        render(document.body, vNode1, undefined, undefined)

        setTimeout(() => {
            const firstFn = fn!

            setTimeout(() => {
                render(document.body, <Component input={2} />, vNode1, vNode1.domRef)

                expect(firstFn).not.toBe(fn!)

                done()
            })
        })
    })
})

describe('useRef', () => {
    it('returns an object when called', done => {

        let ref: Ref<undefined>

        const Component = () => {
            ref = useRef()

            return <div />
        }
        const vNode = <Component />
        render(document.body, vNode, undefined, undefined)

        setTimeout(() => {
            expect(typeof ref).toEqual('object')

            done()
        })
    })

    it('returns an object that holds a reference to the DOM node of the component', done => {

        let ref: Ref<undefined>

        const Component = () => {
            ref = useRef()

            return <div />
        }
        const vNode = <Component />
        render(document.body, vNode, undefined, undefined)

        setTimeout(() => {
            expect(ref.node).toBe(vNode.domRef)

            done()
        })
    })

    it('takes the "current" value as an argument and sets it on the returned object', done => {

        let ref: Ref<string>

        const Component = () => {
            ref = useRef('foo')
            return <div />
        }
        const vNode = <Component />
        render(document.body, vNode, undefined, undefined)

        setTimeout(() => {
            expect(ref.current).toEqual('foo')

            done()
        })
    })

    it('keeps the "current" value between renders', done => {

        let ref: Ref<string>

        const Component = () => {
            ref = useRef('foo')
            myra.useLayoutEffect(() => {
                ref.current = 'bar'
            })
            return <div />
        }
        const vNode = <Component />
        render(document.body, vNode, undefined, undefined)

        requestAnimationFrame(() => {
            render(document.body, <Component />, vNode, vNode.domRef)
            expect(ref.current).toEqual('bar')

            done()
        })
    })

    it('returns an object that holds a mutable property named "current"', done => {

        let ref: Ref<string>

        const Component = () => {
            ref = useRef('foo')
            ref.current = 'bar'
            return <div />
        }
        const vNode = <Component />
        render(document.body, vNode, undefined, undefined)

        setTimeout(() => {
            expect(ref.current).toEqual('bar')

            done()
        })
    })
})

describe('useErrorHandling', () => {
    it('calls the useErrorHandling listener on view rendering error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            useErrorHandler(mock.callback)
            return <div>{(undefined as any).property}</div>
        }

        const node = render(document.body, <Component />, undefined, undefined)

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the useErrorHandling listener on effect error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {

            myra.useEffect(() => {
                throw Error()
            })
            useErrorHandler(mock.callback)

            return <div></div>
        }

        const component = <Component />

        render(document.body, component, undefined, undefined)

        requestAnimationFrame(() => {
            const node = (component as ComponentVNode<any>).domRef!
            expect(node.nodeType).toBe(Node.COMMENT_NODE)
            expect(node.textContent).toBe('Nothing')
            expect(mock.callback).toHaveBeenCalled()

            done()

        })
    })


    it('calls the useErrorHandling listener on useLayoutEffect error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {

            myra.useLayoutEffect(() => {
                throw Error()
            })
            useErrorHandler(mock.callback)

            return <div></div>
        }

        const component = <Component />

        render(document.body, component, undefined, undefined)

        requestAnimationFrame(() => {
            const node = (component as ComponentVNode<any>).domRef!
            expect(node.nodeType).toBe(Node.COMMENT_NODE)
            expect(node.textContent).toBe('Nothing')
            expect(mock.callback).toHaveBeenCalled()

            done()
        })
    })

    it('calls the useErrorHandling listener on initialization error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {

            useErrorHandler(mock.callback)

            throw Error()

            return <div></div>
        }

        const node = render(document.body, <Component />, undefined, undefined)

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the useErrorHandling listener on evolve error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {

            useErrorHandler(mock.callback)

            const [, evolve] = useState({})

            function doEvolve() {
                evolve(() => {
                    throw Error()
                })
            }
            return <div onclick={doEvolve}></div>
        }

        const node = render(document.body, <Component />, undefined, undefined) as HTMLDivElement
        node.click()
        requestAnimationFrame(() => {
            expect(mock.callback).toHaveBeenCalled()

            done()
        })
    })

    it('does not call the useErrorHandling listener on effect cleanup error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {

            myra.useEffect(() => {
                return () => {
                    throw Error()
                }
            })
            useErrorHandler(mock.callback)

            return <div></div>
        }

        const instance = <Component />
        const node = render(document.body, instance, undefined, undefined)
        render(document.body, <nothing />, instance, undefined)
        expect(node.nodeType).toBe(Node.ELEMENT_NODE)
        expect(node.textContent).toBe('')
        expect(mock.callback).not.toHaveBeenCalled()

        done()
    })

    it('passes on an exception up the component tree', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const SubComponent = () => <div>{(undefined as any).property}</div>

        const Component = () => {

            useErrorHandler(mock.callback)

            return <SubComponent />
        }

        render(document.body, <Component />, undefined, undefined)

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it(`passes the children of a component to it view`, done => {
        const viewMock = {
            view: (p: any) => {
                expect(Array.isArray(p.children)).toBe(true)
                return <div>{p.children}</div>
            }
        }

        spyOn(viewMock, 'view').and.callThrough()

        const Component = viewMock.view

        const Parent = () =>
            <Component>
                <div id="divTestId" />
            </Component>


        render(document.body, <Parent />, undefined, undefined)

        expect(q('#divTestId')).not.toBeNull()

        expect(viewMock.view).toHaveBeenCalledTimes(1)

        done()
    })
})

/**
 * updateComponent
 */
describe('component render', () => {

    it('does not call the layout effect listener if the props has not changed', () => {
        const mock = {
            beforeRender: () => { }
        }

        spyOn(mock, 'beforeRender').and.callThrough()

        const Component = (_p: { val: number }) => {
            myra.useLayoutEffect(() => mock.beforeRender())
            return <div />
        }

        const vNode = <Component val={45} />
        const domNode = render(document.body, vNode, undefined, undefined)
        render(document.body, <Component val={45} />, vNode, domNode)

        expect(mock.beforeRender).toHaveBeenCalledTimes(1)
    })

    it('calls the layout effect listener if the supplied props are not equal to the previous props', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = (_p: { prop: string }) => {
            myra.useLayoutEffect(() => mock.callback())
            return <div />
        }

        const vNode = <Component prop="a value" />
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = <Component prop="a new value" />
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(2)
    })

    it('does not call the layout effect listener if the children has not changed', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = (props: ComponentProps) => {
            myra.useLayoutEffect(() => mock.callback())
            return <div>{props.children}</div>
        }

        const vNode = <Component>Child A</Component>
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = <Component>Child A</Component>
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(1)
    })

    it('calls the layout effect event if the supplied children are not equal to the previous children', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.define(props => {
            myra.useLayoutEffect(() => mock.callback())
            return <div>{props.children}</div>
        })

        const vNode = <Component>Child A</Component>
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = <Component>Child B</Component>
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(2)
    })
})

describe('evolve', () => {
    it('updates the state when an Update function in supplied', () => {
        let firstUpdate = true

        const mocks = {
            onclickUpdate: (state: { val: number }) => {
                if (firstUpdate) {
                    expect(state).toEqual({ val: 1 })
                }
                else {
                    expect(state).toEqual({ val: 2 })
                }
                return { val: 2 }
            }
        }

        spyOn(mocks, 'onclickUpdate').and.callThrough()

        const Component = () => {
            const [, evolve] = useState({ val: 1 })
            const onclickUpdate = () => evolve(mocks.onclickUpdate)
            return <button id="postButton" onclick={onclickUpdate}></button>
        }

        render(document.body, <Component />, undefined, undefined)

        const postBtn = document.getElementById('postButton') as HTMLButtonElement
        postBtn.click()
        firstUpdate = false
        postBtn.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(2)
    })

    it('updates the state when an object in supplied', () => {
        let firstUpdate = true

        const mocks = {
            onclickUpdate: (s: { val: number }, newState: { val: number }) => {

                if (firstUpdate) {
                    expect(s).toEqual({ val: 1 })
                }
                else {
                    expect(s).toEqual({ val: 2 })
                }
                return newState
            }
        }

        spyOn(mocks, 'onclickUpdate').and.callThrough()

        const Component = () => {
            const [, evolve] = useState({ val: 1 })
            return <button id="postButton2" onclick={() => evolve(state => mocks.onclickUpdate(state, { val: 2 }))}></button>
        }

        render(document.body, <Component />, undefined, undefined)

        const postBtn = document.getElementById('postButton2') as HTMLButtonElement
        postBtn.click()
        firstUpdate = false
        postBtn.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(2)
    })
})