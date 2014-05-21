const Lang = imports.lang;
const St = imports.gi.St;
const PanelMenu = imports.ui.panelMenu;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const FlorenceIntegration = new Lang.Class({
    Name: 'FlorenceIntegrationMenuItem',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(St.Align.START);

        let button = new St.Button({
            child: new St.Icon({
                gicon: Gio.icon_new_for_string(Me.path + '/icons/florence-integration-symbolic.svg'),
                style_class: 'system-status-icon'
            })
        });

        this.actor.add_actor(button);
    }
});

function init() {
};

function enable() {
    florenceIntegration = new FlorenceIntegration();
    Main.panel.addToStatusArea('florenceIntegration', florenceIntegration);
};

function disable() {
    florenceIntegration.destroy();
    florenceIntegration=null;
};
