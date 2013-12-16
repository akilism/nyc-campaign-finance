'use strict';

var campFiControllers = angular.module('campFiControllers', []);

campFiControllers.controller('MainCtrl', function ($scope, $http) {
    $http.get('/api/awesomeThings').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });
  });

campFiControllers.controller('CandidateListCtrl', function ($scope, $http) {
    $http.get('/api/candidates').success(function(candidates) {
        $scope.candidates = candidates;
        console.log('candidates     : ' + candidates);
      });
  });

campFiControllers.controller('OfficeListCtrl', function ($scope, $http) {
    $http.get('/api/offices').success(function(offices) {
        $scope.offices = offices;
        console.log('offices     : ' + offices);
    });
});

campFiControllers.controller('OfficeCandidateListCtrl', function ($scope, $routeParams, $http) {
        $scope.office_id = $routeParams.office_id;
        $scope.url = '/api/offices/' + $scope.office_id;
        $http.get('/api/offices/' + $scope.office_id).success(function(candidates) {
            $scope.candidates = candidates;
            console.log('office ' + $scope.office_id + '      : ' + candidates);
        });
});
