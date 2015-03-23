
var React = require('react'),
    Fluxxor = require('fluxxor'),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin,
    _ = require('underscore'),
    reqwest = require('reqwest');

var Icebox = {};

Icebox.Constants = {
    ICEBOX_LOAD: 'ICEBOX_LOAD',
    ICEBOX_LOAD_SUCCESS: 'ICEBOX_LOAD_SUCCESS',
    ICEBOX_LOAD_FAIL: 'ICEBOX_LOAD_FAIL'
};

Icebox.Actions = {
    /**
     * Run a get request to the REST API.
     * @param  {object} options
     * @example
     *  {
     *      className: 'Page', 
     *      id: this.props.data.id
     *      args: [{name: "__limit", value: 1}]
     *  }
     */
    get: function (options) {
        var self = this,
            params,
            args = (options.args !== void 0 ? options.args : []);

        // if no class defined then throw an error.
        if (options.className === void 0) {
            self.dispatch(Icebox.Constants.ICEBOX_LOAD_FAIL, {'error': 'No class name defined.'});
            return;
        }

        params = options.className;

        // set the id if defined.
        if (options.id !== void 0 && _.isNumber(options.id)) {
            params += '/' + options.id;
        }

        // tell the dispatcher a request is happening.
        this.dispatch(Icebox.Constants.ICEBOX_LOAD);

        // make the request.
        reqwest({
            url: '/api/' + params,
            method: 'get',
            data: args,
            success: function (payload) {
                self.dispatch(Icebox.Constants.ICEBOX_LOAD_SUCCESS, {
                    className: options.className,
                    data: payload
                });
            },
            error: function (err) {
                self.dispatch(Icebox.Constants.ICEBOX_LOAD_FAIL, {'error': err});
            }
        });
    }
};

Icebox.Store = Fluxxor.createStore({
    initialize: function () {
        this.loading = false;
        this.error = null;
        this._data = {};

        this.bindActions(
            Icebox.Constants.ICEBOX_LOAD, this.onLoad,
            Icebox.Constants.ICEBOX_LOAD_SUCCESS, this.onLoadSuccess,
            Icebox.Constants.ICEBOX_LOAD_FAIL, this.onLoadFail
        );
    },

    onLoad: function () {
        this.loading = true;
        this.emit("change");
    },

    onLoadSuccess: function (payload) {
        this.loading = false;
        this.error = null;
        this._data[payload.className] = payload.data;
        this.emit("change");
    },

    onLoadFail: function (payload) {
        this.loading = false;
        this.error = payload.error;
        this.emit("change");
    }
});

Icebox.Flux = new Fluxxor.Flux({ IceboxStore: new Icebox.Store() }, Icebox.Actions);

var oldDispatch = Icebox.Flux.dispatcher.dispatch.bind(Icebox.Flux.dispatcher);
Icebox.Flux.dispatcher.dispatch = function(action) {
    React.addons.batchedUpdates(function() {
        oldDispatch(action);
    });
};

Icebox.Flux.on('dispatch', function (type, payload) {
    if (console && console.log) {
        console.log('[Dispatch]', type, payload);
    }
});

Icebox.Mixin = {
    mixins: [FluxMixin, StoreWatchMixin('IceboxStore')],

    _getStore: function() {
        return Icebox.Flux.store('IceboxStore');
    },

    getDefaultProps: function () {
        return {
            flux: Icebox.Flux
        };
    }
};

module.exports = Icebox;
