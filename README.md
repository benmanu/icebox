# Icebox
A React /w Flux (Fluxxor) boilerplate for setting the state on a component through ajax calls.

# Setting up Icebox
Include the requirement on your React component.
``` javascript
var IceboxMixin = require('Icebox').Mixin;
```
or
``` javascript
var IceboxMixin = require('path/to/this/directory/index').Mixin;
```
Then include the mixin on your component with
``` javascript
mixins: [IceboxMixin]
```
Your component can then call the `get()` action on init through
``` javascript
componentDidMount: function() {
    this.getFlux().actions.get({
        className: 'BlogEntry', 
        args: [{
            name: '__limit',
            value: '3'
        }]
    });
}
```
The response can be handled through the component with
``` javascript
getStateFromFlux: function() {
    var store = this.getFlux().store('IceboxStore');
    return {
        loading: store.loading,
        error: store.error,
        blogEntries: store._data['BlogEntry']
    };
}
```