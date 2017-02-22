

# ![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAMAAAANmfvwAAAANlBMVEVmRABmmQBmRABmRABmRABmRABmRABmcwBmdABmRABmRABmRABmRABmRABmRABmlABmRABmmQDkArD1AAAAEHRSTlMAAAkeNjk8YWV7foHh8PP+GiOcqAAAAKpJREFUeNql08EKg0AMhOGkdatdq67v/7LikjKQn7KHzimHD8IEYjm12iC1tYF5tzYyr/1v8xyauhcYdNmmeygyEK19HslAbMUsGQiPhPkh5jkZiuNIhuI8w2xfI2EhwpiMuoQIYzJqGyKMyaydTDdZRJabTJ2sJuPdhHCTkPFuQriETPFuQriEjE6XBA0ETRIw1iNBsxcKGgoaCBoImsE7rhQ03EJDQQNxAS1ZGHEGNN3tAAAAAElFTkSuQmCC) Myra

Myra is a simple and small [Typescript](http://www.typescriptlang.org/) 
framework for building web interfaces. It targets the "middle ground" between
[Elm](http://elm-lang.org/) and [React](https://facebook.github.io/react/).

[![npm](https://img.shields.io/npm/v/myra.svg?maxAge=24000)](https://www.npmjs.com/package/myra)
[![Travis](https://img.shields.io/travis/jhdrn/myra.svg?maxAge=36000)](https://travis-ci.org/jhdrn/myra)
[![codecov](https://codecov.io/gh/jhdrn/myra/branch/master/graph/badge.svg)](https://codecov.io/gh/jhdrn/myra)

## Features
* **Functional:** 
  Myra encourages functional programming and immutability for predictable 
  behavior.
* **Small API:** 
  Myra should be easy to learn as it's API and concepts are limited.
* **Statically typed views:** 
  Myra does not use HTML templates but uses 
  [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) to build up 
  view hierarchies. Together with Typescript's type checking, this reduces run 
  time errors.
* **No dependencies:** 
  Myra does not depend on any external libraries.
* **Small code base/size:** 
  Hello World example is ~9kb minified/~4kb minified and gzipped

## Requirements
Myra requires Typescript 2.0 to function properly. It is also highly advised 
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
mounted to a DOM element and it may contain child components. Components can be
either stateful or stateless. 

### Stateful components
A stateful component must have a unique name, a state of any type and a 
view. Many times it also has associated [`Update`](#updating-the-state) 
functions that updates it's state.

To define a component, use `defineComponent` and then mount it to the DOM
with `mountComponent`:
    
```JSX
    import * as myra from 'myra'

    type State = string

    const MyComponent = myra.defineComponent({
        // The name of the component
        name: 'MyComponent', 
        
        // The initial state and effects (optional) (see 'Effects' below)
        init: {
            state: 'Hello world',
            effects: ... // optional 
        }, 

        // An optional Update function that will be called when the component is 
        // mounted (see 'Updating the state'). 
        onMount: ..., 

        // An optional Update function that will be called when the component is
        // unmounted (see 'Updating the state'). 
        onUnmount: ...,
        
        // The view of the component (see 'View' below)
        view: ctx => <p>{ctx.state}</p>
    })

    // Mounts the component to a DOM element
    myra.mountComponent(MyComponent, document.body) 
```

### Updating the state
State is updated with `Update` functions. `Update` functions should 
always be [pure](https://en.wikipedia.org/wiki/Pure_function) and 
should also always copy the state if any changes are made to it.

The `evolve` function helps with modifying and copying the state. In the 
following example, the `updateFoo` function updates the value of the `foo`
property of the state:

```typescript
    import { evolve } from 'myra'

    type State = {
        foo: string
    }

    const updateFoo = (state: State, newFoo: string) => 
        evolve(state, x => x.foo = newFoo)
```

Update functions must return a `Result<T>` which is an object with the
following definition (the `evolve` function does this for you):

``` typescript
    {
        state: T
        effects?: Effect[]
    }
```

### Effects
An `Effect` represents some kind of side effect. It receives an `Apply` function
that may be used to apply an `Update` function with a given argument.

Effects can be returned in a `Result<T>` from an `Update` function or from
an event listener (see 'Event listeners' below).

```typescript
    import { Update, Apply } from 'myra'
    type State = ...

    const myEffect = (update: Update<State, any>) => (apply: Apply) => {
        ...some side effect...
        const arg = ...
        apply(update, arg)
    }
```

### Views
Myra does not use HTML templates but creates it's views with JSX. A 
`ViewContext<TState, TProps>` is supplied as an argument to the view function. 

```JSX
    import * as myra from 'myra'

    type State = string
    type Props = {}

    const view = (ctx: myra.ViewContext<State, Props>) => 
        <p>
           The state is {ctx.state}
        </p>

```

The `ViewContext<TState, TProps>` contains key properties for the component:

- `state` - the current state (`TState`) of the component.
- `props` - the props (`TProps`) supplied to the component.
- `apply` - a function that updates the state of the component by applying the 
  `Update` function that is supplied as an argument. If a second argument is 
  supplied, it will be passed to the `Update` function.
- `invoke` - a function that invokes an `Effect` which may update the state 
  later.

Examples of usage:

```JSX
    import * as myra from 'myra'
    import { startTimeout } from 'myra-time'

    type State = {
        inputValue: string
    }
    type Props = {
        foo: string
    }

    const myApplyUpdate = (s: State) => 
        myra.evolve(s, x => x.inputValue = '')
    
    const view = (ctx: myra.ViewContext<State, Props>) => 
        <div>
            <p>The props property 'foo' has value {ctx.props.foo}.</p>
            <p>{ctx.state.inputValue}</p>
            <button onclick={() => ctx.apply(myApplyUpdate)}>
                Clear inputValue
            </button>
            <button onclick={() => ctx.invoke(startTimeout(5000, undefined, myApplyUpdate))}>
                Clear in 5 seconds
            </button>
        </div>
```

#### Event listeners
Any attribute key starting with `on` is treated as an event listener.
The event, the target element and the `ElementDescriptor<TElement>` of the 
element are passed as arguments.
An `ElementDescriptor<TElement>` is a "virtual DOM" representation of a DOM 
element.

```JSX
    import * as myra from 'myra'

    type State = ...
    type Props = ...

    const myUpdate = (s: State) => {
        ...
        return myra.evolve(s)
    }

    const view = (ctx: myra.ViewContext<State, Props>) => 
        <button onclick={(ev, node, descriptor) => ctx.apply(myUpdate)}>Click me!</button>

```

#### Special attributes/props
Some attributes/props and events has special behavior associated with them.

* The `key` attribute/prop should be used to ensure that the state of child 
components is retained when they are changing position in a list. When used with
elements, it may also prevent unnecessary re-rendering and thus increase performance.
_It's value must be unique amongst the items in the list._
* The `class` attribute value will be set to the `className` property of the element.
* `blur`, `focus` and `click` attributes with a truthy value will result in a call to 
  `element.blur()`, `element.focus()` and `element.click()` respectively.
* `checked` and `disabled` attributes with a truthy value will set 
  `element.checked` and/or `element.disabled` to true.
* The `value` attribute will set `element.value` if it is either an `input`, 
  `select` or `textarea` element.

#### Child components
To mount a child component use it's identifier as a JSX tag. The component
identifier must begin with an uppercase first letter, as by standard JSX rules.

Any props will be passed to the child component's `ViewContext` and to it's 
`onMount` `Update` function if defined.

```JSX
    import * as myra from 'myra'
    import MyComponent from './myComponent'
    
    const view = (_) => 
        <MyOtherComponent foo="a prop" />

```

### Stateless components
A stateless component is just a function that takes a props object and 
children as arguments:

```JSX
    import * as myra from 'myra'

    type Props = { test: string }
    const StateLessComponent = (props: Props, children: VNode[]) =>
        <div>
            {props.test}
            {...children}
        </div>

    const parentView = () => 
        <StateLessComponent test="foo">
            This is a child.
        </StateLessComponent>
```

## Debugging
To help with debugging you can turn on debug logging (to the console) by using 
the `debug` function. It will log the state before and after an update, aswell 
as any update arguments.

```typescript
    import * as myra from 'myra'

    // Enable debug logging
    myra.debug(true)
```

## HTTP requests
The [myra-http](https://github.com/jhdrn/myra-http) package exposes the
`httpRequest` function that is an `Effect` wrapper for 
making XmlHttpRequests. Take a look at 
[examples/kitchen-sink/src/components/http.tsx](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/http.tsx)
for an example on how to use the module.

## Timeouts and intervals
The [myra-time](https://github.com/jhdrn/myra-time) package contains `Effect`
wrappers for `setTimeout` and `setInterval`.
Take a look at 
[examples/kitchen-sink/src/components/time.tsx](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/time.tsx)
for an example on how to use the module.

## Routing
Routing is supplied by the [myra-router](https://github.com/jhdrn/myra-router) 
package (currently a work in progress).

Both the 
[kitchen-sink example](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/routing.tsx) 
and the 
[todomvc example](https://github.com/jhdrn/myra/blob/master/examples/todomvc/src/components/todo-list.tsx) 
contains code examples for `myra-router`.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-2017 Jonathan Hedrén
