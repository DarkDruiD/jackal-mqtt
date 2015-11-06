# Jackal MQTT
---
This is a simple wrapper library of Paho for the sake of use in AngularJs, the interaction with the raw Paho library and AngularJs isn't great so I developed this simple library.

**WARNING:** This library is not intended to use in a production environment due to the extensive use of the $rootScope.$broadcast, I'll be working in a better implementation of this library in the near future.

### How to use it
This library is pretty simple to use you will need to first start your AngularJs app including the JackalMQTT module and connect to the MQTT server like this:

```
angular.module('myApp', [
    'ngRoute',
    'jackalMqtt',
    'myApp.example_view'
])

.run(['$rootScope', 'mqttService', function($rootScope, mqttService){
    var options = {
        timeout: 3,
        useSSL: false,
        cleanSession: true,
        onFailure: function(message) {
            console.log(message);
        }
    };

    mqttService.connect('52.32.149.215', 9001, options);
}])
```

after this you can start using this in your controllers, like the following:
```
.controller('example_view_ctrl', ['$scope', 'mqttService', 'dataService', 
            function($scope, mqttService, dataService){
    $scope.current = 'No Data';

    $scope.$on('connected', function(event){
        mqttService.subscribe('tracker/+', 'onCurrent', 'current');
    });

    $scope.$on('onCurrent', function(event){
        console.log(dataService.data);

        $scope.current = dataService.data.current;
        $scope.$apply();
    });
}]);
```

## The MQTT Service

This service is the one that allows you to bind a specific channel with the $scope.$on event, this is given in the subscribe method, the first parameter is the channel you want to subscribe to, the second refers to the event  you will want, and the third parameter is the name under the one you'll find the data in the data Service, the is why you access the dataService.data.current parameter in the previous example


## The Data Service

This is the place where all your variables will be stored this will match the third parameter passed to the subscribe method of the MQTT Service.
