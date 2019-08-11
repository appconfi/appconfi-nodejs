'use strict';

var request = require('request');
var version = require('../package.json').version;

var appconfi = function (config) {
    if (!this || this.constructor !== appconfi) {
        throw new Error('Appconfi must be called as a constructor');
    }
    if(!config.app) {
        throw new Error('Invalid configuration. Undefined app');
    }
    if(!config.apiKey) {
        throw new Error('Invalid configuration. Undefined apiKey');
    }

    if(config.refreshInterval && config.refreshInterval < 2) {
        throw new Error('Invalid configuration. Min value allowed for refreshInterval is 2 minutes');
    }

    this.config = config;
    this.monitoring = false;
    this.configurationVersion = -1;

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
            'User-Agent': 'Appconfi-NodeJS - ' + version,
            'X-Appconfi-UA': 'AppConfi-Client NodeJS v' + version
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
    
    return new Promise(function (resolve, reject, callback) {
        self._getVersion().then(function (version) {

            if(self.configurationVersion == version){
                self.configurationVersion = version;
                resolve();
            }

            var path = self._buildPath('/api/v1/configurations');
            
            self._httpGet(path).then(function (configuration) {
                self.configurationVersion = version;
                self.appConfiguration = configuration;
                resolve();
            });

        });  
    });
};

appconfi.prototype._getSettingFromCache = function (setting) {

    var self = this;
    return self.appConfiguration.settings[setting];

};

appconfi.prototype._isFeatureEnabledFromCache = function (toggle) {

    var self = this;
    return self.appConfiguration.toggles[toggle] == "on";
    
};

appconfi.prototype._validCache = function () {
    if(!this.isMonitoring())
        return true;

    var now = new Date(),
        afterCacheIsInvalid = new Date(this.cacheVersion);

    afterCacheIsInvalid.setMinutes(afterCacheIsInvalid.getMinutes() + this.config.refreshInterval);

    return now <= afterCacheIsInvalid;

};

appconfi.prototype.getSetting = function (setting) {

    var self = this;

    return new Promise(function (resolve, reject, callback) {

        //If not monitoring
        if (self.appConfiguration != null && (!self.isMonitoring() || self._validCache())) {
            return resolve(self._getSettingFromCache(setting));
        }

        //Check for lastest configuration
        self._checkConfiguration().then(function () {
            self.cacheVersion = Date.now();
            resolve(self._getSettingFromCache(setting));
        });
    });
};

appconfi.prototype.isFeatureEnabled = function (toggle) {
    var self = this;

    return new Promise(function (resolve, reject, callback) {

        //If not monitoring
        if (self.appConfiguration != null && (!self.isMonitoring() || self._validCache())) {
            return resolve(self._isFeatureEnabledFromCache(toggle));
        }

        //Check for lastest configuration
        self._checkConfiguration().then(function () {

            self.cacheVersion = Date.now();
            var result = self._isFeatureEnabledFromCache(toggle);

            return resolve(result);

        });
    });
};

appconfi.prototype.startMonitoring = function () {
    
    if(!this.config.refreshInterval){
        this.config.refreshInterval = 5;
    }

    if(this.config.refreshInterval < 2) {
        throw new Error('Invalid configuration. Min value allowed for refreshInterval is 2 minutes');
    }
   
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