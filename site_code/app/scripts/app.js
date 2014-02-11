'use strict';

var nycCampaignFinanceApp = angular.module('NYCCampFi', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'd3',
  'NYCCampFi.services',
  'NYCCampFi.controllers'
]);

nycCampaignFinanceApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

  $routeProvider
      .when('/', {
        templateUrl: 'partials/office_list.html',
        controller: 'OfficeListController',
        resolve: {
          offices: ['Requestor', '$route', '$location', function(Requestor, $route, $location) {
            return Requestor($location.$$path);
          }]
        }
      })
//      .when('/zip_code', {
//          templateUrl: 'partials/zip_code_list.html',
//          controller: 'ZipCodeListController'
//      })
      .when('/office/:officeId', {
        templateUrl: 'partials/candidate_list.html',
        controller: 'OfficeCandidateListController',
        resolve: {
          candidates:['Requestor', '$route', '$location', function(Requestor, $route, $location) {
            return Requestor($location.$$path);
          }]
        }
      })
//      .when('/candidate', {
//        templateUrl: 'partials/candidate_list.html',
//        controller: 'CandidateListController'
//      })
      .when('/candidate/:candidateId', {
          templateUrl: 'partials/candidate_details.html',
          controller: 'CandidateDetailsController',
          resolve: {
            candidate: ['Requestor', '$route', '$location', function(Requestor, $route, $location) {
              return Requestor($location.$$path, true);
            }]
          }
      })
      .when('/candidate/:candidateId/months', {
          templateUrl: 'partials/candidate_monthly.html',
          controller: 'CandidateMonthlyController',
          resolve: {
            months: ['Requestor', '$route', '$location', function(Requestor, $route, $location) {
              return Requestor($location.$$path);
            }]
          }
      })
      .when('/city/', {
          templateUrl: 'partials/city.html',
          controller: 'CityController',
          resolve: {
            city: ['Requestor', '$route', '$location', function(Requestor, $route, $location) {
              return Requestor($location.$$path);
            }]
          }
      })
        .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
}]);


