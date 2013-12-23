'use strict';

var controllers = angular.module('NYCCampFi.controllers', []);

controllers.controller('CandidateListController', function ($scope, $http) {
    $http.get('/api/candidates').success(function(candidates) {
        $scope.candidates = candidates;
      });
  });

controllers.controller('OfficeListController', function ($scope, $http) {

    $http.get('/api/offices').success(function(offices) {
        $scope.offices = offices;

        $scope.officeRenderer = function(el, data) {

            var totalScale = d3.scale.linear().domain([0, d3.max(data, function(obj)  {
                return obj.total;
            })]);

            var setScaleRange = function(min, max) {
                totalScale = totalScale.rangeRound([min, max]);
            };

            var off = el.selectAll('li');
            off.data(offices);
            off.each( function(d, i) {
                setScaleRange(150, 640);
                var scaleValue = totalScale(d.total);
                d3.select(this).style({
                    'background-color': function(d) {
                        console.log('scaleValue:   ' + scaleValue);
                        var r = Math.floor(scaleValue * 0.025);
                        var g = Math.floor(scaleValue * 0.25);
                        var b = Math.floor(scaleValue  * 0.025);
                        return 'rgb(' + r + ', ' + g + ', ' + b +')';
                    },
                    'width': function(d) { return scaleValue + 'px'; }
                });
            });
          };
      });
  });

controllers.controller('OfficeCandidateListController', function ($scope, $routeParams, $http) {
        $scope.officeId = $routeParams.officeId;
        $scope.url = '/api/offices/' + $scope.officeId;
        $http.get('/api/offices/' + $routeParams.officeId).success(function(candidates) {
            $scope.candidates = candidates;
            console.log('office ' + $routeParams.officeId + '      : ' + candidates);
          });
      });

controllers.controller('ZipCodeListController', function ($scope, $http) {

    $http.get('/api/zip_codes').success(function(zipCodes) {
        $scope.zipCodes = zipCodes;

        $scope.zipCodeRenderer = function(el, data) {

            var domainMax = d3.max(data, function(obj)  {
                return obj.total;
            });

            var totalScale = d3.scale.linear().domain([0, domainMax]);

            var setScaleRange = function(min, max) {
                totalScale = totalScale.rangeRound([min, max]);
            };

            var zips = el.selectAll('li');
            zips.data(data);
            zips.each( function(d, i) {
                setScaleRange(50, 800);
                var scaleValue = totalScale(d.total);
                d3.select(this).style({
                    'background-color': function(d) {
                        var r = Math.floor(scaleValue * 0.025);
                        var g = Math.floor(scaleValue * 0.25);
                        var b = Math.floor(scaleValue  * 0.025);
                        return 'rgb(' + r + ', ' + g + ', ' + b +')';
                    },
                    'width': function(d) { return scaleValue + 'px'; }
                });
            });
        };

        $scope.zipCodeGradientBuilder = function(el, data) {
            var stop = el.selectAll('linearGradient');
            stop.data(data).
                enter().
                append('linearGradient').
                attr('id', function (d) { return 'gradient_' + d.zip_code; }).
                each(function (d){
                    $scope.party_totals = d3.select(this).data();
                    console.log('party_totals: ');
                    console.log($scope.party_totals);
                    d3.select(this).html('<stop offset="51%" stop-color="#000" />');
                    var stop = d3.select(this).
                        selectAll('stop').
                        data($scope.party_totals, function (d) {
                            console.log($scope.party_totals);
                            return d; }).
                        enter().
                        append('stop').
                        attr('offset', function(d, i) {
                            return '5%';
                        }).
                        attr('stop-color', function(d, i){
                            return '#fff';
                        });
                });
        };

        $scope.zipCodeBarRenderer = function(el, data) {

            var BAR_HEIGHT = 20;
            var chart = d3.select('.zip-code-bar-graph').
                           attr('width', 600).
                           attr('height', BAR_HEIGHT * data.length);
            var domainMax = d3.max(data, function(obj)  {
                return obj.total;
            });

            var domainMin = d3.min(data, function(obj)  {
                return obj.total;
            });

            var totalScale = d3.scale.linear().domain([0, domainMax]);

            var setScaleRange = function(min, max) {
                totalScale = d3.scale.linear().domain([0, domainMax]);
                totalScale = totalScale.rangeRound([min, max]);
            };

            var zips = el.selectAll('rect');
            var totalX = 0;
            var prevR = 0;
            setScaleRange(0, 600);
            zips.data(data).
                sort(function(a, b) {
                    if (a.total > b.total) { return -1; }
                    if (a.total < b.total) { return  1; }
                    return 0;
                }).
                enter().
                append('rect').
                attr('x', 0).
                attr('y', function (d, i) {
                    return BAR_HEIGHT * i;
                }).
                attr('width', function (d) {
                   return totalScale(d.total);
                }).
                attr('height', BAR_HEIGHT).
                style('fill', function(d) {
                    setScaleRange(128, 800);
                    var scaleValue = totalScale(d.total);
                    var r = Math.floor(scaleValue * 0.025);
                    var g = Math.floor(scaleValue * 0.25);
                    var b = Math.floor(scaleValue  * 0.025);
                    return 'rgb(' + r + ', ' + g + ', ' + b +')';
                });
        };
    });
});