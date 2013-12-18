'use strict';

var services = angular.module('NYCCampFi.services', ['ngResource']);

services.factory('Office', ['$resource', function ($resource) {
    return $resources('/offices/:officeId', {officeId: '@officeId'});
}]);


services.factory('AllOffices', ['Office', '$q', function(Office, $q) {
    return function () {

    }
}]);