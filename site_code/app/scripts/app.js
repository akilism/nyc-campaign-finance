'use strict';

var nycCampaignFinanceApp = angular.module('nycCampaignFinanceApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'campFiControllers'
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
      .when('/office/:office_id', {
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
