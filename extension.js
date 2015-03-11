const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const SyncthingIndicator = Me.imports.src.indicator;
const Syncthing = Me.imports.src.syncthing;
const Lang = imports.lang;

var indicator, mainloop;

function init(extensionMeta) {
    // add include path for icons
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
}

function enable() {
    var proxy = new Syncthing.Proxy('localhost', 8080);
    var server = new Syncthing.SyncthingServer(proxy);
    mainloop = Mainloop.timeout_add(10000, Lang.bind(server, server.update));
    indicator = new SyncthingIndicator.SyncthingIndicator(server);
    Main.panel.addToStatusArea("syncthing-indicator", indicator);
    server.update();
}

function disable() {
    if (indicator)
        indicator.destroy();
    Mainloop.source_remove(mainloop);
}
