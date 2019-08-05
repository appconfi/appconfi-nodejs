'use strict';

var request = require('request');
var version = require('../package.json').version;

var appconfi = function (config) {
    if (!this || this.constructor !== appconfi) {
        throw new Error('Appconfi must be called as a constructor');
    }

    this.config = config;
    this.urls = {
        api: 'https://appconfi.com'
    };
};


appconfi.prototype._httpCall = function (method, path, callback, optionsToOmit) {
    var settings = {
        method: method,
        url: path,
        gzip: true,
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Appconfi Node - ' + version
        },
        qsStringifyOptions: { arrayFormat: 'brackets' }
    };

    return new Promise(function (resolve, reject, callback) {
        request(settings, function (error, result, body) {
            if (error || result.statusCode >= 400) {
                var err = new Error(JSON.stringify(body));

                if (result && result.statusCode) {
                    err.statusCode = result.statusCode;
                }

                err.error = {
                    url: path,
                    entity: body
                };

                if (callback) {
                    callback(err);
                } else {
                    reject(err);
                }
            } else {
                if (callback) {
                    callback(null, body);
                } else {
                    resolve(body);
                }
            }
        });
    });
};


appconfi.prototype._httpGet = function (path) {
    return this._httpCall('GET', this.urls.api + path);
};

appconfi.prototype._buildPath = function (path) {

    var env = this.config.env;
    var app = this.config.app;
    var apiKey = this.config.apiKey;

    return path + '?env=' + env + '&app=' + app + '&key=' + apiKey;
};

appconfi.prototype._getVersion = function () {

    var path = this._buildPath('/api/v1/configurations/version');
    return this._httpGet(path);

};

appconfi.prototype._checkConfiguration = function () {

    var self = this;

    //TODO: Check for last version if monitoring

    return this._getVersion().then(function(version){
        var path = self._buildPath('/api/v1/configurations');
        return self._httpGet(path).then(function(configuration){
            self.appConfiguration = configuration;
        });
    });
    

};


appconfi.prototype._getSettingFromCache = function (setting) {

    var self = this;
    return self.appConfiguration.settings[setting];
};


appconfi.prototype.getSetting = function (setting) {

    var self = this;
    
    return new Promise(function (resolve, reject, callback) {

        //If not monitoring
        if(!self.isMonitoring() && self.appConfiguration != null){
            return resolve(self._getSettingFromCache(resolve));
        }

        //Check for refresh interval

        //Check for lastest configuration
        self._checkConfiguration().then(function(){
            self.cacheVersion = Date.now();
            return resolve(self._getSettingFromCache(resolve));
        });
    });
};


appconfi.prototype.isFeatureEnabled = function (setting) {

};

appconfi.prototype.startMonitoring = function () {
    var self = this;
    self.monitoring = true;
};

appconfi.prototype.stopMonitoring = function () {
    var self = this;
    self.monitoring = false;
};

appconfi.prototype.isMonitoring = function () {
    var self = this;
    return self.monitoring;
};



module.exports = appconfi;