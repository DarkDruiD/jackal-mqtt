describe('mqttService', function() {

    // Load the module
    beforeEach(module('jackalMqtt.services'));

    // Inject the MQTT Service
    beforeEach(inject(function(_mqttService_){
        mqttService = _mqttService_;
    }));

    // Inject the Data Service
    beforeEach(inject(function(_dataService_){
        dataService = _dataService_;
    }));

    describe('mqttService', function() {

        it('Should Eexist', function() {
            mqttService.should.be.ok;
        });

        describe('addCallback()', function() {
            var tests = [
                {
                    data: ['myhome/ground/floor/livingroom/temperature', 'onTemp', 'temp']
                },

                {
                    data: ['myhome/groundfloor/+/temperature', 'onTemp', 'temp']
                },

                {
                    data: ['myhome/groundfloor/#', 'onFloorData', 'floor']
                }
            ];


            tests.forEach(function(test){
                var text = (
                                'Should be the key: ' + test.data[0]
                                + '. First position of array: ' + test.data[1]
                                + '. Second position of array: ' + test.data[2]
                )

                it(text, function(){
                    var chanel = test.data[0];
                    var callbackName = test.data[1];
                    var dataName = test.data[2];

                    mqttService._addCallback(chanel, callbackName, dataName);

                    mqttService._callbacks.should.have.property(chanel);
                    mqttService._callbacks[chanel][0].should.equal(callbackName);
                    mqttService._callbacks[chanel][1].should.equal(dataName);
                });
            });
        });

        describe('onMessageArrived', function() {
            var tests = [
                {
                    chanel: 'myhome/ground/floor/livingroom/temperature',

                    destinations: [
                        'myhome/ground/floor/livingroom/temperature'
                    ],

                    fails: [
                        'a/b/c',
                        'myhome/data',
                        'data/myhome'
                    ]
                },

                {
                    chanel: 'myhome/groundfloor/+/temperature',

                    destinations: [
                        'myhome/groundfloor/myroom/temperature',
                        'myhome/groundfloor/livingroom/temperature',
                        'myhome/groundfloor/kitchen/temperature'
                    ],

                    fails: [
                        'my/home/groundfloor/data/data/temperature',
                        'a/b/c',
                        'data/science'
                    ]
                },

                {
                    chanel: 'myhome/groundfloor/#',

                    destinations: [
                        'myhome/groundfloor/kitchen/sync',
                        'myhome/groundfloor/livingroom/light',
                        'myhome/groundfloor/myroom/sensors/temperature',
                        'myhome/groundfloor/left/data/livingroom/data/sensor'
                    ],

                    fails: [
                         'a/b/c',
                         'myhome/topfloor/left/kitchen/data',
                         'myhome/detest/fun'
                    ]
                }
            ];

            tests.forEach(function(test){
                for(var ind in test.destinations) {
                    var dest = test.destinations[ind];

                    var text = (
                        'Should match the chanel: ' + test.chanel + ' with: ' + dest
                    );

                    it(text, function(){
                        mqttService._chanelMatch(test.chanel, dest).should.equal(true);
                    });
                };

                for(var ind in test.fails) {
                    var fail = test.fails[ind];

                    var text = (
                        'Should not match the chanel: ' + test.chanel + ' with: ' + fail
                    );

                    it(text, function() {
                        mqttService._chanelMatch(test.chanel, fail).should.equal(false);
                    });
                };
            });
        });
    });
});
