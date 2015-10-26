angular
    .module('jackalMqtt.services')
    .factory('mqttService', MqttService);
    .factory('dataService', DataService);


DataService.$inject = [];

function DataService () {
    var service = {
        data: {  }
    };

    return service;
}


MqttService.$inject = ['$rootScope', 'dataService'];

function MqttService($rootScope, dataService) {
    var mqttc;
    var callback = {  };

    function onConnect() {
        $rootScope.$broadcast('connected');
    };

    function onConnectionLost(responseObject) {
        if(responseObject.errorCode !== 0)
            $rootScope.$broadcast('connectionLost');
    };

    function onMessageArrived(message) {
        var payload = message.payloadString;
        var destination = message.destinationName;

        for (var key in callback){
            var reg = "^";
            var levels = key.split("/");

            for (var lvl in levels){
                if(lvl === "+")
                    reg.concat("([a-z]|[0-9])+");

                else if(lvl === "*")
                    reg.concat("(([a-z]|[0-9])|/)*");

                else
                    reg.concat(lvl.concat("/"));
            }

            reg.concat("$");
            reg = new RegExp(reg);

            if(reg.test(payload)){
                dataService.data = {
                    callback[key][1]: JSON.parse(payload);
                }

                $rootScope.$broadcast(callback[key][0]);

                break;
            }
        }
    };

    function connect(host, port, options) {
        mqttc = Paho.MQTT.Client(host, Number(port), "web_client_" + Math.random());

        mqttc.onConnectionLost = onConnectionLost;
        mqttc.onMessageArrived = onMessageArrived;

        mqttc.connect(options);
    };

    function disconnect() {
        mqttc.disconnect();
    };

    function subscribe(chanel, callback_name, data_name) {
        mqttc.subscribe(chanel);

        callback[chanel] = [callback_name, data_name];
    };

    function unsubscribe(chanel) {
        mqttc.unsubscribe(chanel);

        delete callback[chanel];
    };

    function publish(chanel, message, retained) {
        var payload = JSON.stringify(message);
        var mqttMessage = new Paho.MQTT.Message(payload);

        mqttMessage.retained = retained;
        mqttMessage.detinationName = chanel;

        mqttc.send(mqttMessage);
    };

    return  = {
        connect: connect,
        disconnect: disconnect,

        subscribe: subscribe,
        unsubscribe: unsubscribe,

        publish: publish

        /** TEST_CODE **/
        ,_onConnect: onConnect
        ,_onConnectionLost: onConnectionLost
        ,_onMessageArrived: onMessageArrived
        /** TEST_CODE **/
    };

;
}
