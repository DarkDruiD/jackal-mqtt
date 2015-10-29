(function (angular) {

    // Create all modules and define dependencies to make sure they exist
    // and are loaded in the correct order to satisfy dependency injection
    // before all nested files are concatenated by Gulp

    // Config
    angular
        .module('jackalMqtt.config', [])
        .value('jackalMqtt.config', {
            debug: true
        });

    // Modules
    angular
        .module('jackalMqtt.services', []);

    angular
        .module('jackalMqtt', [
            'jackalMqtt.config',
            'jackalMqtt.services'
        ]);

})(angular);

angular
    .module('jackalMqtt.services')
    .factory('mqttService', MqttService)
    .factory('dataService', DataService);


DataService.$inject = [  ];

function DataService () {
    var service = {
        data: {  }
    };

    return service;
}


MqttService.$inject = ['$rootScope', 'dataService'];

function MqttService ($rootScope, dataService) {
    var mqttc;
    var callbacks = {  };

    var Paho = Paho;

    function addCallback(chanel, callbackName, dataName) {
        callbacks[chanel] = [callbackName, dataName];
    }

    function deleteCallback(chanel){
        delete callbacks[chanel];
    }

    function chanelMatch(chanel, destination) {
        var reg = '^';

        destination += '/';
        var levels = chanel.split('/');

        for (var ind = 0; ind < levels.length; ind++){
            var lvl = levels[ind];

            if(lvl === '+'){
                reg = '([a-z]|[0-9])+/';

            }else if(lvl === '#'){
                reg += '(([a-z]|[0-9])|/)*';

            }else{
                reg += (lvl + '/');
            }
        }

        reg += '$';
        reg = new RegExp(reg);

        if(reg.test(destination)){
            return true;
        }

        return false;
    }

    function onConnect() {
        $rootScope.$broadcast('connected');
    }

    function onConnectionLost(responseObject) {
        if(responseObject.errorCode !== 0){
            $rootScope.$broadcast('connectionLost');
        }
    }

    function onMessageArrived(message) {
        var payload = message.payloadString;
        var destination = message.destinationName;

        for (var key = 0; key < callbacks.length; key++) {
            var match = chanelMatch(key, destination);

            if(match){
                dataService.data[callbacks[key][1]] = JSON.parse(payload);
                $rootScope.$broadcast(callbacks[key][0]);
            }
        }
    }

    function connect(host, port, options) {
        mqttc = new Paho.MQTT.Client(host, Number(port), 'web_client_' + Math.random());

        mqttc.onConnectionLost = onConnectionLost;
        mqttc.onMessageArrived = onMessageArrived;

        mqttc.connect(options);
    }

    function disconnect() {
        mqttc.disconnect();
    }

    function subscribe(chanel, callbackName, dataName) {
        mqttc.subscribe(chanel);
        addCallback(chanel, callbackName, dataName);
    }

    function unsubscribe(chanel) {
        mqttc.unsubscribe(chanel);
        deleteCallback(chanel);
    }

    function publish(chanel, message, retained) {
        var payload = JSON.stringify(message);
        var mqttMessage = new Paho.MQTT.Message(payload);

        mqttMessage.retained = retained;
        mqttMessage.detinationName = chanel;

        mqttc.send(mqttMessage);
    }

    return {
        connect: connect,
        disconnect: disconnect,

        subscribe: subscribe,
        unsubscribe: unsubscribe,

        publish: publish,


        /** TEST CODE **/
        _addCallback: addCallback,
        _deleteCallback: deleteCallback,
        _chanelMatch: chanelMatch,
        _callbacks: callbacks
        /** TEST CODE **/

    };
}
