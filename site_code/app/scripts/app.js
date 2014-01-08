'use strict';

var nycCampaignFinanceApp = angular.module('NYCCampFi', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'd3',
  'NYCCampFi.controllers'
]);

nycCampaignFinanceApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/office_list.html',
        controller: 'OfficeListController'
      })
      .when('/office', {
        templateUrl: 'partials/office_list.html',
        controller: 'OfficeListController'
      })
      .when('/zip_code', {
          templateUrl: 'partials/zip_code_list.html',
          controller: 'ZipCodeListController'
      })
      .when('/office/:officeId', {
        templateUrl: 'partials/candidate_list.html',
        controller: 'OfficeCandidateListController'
      })
      .when('/candidate', {
        templateUrl: 'partials/candidate_list.html',
        controller: 'CandidateListController'
      })
      .when('/candidate/:candidateId', {
          templateUrl: 'partials/candidate_details.html',
          controller: 'CandidateDetailsController'
      })
      .when('/candidate/:candidateId/monthly', {
          templateUrl: 'partials/candidate_monthly.html',
          controller: 'CandidateMonthlyController'
      })
      .when('/city/', {
          templateUrl: 'partials/city.html',
          controller: 'CityController'
      })
        .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
}]);
