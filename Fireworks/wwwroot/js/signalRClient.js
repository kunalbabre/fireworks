function startSignalR(options) {
    var connection = null;
    var maxRetry = 50;
    var connectionAttempt = 0;
    document.addEventListener('DOMContentLoaded', function () {


        // Start the connection.
        connection = new signalR.HubConnectionBuilder()
            .withUrl('/firehub')
            .build();

        start(connection);

        connection.onclose(data => {
            options.showConnectionStatusMessage('Not Connected');
            setTimeout(function () { start(connection); }, 1000);

        });


        // Create a function that the hub can call to firework messages.
        connection.on('broadcastFirework', function () {
            options.receivedSingle();
            options.showMessage("Processing a single-shot request...");
        });

        connection.on('multiFirework', function () {
            options.receivedMulti();
            options.showMessage("Processing a multi-shot request...");
        });

        connection.on('heartbeat', function (isCrashed,usingRedis,usingAzureSignalr) {
            options.updateCrashStatus(isCrashed);
            options.updateBackplaneStatus(usingRedis, usingAzureSignalr);
        });

        function start(conn) {
            options.showConnectionStatusMessage('Connecting...attempt: ' + connectionAttempt + " of " + maxRetry);
            // Transport fallback functionality is now built into start.
            conn.start()
                .then(function () {
                    options.showConnectionStatusMessage('Connected');
                    connectionAttempt = 0;
                    registerSignalREvent(conn, options.sendSingleId, 'click', 'SendSingleShot');
                    registerSignalREvent(conn, options.sendMultiId, 'click', 'SendMultiShot');
                    registerSignalREvent(conn, options.sendCrashId, 'click', 'CrashMe');
                    registerSignalREvent(conn, options.sendTryResolveId, 'click', 'CrashMe');
                    conn.invoke('HeartBeat');
                })
                .catch(error => {
                    options.showMessage(error.message);
                    if (++connectionAttempt < maxRetry) {
                       // options.showConnectionStatusMessage("Trying to connect again... attempt: " + connectionAttempt + " of " + maxRetry);
                        setTimeout(function () { start(conn); }, 1000 + 10 * connectionAttempt);
                    } else {
                        options.showConnectionStatusMessage("Cannot connect :(");
                    }


                });
        }

        function registerSignalREvent(conn, id, eventName, invokeMethod) {
            element = document.getElementById(id);
            if (element) {
                element.outerHTML = element.outerHTML;//remove all Event Listener;

                document.getElementById(id).addEventListener(eventName, function (event) {
                    // Call the invokeMethod method on the hub.
                    conn.invoke(invokeMethod);
                    event.preventDefault();
                });
            }
        }

    });
}