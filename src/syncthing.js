const Lang = imports.lang;
const Soup = imports.gi.Soup;
const GObject = imports.gi.GObject;

const STATE_IDLE     = 'idle',
      STATE_CLEANING = 'cleaning',
      STATE_SCANNING = 'scanning',
      STATE_SYNCING  = 'syncing';

const Proxy = new Lang.Class({
    Name: "Proxy",
    Extends: GObject.Object,

    _init: function(hostname, port) {
        this.parent();
        this.baseurl = "http://" + hostname + ":" + port;
        this._session = new Soup.SessionAsync();
    },

    ping: function(callback) {
        this.getData('/rest/ping', callback);
    },

    config: function(callback) {
        this.getData('/rest/config', callback);
    },
    model:  function(folderID, callback) {
        this.getData("/rest/model?folder=" + folderID, callback);
    },

    getData: function(path, callback) {
        let url = this.baseurl + path;
        let request = Soup.Message.new('GET', url);
        if( request ) {
            this._session.queue_message(
                    request,
                    Lang.bind(this, function(httpSession, message) {
                        if( message.status_code!==200 )
                            callback();
                        else
                            callback(JSON.parse(message.response_body.data));
                    })
            );
        }
    },
});

const SyncthingServer = new Lang.Class({
    Name: "SyncthingServer",
    Extends: GObject.Object,
    Signals: {
        'refresh': { },
        'new-folder': { param_types: [ GObject.TYPE_STRING ] }
    },

    _init: function(proxy) {
        this.parent();
        this.proxy = proxy;
        this.folders = {};
        this.state = new SyncthingState();
    },

    getFolder: function(fid){
        return this.folders[fid];
    },

    addFolder: function(data) {
        var fid = data.ID;
        if (!(fid in this.folders)) {
            this.folders[fid] = new SyncthingFolder(data);
            this.folders[fid].state.connect( 'changed', Lang.bind( this, this.updateState ) );
            this.updateState();
            this.emit('new-folder', fid);
        }
    },

    update: function() {
        this.proxy.config(
            Lang.bind(this, function(data) {
                for( var i in data['Folders']) {
                    this.addFolder(data['Folders'][i]);
                    this.updateFolder(data['Folders'][i].ID);
                }
            }));
        return true;
    },

    updateState: function() {
        // update the global server state from the states of all the folders
        var folder_states = [this.folders[f].state.get() for (f in this.folders)];
        var global_state = state_summary( folder_states );
        this.state.set(global_state);
    },

    updateFolder: function(fid) {
        var folder = this.getFolder(fid);
        this.proxy.model( fid, function( data ) { folder.update(data); } );
    },

    getUrl: function() {
        return this.proxy.baseurl;
    },

});


const SyncthingFolder = new Lang.Class({
    Name: "SyncthingFolder",
    Extends: GObject.Object,

    _init: function(data) {
        this.parent();
        this._id = data.ID;
        this._path = data.Path;
        this.state = new SyncthingState();
    },

    getId:   function() { return this._id; },
    getPath: function() { return this._path; },

    update: function(data) {
        this.state.set(data['state']);
    },
});

const state_summary = function(states) {
    var valstates = { syncing:0, cleaning:1, scanning:2, idle:3 },
    val = 3, state = 'idle';
    for ( var i = 0 ; i < states.length ; i++ )
        if (valstates[states[i]] < val) {
            val = valstates[states[i]];
            state = states[i];
        }
    return state;
};

const SyncthingState = new Lang.Class({
    Name: "SyncthingState",
    Extends: GObject.Object,
    Signals: {
        'changed': { param_types: [ GObject.TYPE_STRING ] }
    },

    _init: function() {
        this.parent();
        this._state = STATE_IDLE;
    },
    get: function() {
        return this._state;
    },
    set: function(s) {
        if (s != this._state) {
            this._state = s;
            this.emit('changed', this._state);
        }
    },
});
