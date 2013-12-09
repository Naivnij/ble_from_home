/**
 * cordova KeyDriver plugin
 * Author: Sardar Yumatov (ja.doma@gmail.com)
 * Copyright (c) Oleksij Nesterov 2014
 */
 (function(cordova){
    var KeyDriver = function() {

    };

    KeyDriver.prototype.broadcastKey = function(keycode, success, fail) {
        return cordova.exec(function(args) {
            success(args);
        }, function(err) {
            fail(err);
        }, 'KeyDriver', 'broadcastKey', [keycode]);
    };

    window.keydriver = new KeyDriver();
    window.plugins = window.plugins || {};
    window.plugins.keydriver = window.keydriver;
})(window.PhoneGap || window.Cordova || window.cordova);
