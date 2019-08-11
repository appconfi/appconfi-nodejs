# Appconfi

[Appconfi](https://www.appconfi.com) - Service to centrally manage application settings and feature toggles for applications and services.

## Installation

The Appconfi NodeJS SDK is available as a NPM package, to install run the following command in your package.json folder
```
npm install --save appconfi
```
More info is available on [npm](https://www.npmjs.com/package/appconfi)

## Usage

In order to use the Appconfi you will need to [create an account](https://appconfi.com/account/register).

From there you can create your first application and setup your configuration. To use the Appconfi API to access your configuration go to `/accesskeys` there you can find the `application_id` and your `application_key`.

## How to use

```js

var manager = new Appconfi({
    env: '[default]',
    app: 'dc97d669-0000-4602-5661-2a35b2708df7',
    apiKey: '12548-af94-4f0c-9337-7c31f2fe33af',
    refreshInterval: 2
});
manager.startMonitoring();

//Feature toggle
manager.isFeatureEnabled('my_awesome_feature').then(function(value){
    console.log('my_awesome_feature',value);
}).catch(function(error){
    console.log(error);
});

//Application setting
manager.getSetting('my_application_setting').then(function(value){
    console.log('my_application_setting',value);
}).catch(function(error){
    console.log(error);
});

```
## Contributing

Contributions are welcome.

## Links

 * [Web](https://appconfi.com)
