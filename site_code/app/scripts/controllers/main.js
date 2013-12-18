'use strict';

var controllers = angular.module('NYCCampFi.controllers', []);

controllers.controller('MainCtrl', function ($scope, $http) {
    $http.get('/api/awesomeThings').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });
  });

controllers.controller('CandidateListCtrl', function ($scope, $http) {
    $http.get('/api/candidates').success(function(candidates) {
        $scope.candidates = candidates;
        console.log('candidates     : ' + candidates);
      });
  });

controllers.controller('OfficeListCtrl', function ($scope, $http) {
    $http.get('/api/offices').success(function(offices) {
        $scope.offices = offices;
        console.log('offices     : ' + offices);
    });
});

controllers.controller('OfficeCandidateListCtrl', function ($scope, $routeParams, $http) {
        $scope.officeId = $routeParams.officeId;
        $scope.url = '/api/offices/' + $scope.officeId;
        $http.get('/api/offices/' + $routeParams.officeId).success(function(candidates) {
            $scope.candidates = candidates;
            console.log('office ' + $routeParams.officeId + '      : ' + candidates);
        });
});
