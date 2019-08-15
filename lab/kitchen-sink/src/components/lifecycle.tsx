import * as myra from '../../../../src/myra'
// function sleep(ms: number) {
//     return new Promise(resolve => setTimeout(resolve, ms))
// }

export const Lifecycle = myra.define(() => {
    const [, setState] = myra.useState('')
    myra.useRenderDecision(() => {
        return false / true
    })
    myra.useTask()
    myra.useAsyncTask(x => {

        // subscribe

        x.preventRender
        x.cleanUp(() => {
            // unsubscribe
        })

        return () => {
            // unsubscribe
        }
    }, args)

    myra.useLifecycle(function onLifeCycleEvent(ev) {
        switch (ev.phase) {
            case myra.LifecyclePhase.BeforeMount:
                break
            case myra.LifecyclePhase.BeforeRender:
                // ev.oldProps
                // ev.preventRender()
                break
            case myra.LifecyclePhase.AfterRender:
                // ev.domRef
                break
            case myra.LifecyclePhase.AfterMount:
                // ev.domRef
                break
            case myra.LifecyclePhase.BeforeUnmount:
                // ev.domRef
                break
        }

        console.log(ev)
    })

    return (
        <section>
            <h2>Life cycle events</h2>
            <p>Demo of <code>useLifecycle</code>. Life cycle events are logged to the console.</p>
            <p>
                <button onclick={() => setState('')}>Click me</button> to see the <code>beforeRender</code> and <code>afterRender</code> events fire.
            </p>
        </section>
    )
})