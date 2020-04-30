# Autocompleter

**Warning:** Version 2.0.0 contains potentially breaking changes for frontend projects. Please refer to the [demo](./demo/usig-autocompleter-react-demo) to see how to implement the newest version.

This autocompleter is a library which gives a list of suggestions given a certain text. This is done using a list of suggesters, which can be loaded dinamically, in case you don't want to use one of the defaults. A set of callbacks should be set so the autocompleter can call them after certain events.

## Features

- Add suggesters with personalized functionality.
- Subscribe to events by passing callbacks for different events.
- Override the default options.
- Look up suggestions for a given text.
- Get the global state at any time.

## Demos

A simple [create-react-app](https://www.npmjs.com/package/create-react-app) can be found in [demo/react-demo](./demo/react-demo) with an example showing how the module can be used in a React environment.

Also, an [Angular CLI](https://github.com/angular/angular-cli) app can be found in [demo/angular-demo](./demo/angular-demo) showing integration in this framework.

## Getting started

1. Installing the library

- Run `npm install @usig-gcba/autocompleter` command in your project root.

2. Import the library

- Add the import tag in your file `import {Autocompleter} from '@usig-gcba/autocompleter'`

3. Create a new instance

- Just use the `new` command to create a new instance `const autocompleter = new Autocompleter(callbacks, options)`. You can save it in a variable for further use.

## Configuration

#### constructor

- Creates a new instance of the autocompleter.
- Parameters:

  - callbacks: `Object` containing the callbacks for event handling. Here's a list of all the possible callbacks:
    - OnSuggestions: called when a suggester brings new suggestions. Returns the list of results.
      > Note: If a suggester brings 0 results, the onSuggestions callback won't be called.
    - OnCompleteSuggestions: called when all the active suggesters are done.
    - OnMessage: called when a message should be displayed (for example, no results were found).
    - OnError: called when an error occurred in any of the suggesters.
    - OnUpdate: called every time the state of the autocompleter changes.
    - OnBufferResults: if a flushTimeout is set, the autocompleter will buffer the results calling this callback.
  - options: `Object` containing default options to be overwritten. Available options:

|   Parameter    |                          Description                          | Default |
| :------------: | :-----------------------------------------------------------: | ------- |
|   inputPause   |   Time each suggester waits before looking for suggestions    | 200     |
| maxSuggestions |                  Total limit of suggestions                   | 10      |
| serverTiemout  |             Timeout in case an http call is made              | 3000    |
| minTextLength  | Minimun text length in order to start looking for suggestions | 3       |
|   maxRetries   |              Maximum retries in case of failure               | 1       |
|  flushTimeout  |     Time to wait before flushing results from suggesters.     | 0       |

- Example

```
const autocompleter = new Autocompleter(
      {
         onSuggestions: suggestionsCallback,
         onUpdate: updateCallback,
         onError: errorCallback,
         onMessage: messageCallback
       },
       {
         inputPause: 400,
         maxRetries: 2
       }
);
```

#### addSuggester(suggesterName)

- By default, the autocompleter initializes empty. This method adds a suggester for the autocompleter to use when updating suggestions.
- Parameters:
  - suggesterName: `String` name of the suggester.
- The name must be a valid suggester name. By default, 4 suggesters are registered in the autocompleter:

  - "Direcciones"
  - "DireccionesAmba"
  - "Lugares"
  - "DeficitHabitacional"

#### updateSuggestions(text)

- Calls the getSuggestions function in all the active suggesters.
- Parameters:

  - text: `String` to be searched.

#### removeSuggester(suggesterName)

- Removes a suggester from the autocompleter. This suggester will still be a valid one, but the autocompleter won't take it into account when updating suggestions.
- Parameters:

  - suggesterName: `String` name of the suggester.

## Suggesters

The suggesters contain the core functionality of the autocompleter. They are in charge of looking for suggestions. Up next is a list of the suggesters available by default.

#### Default suggesters

##### Directions

This suggester looks for directions inside the City of Buenos Aires. So, for the input text we give to the autocompleter,
the suggester looks for directions matching that text.

##### AMBA Directions

This suggester looks for directions inside AMBA.

##### Places of interest

This suggester looks for places inside the City of Buenos Aires (airports, museums, parks, entertainment).

#### Adding a custom suggester

You can see an example of a suggester that can be used as a template [here](./src/suggesters/SuggesterDemo.js)

Custom suggesters can be added via de `addSuggester` function. This function can take either a `String` or an `Object` as parameters.

- Parameters:
  - `String` containing the name of the suggester to be added. In this case, the suggester should be already registered in the
    autocompleter.
  - `Object` containing the suggester to be added. In this case, we are registering a new type of sugester to the autocompleter.

#### Suggester structure

Any new suggester added should implement all the Suggester methods.
The library exports the Suggester interface, so a custom class can be created extending from this one.

##### Example

```
import {Suggester} from '@usig-gcba/autocompleter'

class MySuggester extends Suggester {
  getSuggestions(text, callback, maxSuggestions){
      callback([...results]);
  }
}
```

## Troubleshooting

If you are trying to implement Autocompleter in an Angular project, you will have to install `@babel/polyfill` and import it at your app.component.ts file as can be seen in the [angular demo](./demo/angular-demo).
