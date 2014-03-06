'use strict';

var app = angular.module('NYCCampFi');
app.directive('loader', ['$rootScope', function ($rootScope) {
  return {
    template: '<div id="loader" class="loader spinner"></div>',
    restrict: 'E',
    controller: app.Loader,
    controllerAs: 'loader',
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
}]);


app.Loader = function ($scope, $element, $attrs) {
  if(document.getElementById('loader')) {
    var cl = new CanvasLoader('loader');
    cl.setColor('#598f08'); // default is '#000000'
    cl.setShape('rect'); // default is 'oval'
    cl.setDiameter(88); // default is 40
    cl.setDensity(77); // default is 40
    cl.setRange(0.7); // default is 1.3
    cl.setSpeed(1); // default is 2
    cl.setFPS(30); // default is 24
    cl.show(); // Hidden by default
  }
};

app.Loader.$inject = ['$scope', '$element', '$attrs'];


