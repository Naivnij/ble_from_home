/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', function() {
            app.show('Ready');

            $('#clear-bttn').on('click', app.clear);

            $('#start-scan-bttn').click(function() {
                bluetoothSerial.isEnabled(
                    function() {
                        app.show("Scanning...");
                        var sel = $('#devices-list').empty();
                        bluetoothSerial.list(
                            function(results) {
                                app.show("Got results: " + results.length);
                                for(var i=0; i<results.length; i++) {
                                    var result = results[i];
                                    try {
                                        app.show("Device " + result.name + ": " + result.address);
                                        sel.append('<option value="' + result.address + '">' + (result.name || "(empty)") + '</option>');
                                    } catch(e) {
                                        app.show(e);
                                    }

                                }
                            },
                            function(error) {
                                app.show(JSON.stringify(error), true);
                            }
                        );
                    },
                    function() {
                        app.show("Bluetooth is not enabled.", false);
                    }
                );
            });

            var current_address = null;
            $('#devices-list').click(function() {
                current_address = this.value;
                app.show("Connecting: " + current_address);
                bluetoothSerial.connect(
                    current_address,
                    function() {
                        app.show("Connected to: " + current_address);

                        $('#disconnect-bttn').removeAttr('disabled');
                        $('#z-thr-value').removeAttr('disabled');
                        $('#z-time-multi-value').removeAttr('disabled');
                        $('#z-time-value').removeAttr('disabled');
                        
                        bluetoothSerial.subscribe('\n',
                            function (data) {
                            app.show("Read: " + data);
                            
                            if ( data.search("f") >= 0 ) {
                                //bluetoothSerial.write("f\n");
                                window.plugins.keydriver.broadcastKey('KEYCODE_MEDIA_NEXT', function(ret) {true;});
                            } else {
                                if ( data.search("p") >= 0 ) {
                                    //bluetoothSerial.write("p\n");
                                    window.plugins.keydriver.broadcastKey('KEYCODE_MEDIA_PLAY_PAUSE', function(ret) {true;});
                                }
                            }                            
                            },
                            function(error) {
                                // TODO: unsubscribe!
                                app.show("Read failure: " + error);
                            }
                        );
                    },
                    function(error) {
                        app.show("Connection failure: " + error, true);
                    }
                );
            });

            $('#disconnect-bttn').click(function() {
                app.show("Disconnected from: " + current_address);
                bluetoothSerial.unsubscribe(
                    function(data) {
                        app.show("Unsubscribe: " + data);
                        var disconnect = function () {
                            app.show("Clearing buffer");
                            bluetoothSerial.clear(
                                function(data) {
                                    app.show("Buffer cleared: " + data);
                                },
                                function(error) {
                                    app.show("Clear failed: " + error, true);
                                }
                            );

                            app.show("Attempting to disconnect");
                            bluetoothSerial.disconnect(
                                function() {
                                    app.show("Disconnected: " + address);
                                },
                                function(error) {
                                    app.show("Disconnet failure: " + error);
                                }
                            );
                        };

                        // here's the real action of the manageConnection function:
                        bluetoothSerial.isConnected(disconnect, 
                            function() {
                                app.show("Device not connected");
                            }
                        );
                    },
                    function(error) {
                        app.show("Unsubscribe failure: " + error, true)
                    }
                );
                $(this).attr("disabled", "disabled");
                $('#z-thr-value').attr("disabled", "disabled");
                $('#z-time-multi-value').attr("disabled", "disabled");
                $('#z-time-value').attr("disabled", "disabled");
            });

            // Tap values
            var z_current_thr = null;
            $('#z-thr-value').change(function() {
                z_current_thr = this.value;
                bluetoothSerial.isConnected(
                    function() { 
                        bluetoothSerial.write(z_current_thr + "\n");
                        //app.show("THR sent: " + z_current_thr);
                    },
                    function(error) { 
                        app.show("Bluetooth is *not* connected");
                    }
                ); 
                
            });
            var z_current_m_time = null;
            $('#z-time-multi-value').change(function() {
                z_current_m_time = this.value;
                bluetoothSerial.isConnected(
                    function() { 
                        bluetoothSerial.write(z_current_m_time + "\n");
                        //app.show("Time multi sent: " + z_current_m_time);
                    },
                    function(error) { 
                        app.show("Bluetooth is *not* connected");
                    }
                ); 
            });
            var z_current_t_time = null;
            $('#z-time-value').change(function() {
                z_current_t_time = this.value;
                bluetoothSerial.isConnected(
                    function() { 
                        bluetoothSerial.write(z_current_t_time + "\n");
                        //app.show("Tap time sent: " + z_current_t_time);
                    },
                    function(error) { 
                        app.show("Bluetooth is *not* connected");
                    }
                ); 
            });
            //  Tap end

            // player
            $('#playpause-bttn').click(function() {
                window.plugins.keydriver.broadcastKey('KEYCODE_MEDIA_PLAY_PAUSE', function(ret) {
                    alert("Success: " + ret);
                }, function(err) {
                    alert("Failed: " + err);
                });
            });
            $('#prev-bttn').click(function() {
                window.plugins.keydriver.broadcastKey('KEYCODE_MEDIA_PREVIOUS', function(ret) {
                    alert("Success: " + ret);
                }, function(err) {
                    alert("Failed: " + err);
                });
            });
            $('#next-bttn').click(function() {
                window.plugins.keydriver.broadcastKey('KEYCODE_MEDIA_NEXT', function(ret) {
                    alert("Success: " + ret);
                }, function(err) {
                    alert("Failed: " + err);
                });
            });
        }, false);
    },
    show: function(msg, error) {
        if(error) msg = '<p style="color: red; font-weight: bold">' + msg + '</p>';
        else msg = '<p>' + msg + '</p>';
        $('#deviceready').append(msg);
    },
    clear: function() {
        $('#deviceready').empty();
    }
};
