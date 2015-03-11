const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const PopupMenuScrollSection = Me.imports.src.popupMenuScrollSection;
const Gio = imports.gi.Gio;

const FolderMenuItem = new Lang.Class({
    Name: 'FolderMenuItem',
    Extends: PopupMenu.PopupBaseMenuItem,

    _init: function(folder) {
        this.parent();
        this.folder = folder;

        var box = new St.BoxLayout({ style_class: 'popup-combobox-item' });

        var icon = new St.Icon({
            icon_name: 'folder-remote-symbolic',
            icon_size: 16,
            style_class : "system-status-icon",
        });
        box.add(icon);

        var idLabel = new St.Label({ text: this.folder.getId() });
        box.add(idLabel);

        this.state_label = new St.Label();
        box.add( this.state_label );

        this.setState( this.folder.state.get() );
        this.folder.state.connect('changed', Lang.bind(this, function(_, newState) {
            this.setState(newState);
        }));

        // For Gnome 3.8 and below
        if( typeof this.addActor != 'undefined' ) {
            this.addActor(box);
            // let the build button use the rest of the box and align it to the right
            //this.addActor(this.button_build, {span: -1, align: St.Align.END});
        }
        // For Gnome 3.10 and above
        else {
            this.actor.add_child(box);

            // let the build button use the rest of the box and align it to the right
            //this.actor.add_child(this.button_build, {span: -1, align: St.Align.END});
        }
        // clicking a job menu item opens the job in web frontend with default browser
        this.connect( "activate", Lang.bind( this, this.onclick ) );
    },

    setState: function(new_state) {
        this.state_label.set_text(" ["+new_state+"]");
    },

    onclick: function() {
        let uri = Gio.file_new_for_path( this.folder.getPath() ).get_uri();
        global.log("Openning: " + uri);
        Gio.app_info_launch_default_for_uri(
                uri, global.create_app_launch_context(0, -1));
    },
});

const ServerPopupMenu = new Lang.Class({
    Name: 'ServerPopupMenu',
    Extends: PopupMenu.PopupMenu,

    _init: function(sourceActor, proxy) {
        this.parent(sourceActor, 0.25, St.Side.TOP);
        this.proxy = proxy;

        this.folder_section = new PopupMenuScrollSection.PopupMenuScrollSection();
        this.proxy.connect('new-folder', Lang.bind(this, function(_, id) {
            this.folder_section.addMenuItem(
                    new FolderMenuItem( proxy.getFolder( id ) ) );
        }));
        this.addMenuItem(this.folder_section);
        // add seperator to popup menu
        this.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        // add link to settings dialog
        var syncthingMenuItem = new PopupMenu.PopupMenuItem( "Open syncthing" );
        syncthingMenuItem.connect("activate", Lang.bind(this, function(){
            Gio.app_info_launch_default_for_uri(
                    this.proxy.getUrl(),
                    global.create_app_launch_context(0, -1));
        }));
        this.addMenuItem(syncthingMenuItem);
    },
});

