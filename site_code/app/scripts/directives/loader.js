'use strict';

angular.module('NYCCampFi')
  .directive('loader', function ($rootScope) {
    return {
      template: '<div class="loader ping_span">Loading<span>.</span><span>.</span><span>.</span></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        //element.addClass('hide');

        $rootScope.$on('$routeChangeStart', function () {
          element.removeClass('hide');
        });

        $rootScope.$on('$NYCCampFiLoaded', function () {
          element.addClass('hide');
        })
      }
    };
  });
