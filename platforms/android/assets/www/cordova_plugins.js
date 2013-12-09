cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.megster.cordova.bluetoothserial/www/bluetoothSerial.js",
        "id": "com.megster.cordova.bluetoothserial.bluetoothSerial",
        "clobbers": [
            "bluetoothSerial"
        ]
    },
    {
        "file": "plugins/com.lexa.keydriver/www/keydriver.js",
        "id": "com.lexa.keydriver.KeyDriver",
        "clobbers": [
            "KeyDriver"
        ]
    }
]
});