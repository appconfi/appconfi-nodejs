var Appconfi = require("../../src/index");

var manager = new Appconfi({
    env: '[default]',
    app: 'dc97d669-1460-4602-8ae3-2a35b2708df7',
    apiKey: 'a7822a44-af94-4f0c-9337-7c31f2fe33af'
});

manager.getSetting('application.color').then(function(value){
    console.log(value);
}).catch(function(error){
    console.log(error);
});