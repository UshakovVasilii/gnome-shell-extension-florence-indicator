const Lang = imports.lang;
const St = imports.gi.St;
const PanelMenu = imports.ui.panelMenu;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

let florenceIndicator = null;

const FlorenceKeyboardProxy = Gio.DBusProxy.makeProxyWrapper('<node> \
  <interface name="org.florence.Keyboard"> \
    <method name="toggle"/> \
    <signal name="terminate"/> \
    <signal name="show"/> \
    <signal name="hide"/> \
  </interface> \
</node>');

const FlorenceIndicator = new Lang.Class({
    Name: 'FlorenceIndicatorMenuItem',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(St.Align.START);

        this._icon = Gio.icon_new_for_string(Me.path + '/icons/florence-indicator-symbolic.svg');
        this._shownIcon = Gio.icon_new_for_string(Me.path + '/icons/florence-indicator-shown-symbolic.svg');
        this._hiddenIcon = Gio.icon_new_for_string(Me.path + '/icons/florence-indicator-hidden-symbolic.svg');

        this._appIcon = new St.Icon({
                gicon: this._icon,
                style_class: 'system-status-icon'
            });

        let button = new St.Button({
            child: this._appIcon
        });

        this._florenceProxy = new FlorenceKeyboardProxy(
            Gio.DBus.session,
            "org.florence.Keyboard",
            "/org/florence/Keyboard"
        );

        button.connect('clicked', Lang.bind(this, function(){
            try {
                this._florenceProxy.toggleSync();
            } catch (ex) {
                global.log(ex);
                global.log('Try to start "florence"...');
                Util.spawn(['florence']);
            }
        }));

        this._florenceProxy.connectSignal("show", Lang.bind(this, function(proxy) {
            this._appIcon.gicon = this._shownIcon;
        }));

        this._florenceProxy.connectSignal("hide", Lang.bind(this, function(proxy) {
            this._appIcon.gicon = this._hiddenIcon;
        }));

        this._florenceProxy.connectSignal("terminate", Lang.bind(this, function(proxy) {
            this._appIcon.gicon = this._icon;
        }));

        this.actor.add_actor(button);
    },

});

function init() {
};

function enable() {
    florenceIndicator = new FlorenceIndicator();
    Main.panel.addToStatusArea('florenceIndicator', florenceIndicator);
};

function disable() {
    florenceIndicator.destroy();
    florenceIndicator=null;
};
