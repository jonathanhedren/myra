

Myra

Myra is (another) JSX rendering library. It is small, simple and built with and for [Typescript](http://www.typescriptlang.org/).

[![npm](https://img.shields.io/npm/v/myra.svg?maxAge=24000)](https://www.npmjs.com/package/myra)
[![Travis](https://img.shields.io/travis/jhdrn/myra.svg?maxAge=36000)](https://travis-ci.org/jhdrn/myra)
[![codecov](https://codecov.io/gh/jhdrn/myra/branch/master/graph/badge.svg)](https://codecov.io/gh/jhdrn/myra)
[![Downloads](https://img.shields.io/npm/dm/myra.svg)](https://www.npmjs.com/package/myra)
[![gzip size](http://img.badgesize.io/https://cdn.jsdelivr.net/npm/myra/myra.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/myra/myra.min.js)
[![install size](https://badgen.net/packagephobia/install/myra)](https://packagephobia.now.sh/result?p=myra)

[![NPM](https://nodei.co/npm/myra.png)](https://nodei.co/npm/myra/)

## Features
* **Small API:** 
  Myra should be easy to learn as it's API and concepts are limited.
* **Statically typed views:** 
  Myra does not use HTML templates but uses 
  [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) to build up 
  view hierarchies. Together with Typescript's type checking, this reduces run time errors.
* **No dependencies:** 
  Myra does not depend on any external libraries.
* **Small code base/size:** 
  Hello World example is < 3kb minified and gzipped

## Requirements
Myra requires Typescript 2.8 to function properly. It is also highly advised 
that the compiler options `strictNullChecks`, `noImplicitReturns` and 
`noImplicitAny` are set to true.

## Getting started
Clone the repository and check the 
[examples](https://github.com/jhdrn/myra/tree/master/examples) 
folder. Open any example's folder in your terminal and execute 
`npm install && npm start`, then open your favorite browser and point it to 
`localhost:8080`.

The examples can be used as bootstrapping templates as they are set up with
build and "watch" scripts using npm and Webpack.

## Components
A Myra app is built from a hierarchy of components. The root component is 
mounted to a DOM element and it may contain child components. 

A component is just a function that takes a `props` object and a `context` as arguments:

```JSX
    import * as myra from 'myra'

    type Props = { test: string } & myra.ComponentProps
    const StateLessComponent = (props: Props, context: myra.Context<Props>) =>
        <div>
            {props.test}
            {...props.children}
        </div>

    const parentView = () => 
        <StateLessComponent test="foo">
            This is a child.
        </StateLessComponent>
```


### Using the context
The `context` object contains functions to enhance the component functionality:

#### useDomRef: () => { domRef: Node | undefined }
#### useErrorHandler: (handler: ErrorHandler) => void
#### useLifecycle: (callback: LifecycleEventListener) => void
#### useMemo: <TMemoized, TArgs>(fn: (args: TArgs) => TMemoized, inputs: TArgs) => TMemoized
#### useState: <TState>(init: TState) => [TState, Evolve<TState>]
#### useRenderDecision: (desicion: RenderDecision<TProps>) => void
    
```JSX
    import * as myra from 'myra'
    
    type Props = { myProp: string }
    type State = { hello: string }

    const init = { hello: 'Hello!' }

    // Define the component passing the initial state and a "setup"
    // function
    const MyComponent = (props: Props, context: myra.Context<Props>) => {

        // Default prop values can be set via the defaultProps property
        ctx.defaultProps = { myProp: 'default value' }

        // The context can be used to attach event listeners
        // for lifecycle events
        ctx.didMount = () => console.log('didMount')

        // The onError event listener will be called if a rendering error
        // occurs. It is required to return a view to display in place of
        // the component's (<nothing /> can be used).
        ctx.onError = () => <p>An error occured!</p>

        // The context also holds the important 'evolve' function
        // which is used to update the state and re-render the component.
        // This function will be triggered when the <p>-tag below is clicked
        // and update the state with a new 'hello' text
        const onClick = (ev: MouseEvent) => 
            ctx.evolve({ hello: ev.target.tagName })

        // The view must be returned as a function receiving the 
        // current state, any props and any child nodes.
        return (
            <p onclick={onClick}>
                {state.hello}
                {props.myProp}
                {children}
            </p>
        )
    }
    
```

### Mounting a component
Use `myra.mount` to mount a component to the DOM:

```JSX
    // Mount the component to a DOM element
    myra.mount(<MyComponent />, document.body) 
```

#### Lifecycle events
The following lifecycle events are fired:

- willMount - called before the component will attach to the DOM
- willRender - called before the component will be rendered
- didRender - called after the component was rendered
- didMount - called after the component was attached to the DOM
- willUnmount - called before the component will be detached from the DOM.

### Customizing the `context`

## Special props
Some props and events has special behavior associated with them.

* The `key` prop should be used to ensure that the state of child 
components is retained when they are changing position in a list. When used with
elements, it may also prevent unnecessary re-rendering and thus increase performance.
_It's value must be unique amongst the items in the list._
* The `forceUpdate` prop will force a child component to update if set to true 
(even if it's props didn't change).
* The `class` prop value will be set to the `className` property of the element.
* `blur`, `focus` and `click` props with a truthy value will result in a call to 
  `element.blur()`, `element.focus()` and `element.click()` respectively.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-2018 Jonathan Hedrén
