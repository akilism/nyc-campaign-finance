'use strict';

var services = angular.module('NYCCampFi.services', ['ngResource']);

var getPath = function(path) {
  if (path === '/') { return '/api/office/'; }
  return '/api' + path;
};

services.factory('Requestor', ['$http', '$q', function($http, $q) {
    return function (path, candidate) {
      var deferred = $q.defer();
      var apiPath = getPath(path);
      var count = 10;

      var getDefer = function () { $http.get(apiPath).success(function(data) {
          deferred.resolve(data);
        });

        return deferred.promise;
      };

      var getExtra = function (path, data, key) {
        var defer = $q.defer();

        $http.get(path).success(function (d) {
            data[key] = d;
            defer.resolve(data);
          });

        return defer.promise;
      };

      if (candidate) {
        $http.get(apiPath).then(function (res) {
          var data = res.data;
              return getExtra(apiPath + '/zip_codes/' + 1, data, 'zip_codes')
                  .then(function(d) { return getExtra(apiPath + '/occupations/' + count, data, 'occupations'); })
                  .then(function(d) { return getExtra(apiPath + '/contributors/' + count, data, 'contributors'); })
                  .then(function(d) { return getExtra(apiPath + '/employers/' + count, data, 'employers'); })
                  .then(function (d) { deferred.resolve(data); });
        });

        return deferred.promise;
      }

      return getDefer();
    };
}]);
