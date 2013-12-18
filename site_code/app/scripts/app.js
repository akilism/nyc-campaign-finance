'use strict';

var nycCampaignFinanceApp = angular.module('NYCCampFi', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'NYCCampFi.controllers'
]);

nycCampaignFinanceApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/office_list.html',
        controller: 'OfficeListCtrl'
      })
      .when('/office', {
        templateUrl: 'partials/office_list.html',
        controller: 'OfficeListCtrl'
      })
      .when('/office/:officeId', {
        templateUrl: 'partials/candidate_list.html',
        controller: 'OfficeCandidateListCtrl'
      })
      .when('/candidates', {
        templateUrl: 'partials/candidate_list.html',
        controller: 'CandidateListCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  });
