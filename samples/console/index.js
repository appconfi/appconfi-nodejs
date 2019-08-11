var Appconfi = require("appconfi");

var manager = new Appconfi({
    env: '[default]',
    app: 'dc97d669-1460-4602-8ae3-2a35b2708df7',
    apiKey: 'a7822a44-af94-4f0c-9337-7c31f2fe33af',
    refreshInterval: 2
});

 manager.startMonitoring();

manager.isFeatureEnabled('my_awesome_feature').then(function(value){
    console.log('my_awesome_feature',value);
}).catch(function(error){
    console.log(error);
});

manager.getSetting('my_application_setting').then(function(value){
    console.log('my_application_setting',value);
}).catch(function(error){
    console.log(error);
});
