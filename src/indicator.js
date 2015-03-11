const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Icon = Me.imports.src.helpers.icon;
const ServerPopupMenu = Me.imports.src.menu;
const syncthing = Me.imports.src.syncthing;

const SyncthingIndicator = new Lang.Class({
    Name: 'SyncthingIndicator',
    Extends: PanelMenu.Button,

    _init: function(source) {
        this.parent(0.25, "Syncthing Indicator", false );

        this.proxy = source;

        // add server popup menu
        this.setMenu(new ServerPopupMenu.ServerPopupMenu(this.actor, this.proxy));

        // TODO refresh when indicator is clicked
        // this.actor.connect("button-press-event", Lang.bind(this, this.request));

        this._iconActor = Icon.createStatusIcon('syncthing-logo');
        this.actor.add_actor(this._iconActor);
        this.setState(this.proxy.state.get());
        this.proxy.state.connect('changed', Lang.bind(this, function(_, state) {
            this.setState(state);
        }));
    },

    setState: function(s) {
        global.log("New indicator state: " + s);
        if (s == syncthing.STATE_SYNCING)
            this._iconActor.icon_name = 'syncthing-sync';
        else
            this._iconActor.icon_name = 'syncthing-logo';
    },

    destroy: function() {
        this.parent();
    }
});

