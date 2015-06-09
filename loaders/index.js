'use strict';
var config                  = require('../lib/config');
var entitiesConstructor     = require('./includes/entitiesConstructor');
var spreadSheetHandler      = require('./includes/spreadSheetHandler');
var dbTransactions          = require('./includes/dbTransactions');
var Promise                 = require('bluebird');

var REGISTRY_FULL_DATA = false;
var MAIN_CONFIG_FULL_DATA = false;

var indexLoader = {
    loadRegistryData: function () {
        var registryUrl = getRegistryUrl();

        try {
            return spreadSheetHandler.parse(registryUrl).spread(function (err, parsedRegistry) {
                setRegistryFullData(parsedRegistry);
                return [false, true];
            });
        } catch (e) {
            return new Promise(function (resolve, reject) {
                resolve(['request failed', false]);
            });
        }
    },
    savePlacesToDb: function () {
        return this.loadRegistryData().spread(function (err, loadResult) {
            if (err) {
                return [err, false];
            } else {
                var registryData = getRegistryFullData();
                return Promise.each(registryData, function (signleRegistryObject) {
                    var configUrl = getConfigUrlFromRegistry(signleRegistryObject);
                    var placesUrlKey = spreadSheetHandler.getPlacesUrlKey(configUrl);
                    var placesSpreadSheetUrl = spreadSheetHandler.getPlacesSpreadSheetUrl(placesUrlKey);

                    return spreadSheetHandler.parse(placesSpreadSheetUrl).spread(function (err, parsedPlaces) {
                        if (err) {
                            return [err, false];
                        } else {
                            var site = getSiteValue(signleRegistryObject);
                            var mappedPlaces = false;
                            parsedPlaces = entitiesConstructor.setSiteValue(parsedPlaces, site);
                            mappedPlaces = entitiesConstructor.mapPlaces(parsedPlaces);
                            return dbTransactions.savePlaces(mappedPlaces);
                        }
                    });
                }).then(function () {
                    return dbTransactions.getAllPlaces();
                });
            }
        });
    },
    saveDatasetsToDb: function () {
        return this.loadRegistryData().spread(function (err, loadResult) {
            if (err) {
                return [err, false];
            } else {
                var registryData = getRegistryFullData();
                return Promise.each(registryData, function (signleRegistryObject) {
                    var configUrl = getConfigUrlFromRegistry(signleRegistryObject);
                    var datasetsUrlKey = spreadSheetHandler.getDatasetsUrlKey(configUrl);
                    var datasetsSpreadSheetUrl = spreadSheetHandler.getDatasetsSpreadSheetUrl(datasetsUrlKey);

                    return spreadSheetHandler.parse(datasetsSpreadSheetUrl).spread(function (err, parsedDatasets) {
                        if (err) {
                            return [err, false];
                        } else {
                            var site = getSiteValue(signleRegistryObject);
                            var mappedDatasets = false;

                            parsedDatasets = entitiesConstructor.setSiteValue(parsedDatasets, site);
                            mappedDatasets = entitiesConstructor.mapDatasets(parsedDatasets);
                            return dbTransactions.saveDatasets(mappedDatasets);

                        }
                    });
                }).then(function () {
                    return dbTransactions.getAllDatasets();
                });
            }
        });
    },
    saveQuestionsToDb: function () {
        return this.loadRegistryData().spread(function (err, loadResult) {
            if (err) {
                return [err, false];
            } else {
                var registryData = getRegistryFullData();
                return Promise.each(registryData, function (signleRegistryObject) {
                    var configUrl = getConfigUrlFromRegistry(signleRegistryObject);
                    var questionsUrlKey = spreadSheetHandler.getQuestionsUrlKey(configUrl);
                    var questionsSpreadSheetUrl = spreadSheetHandler.getQuestionsSpreadSheetUrl(questionsUrlKey);

                    return spreadSheetHandler.parse(questionsSpreadSheetUrl).spread(function (err, parsedQuestions) {
                        if (err) {
                            return [err, false];
                        } else {
                            var site = getSiteValue(signleRegistryObject);
                            var mappedQuestions = false;

                            parsedQuestions = entitiesConstructor.setSiteValue(parsedQuestions, site);
                            mappedQuestions = entitiesConstructor.mapQuestions(parsedQuestions);
                            return dbTransactions.saveQuestions(mappedQuestions);
                        }
                    });
                }).then(function () {
                    return dbTransactions.getAllQuestions();
                });
            }
        });
    },
    saveRegistryToDb: function () {
        return this.loadRegistryData().spread(function (err, loadResult) {
            if (err) {
                return [err, false];
            } else {
                var registryData = getRegistryFullData();
                var mappedRegistry = false;
                mappedRegistry = entitiesConstructor.mapRegistry(registryData);
                return dbTransactions.saveRegistry(mappedRegistry).then(function (err, saveResult) {
                    if (err) {

                    } else {
                        return dbTransactions.getAllRegistry();
                    }
                });
            }
        });
    },
    saveConfigToDb: function () {
        return this.loadRegistryData().spread(function (err, loadResult) {
            if (err) {
                return [err, false];
            } else {
                var registryData = getRegistryFullData();
                return Promise.each(registryData, function (signleRegistryObject) {
                    var configUrl = getConfigUrlFromRegistry(signleRegistryObject);
                    return spreadSheetHandler.parse(configUrl).spread(function (err, parsedConfig) {
                        if (err) {
                            return [err, false];
                        } else {
                            var mappedConfig = false;
                            var deparsedConfig = false;
                            var site = getSiteValue(signleRegistryObject);
                            
                            deparsedConfig = entitiesConstructor.deparseConfig(parsedConfig);
                            deparsedConfig = entitiesConstructor.setConfigId(deparsedConfig, site);
                            mappedConfig = entitiesConstructor.mapConfig(deparsedConfig);

                            return dbTransactions.saveConfig(mappedConfig);
                        }
                    });
                }).then(function () {
                    return dbTransactions.getAllConfigs();
                });
            }
        });
    }
};

function setRegistryFullData(data) {
    REGISTRY_FULL_DATA = data;
}

function setMainConfigFullData(data) {
    MAIN_CONFIG_FULL_DATA = data;
}

function getRegistryFullData() {
    return REGISTRY_FULL_DATA;
}

function getMainConfigFullData() {
    return MAIN_CONFIG_FULL_DATA;
}


function getConfigUrlFromRegistry(registry) {
    var configUrl = false;
    configUrl = registry['configurl'] || false;
    return configUrl;
}

function getSiteValue(object) {
    var site = false;
    site = object['censusid'];
    return site;
}

function getRegistryUrl() {
    var registryUrl = false;
    registryUrl = config.get('registryUrl') || false;
    return registryUrl;
}

module.exports = indexLoader;

//var getRegistry = function() {
//
//};
//
//var getConfig = function(site_id) {
//
//};
//
//var getPlaces = function(site_id) {
//
//};
//
//var getDatasets = function(site_id) {
//
//};
//
//var getQuestions = function(site_id) {
//
//};
//
//var _migrateDatabase = function() {
//
//};
//
//var _migrateUsers = function() {
//
//};

