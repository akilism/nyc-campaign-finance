'use strict';

var nycCampaignFinanceApp = angular.module('NYCCampFi', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'd3',
  'NYCCampFi.controllers'
]);

nycCampaignFinanceApp.config(function ($routeProvider, $locationProvider) {
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
      .when('/candidates', {
        templateUrl: 'partials/candidate_list.html',
        controller: 'CandidateListController'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  });
