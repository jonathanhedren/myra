import * as myra from 'myra'
import * as router from 'myra-router'
import RouteComponent from './route-component'


/**
 * State
 */
type State = {
    routeCtx: router.RouteContext
}
const init = {} as State


/**
 * Updates
 */
const onRoute = (_state: State, ctx: router.RouteContext) =>
    ({ routeCtx: ctx })

/**
 * Component
 */
export default myra.define<State, {}>({
    // The name of the component. Used for debugging purposes.
    name: 'RoutingComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: [init, router.addListener(onRoute)],

    // The render function is called after an update. 
    render: ({ state }) =>
        <section>
            <h2>Router examples</h2>

            {state.routeCtx.matchAny({
                'test1': <p>Route to '/test1'.</p>,
                'test1/:param': (params: any) => <RouteComponent {...params} />
            }, <nothing />)}

            {state.routeCtx.match('test1/:param').isMatch ?
                <p>Location '/test2/:param' matched.</p> : <nothing />}

            <ul class="list-group">
                <li class="list-group-item">
                    <a href="" onclick={(ev: Event) => { ev.preventDefault(); return router.routeTo('/test1') }}>
                        Update location to '/test1'
                </a>
                </li>
                <li class="list-group-item">
                    <a href="" onclick={(ev: Event) => { ev.preventDefault(); return router.routeTo('/test1/test2') }}>
                        Update location to '/test1/test2'
                </a>
                </li>
                <li class="list-group-item">
                    <a href="" onclick={(ev: Event) => { ev.preventDefault(); return router.goBack() }}>
                        Go back
                </a>
                </li>
                <li class="list-group-item">
                    <a href="" onclick={(ev: Event) => { ev.preventDefault(); return router.goForward() }}>
                        Go forward
                </a>
                </li>
            </ul>
        </section>
})