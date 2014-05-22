const Lang = imports.lang;
const St = imports.gi.St;
const PanelMenu = imports.ui.panelMenu;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;
const GTop = imports.gi.GTop;
const Util = imports.misc.util;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

let florenceIntegration = null;

const FlorenceKeyboardProxy = Gio.DBusProxy.makeProxyWrapper('<node> \
  <interface name="org.florence.Keyboard"> \
    <method name="show"/> \
    <method name="move"> \
      <arg type="u" name="x" direction="in"/> \
      <arg type="u" name="y" direction="in"/> \
    </method> \
    <method name="move_to"> \
      <arg type="u" name="x" direction="in"/> \
      <arg type="u" name="y" direction="in"/> \
      <arg type="u" name="w" direction="in"/> \
      <arg type="u" name="h" direction="in"/> \
    </method> \
    <method name="hide"/> \
    <method name="toggle"/> \
    <method name="terminate"/> \
    <method name="menu"> \
      <arg type="u" name="time" direction="in"/> \
    </method> \
    <signal name="terminate"/> \
    <signal name="show"/> \
    <signal name="hide"/> \
  </interface> \
</node>');

const FlorenceIntegration = new Lang.Class({
    Name: 'FlorenceIntegrationMenuItem',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(St.Align.START);

        this._shownIcon = Gio.icon_new_for_string(Me.path + '/icons/florence-integration-shown-symbolic.svg');
        this._hiddenIcon = Gio.icon_new_for_string(Me.path + '/icons/florence-integration-hidden-symbolic.svg');

        this._appIcon = new St.Icon({
                gicon: this._hiddenIcon,
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

        global.log('FlorenceIntegration PROXY:' + this._florenceProxy);

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

        this.actor.add_actor(button);
    }
});

function init() {
};

function enable() {
    florenceIntegration = new FlorenceIntegration();
    Main.panel.addToStatusArea('florenceIntegration', florenceIntegration);

/* work for detect window!!!
	let tracker = Shell.WindowTracker.get_default();
    //global.log('#####DDD^^^#######' + tracker.get_startup_sequences());
let proclist = new GTop.glibtop_proclist;
 global.log('#####DDD^^^#######' + proclist);
let pid_list = GTop.glibtop_get_proclist(proclist, 0, 0); 
 global.log('#####DDD^^^#######' + pid_list);
 global.log('#####DDD^^^#######' + proclist);
		let windows = global.screen.get_active_workspace().list_windows();

		for (let i = 0; i < windows.length; ++i) {
            global.log('############' +windows[i]);
				let appWin = tracker.get_window_app(windows[i]);
				//let appIcon = appWin.create_icon_texture(22);
				//let appName = appWin.get_name();
global.log('####!!########' +appWin.get_name());
			
		}
*/

};

function disable() {
    florenceIntegration.destroy();
    florenceIntegration=null;
};
