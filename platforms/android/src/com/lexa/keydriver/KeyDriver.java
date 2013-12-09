package com.lexa.keydriver;

import android.view.KeyEvent;
import android.content.Intent;
import android.util.Log;
import java.lang.reflect.Field;
import java.util.*;
import org.apache.cordova.*;
import org.json.*;


/**
 * Broadcasts key events for native applications.
 */
public class KeyDriver extends CordovaPlugin {
    // map of all known keys
    private Map<String, Integer> keycodes = new HashMap<String, Integer>();
    
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);

        Log.i("KeyDriver", "Enumerating all key codes.");
        try {
            for(Field field : KeyEvent.class.getDeclaredFields()) {
                if(field.getName().startsWith("KEYCODE_")) {
                    try {
                        keycodes.put(field.getName(), field.getInt(null));
                        Log.d("KeyDriver", "I know: " + field.getName());
                    } catch(IllegalAccessException e) {
                        // ignore static key code (all key codes are public).
                        Log.w("KeyDriver", "Can't access field's value: " + field.getName());
                    } catch(IllegalArgumentException e) {
                        Log.i("KeyDriver", "Illegal argument: " + field.getName());
                    }
                }
            }
        } catch(SecurityException ex) {
            // mapping will be empty, JS code can check it.
            Log.e("KeyDriver", "SecurityException on KeyEvent access.");
        }
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        Log.d("KeyDriver", "Dispatching action: " + action);
        if(action.equals("broadcastKey")) {
            if(args.length() != 1) {
                Log.e("KeyDriver", "broadcastKey expects single argument, got: " + args.length());
                callbackContext.error("Keycode name expected as first argument.");
            } else {
                String keycode = args.getString(0);
                Log.d("KeyDriver", "Key to broadcast: " + keycode);
                if(keycode == null) {
                    Log.e("KeyDriver", "broadcastKey doesn't accept null as key code");
                    callbackContext.error("First argument has to be string specifying key code.");
                } else if(this.broadcastKey(keycode)) {
                    Log.d("KeyDriver", "broadcastKey success: " + keycode);
                    callbackContext.success(keycode);
                } else {
                    Log.e("KeyDriver", "broadcastKey failed: " + keycode);
                    callbackContext.error("Unknown key code name: " + keycode);
                }
            }
            return true;
        }
        return false;
    }

    /** Broadcast given key. */
    private boolean broadcastKey(String keycode) {
        if(!keycodes.containsKey(keycode))
            return false;

        Intent intent = new Intent();
        intent.setAction(Intent.ACTION_MEDIA_BUTTON);
        KeyEvent key = new KeyEvent(KeyEvent.ACTION_DOWN, keycodes.get(keycode).intValue());
        intent.putExtra(Intent.EXTRA_KEY_EVENT, key);
        ((CordovaActivity)this.cordova.getActivity()).sendBroadcast(intent);
        return true;
    }
}