const Lang = imports.lang;
const St = imports.gi.St;
const PanelMenu = imports.ui.panelMenu;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;
const Clutter = imports.gi.Clutter;

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
        this.parent(St.Align.START, null, true);

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

        this.connect('destroy', Lang.bind(this, this._onDestroy));

        button.connect('clicked', Lang.bind(this, this._toggle));

        this._florenceProxy.connectSignal("show", Lang.bind(this, function() {
            this._appIcon.gicon = this._shownIcon;
        }));

        this._florenceProxy.connectSignal("hide", Lang.bind(this, function() {
            this._appIcon.gicon = this._hiddenIcon;
        }));

        this._florenceProxy.connectSignal("terminate", Lang.bind(this, function() {
            this._appIcon.gicon = this._icon;
        }));

        this.actor.add_actor(button);
    },

    _toggle : function() {
        try {
            this._florenceProxy.toggleSync();
        } catch (ex) {
            global.log(ex);
            if (!this._lastLaunch || (new Date().getTime() - this._lastLaunch > 1000)){
                this._lastLaunch = new Date().getTime();
                global.log('Launch "florence"...(current time is ' + this._lastLaunch + 'ms)');
                Util.spawn(['florence']);
            } else {
                global.log('Stop double launching');
            }
        }
    },

    // Override
    _onButtonPress: function(actor, event) {
        this._toggle();
    },

    // Override
    _onSourceKeyPress: function(actor, event) {
        let s = event.get_key_symbol();
        if (s == Clutter.KEY_space || s == Clutter.KEY_Return || s == Clutter.KEY_Down || s == Clutter.KEY_Up) {
            this._toggle();
        }
    },

    _onDestroy : function(){
        this._florenceProxy.run_dispose();
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
