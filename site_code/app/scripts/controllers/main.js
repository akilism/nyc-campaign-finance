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
    });

    $scope.zipCodeRenderer = function(el, data) {
        if (data) {
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
        }
    };

    $scope.zipCodeBarRenderer = function(el, data) {
        if (data) {
            var BAR_HEIGHT = 50;
            var chart = d3.select('.zip-code-bar-graph').
                attr('width', 640).
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
            setScaleRange(0, 640);
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
                attr('fill', function(d) {
                    setScaleRange(50, 800);
                    var scaleValue = totalScale(d.total);
                    var r = Math.floor(scaleValue * 0.025);
                    var g = Math.floor(scaleValue * 0.25);
                    var b = Math.floor(scaleValue  * 0.025);
                    return 'rgb(' + r + ', ' + g + ', ' + b +')';
                });
        }
    };

    $scope.zipCodeGradientBuilder = function(el, data) {
        if (data) {
            var gradient = el.selectAll('linearGradient');
            gradient.data(data).
                enter().
                append('linearGradient').
                each(function (d){
                    d3.select(this).attr('id', function (d) { return 'gradient_' + d.zip_code; });
                    var data_zip = d3.select(this).data();
                    var party_totals = data_zip[0].party_totals;
                    var zip_total = data_zip[0].total;
                    var domainMax = zip_total;

                    var domainMin = 0;

                    var totalScale = d3.scale.linear().clamp(true).domain([0, domainMax]);

                    var setScaleRange = function(min, max) {
                        totalScale = d3.scale.linear().clamp(true).domain([0, domainMax]);
                        totalScale = totalScale.rangeRound([min, max]);
                    };
    //                    console.log(party_totals);
    //                    console.log(zip_total);
                    setScaleRange(0, 100);
                    var stop = d3.select(this).
                        selectAll('stop').
                        data(party_totals).
                        enter().
                        append('stop').
                        attr('offset', function(d, i) {
                            return totalScale(d.total) + '%';
                        }).
                        attr('stop-color', function(d, i){
                            return d.color;
                        });
                });
        }
    };

});

controllers.controller('CandidateDetailsController', function ($scope, $routeParams, $http) {
    $scope.candidateId = $routeParams.candidateId;
    $scope.url = '/api/candidates/' + $scope.candidateId;
    $http.get('/api/candidates/' + $routeParams.candidateId).success(function(candidate) {
        $scope.candidate = candidate[0];
        console.log('candidate ' + $routeParams.candidateId + '      : ' + candidate[0].name);
        $scope.total = candidate[0].total;
    });

    $scope.occupationPieRenderer = function(el, data) {
        if (data) {
            var width = 320;
            var height = 320;
            var radius = Math.min(width, height)/2;
            var domainMax = $scope.total;
            var domainMin = d3.min(data, function(obj)  {
                return obj.total;
            });
            var totalScale = d3.scale.linear().domain([0, domainMax]);
            var setScaleRange = function(min, max) {
                totalScale = d3.scale.linear().domain([0, domainMax]);
                totalScale = totalScale.rangeRound([min, max]);
            };

            var occupationPie = d3.layout.pie().value(function (d) {
                return d.total;
            }).sort(null);

            var arc = d3.svg.arc().
                innerRadius(60).
                outerRadius(radius - 70);

            var pieData = occupationPie(data);
            var svg = d3.select('.occupation-pie').
                append('svg').
                attr('width',width).
                attr('height', height);

            var pie = svg.append('g').
                attr('class', 'pie').
                attr('transform', function(d) {
                    return 'translate(' + width/2 + ',' + height/2 + ')';
            });

            var label = svg.append('g').
                attr('class', 'label').
                attr('transform', function(d) {
                    return 'translate(' + width/2 + ',' + height/2 + ')';
            });

            setScaleRange(0, Math.PI * 2);
            var path = pie.
                datum(data, function(d) {
                    return d.occupation_id;
                }).selectAll('path').
                data(occupationPie).
                enter().
                append('path').
                attr('d', arc).
                style('stroke','#000').
                style('fill', function(d) {
                setScaleRange(150, 800);
                console.log(d);
                var scaleValue = totalScale(d.value);
                var r = Math.floor(scaleValue * 0.025);
                var g = Math.floor(scaleValue * 0.25);
                var b = Math.floor(scaleValue  * 0.025);
                return 'rgb(' + r + ', ' + g + ', ' + b +')';
            });

            var lines = label.datum(data).selectAll("line").data(occupationPie);
            lines.enter().append("line")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", -radius + 55)
                .attr("y2", -radius + 65)
                .attr("stroke", "gray")
                .attr("transform", function(d) {  //Calculate the degree of rotation for the center of the arc.
                    return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
                });

            var labels = label.datum(data).selectAll("text").data(occupationPie);
            lines.enter().append("text")
                .attr("dy", function(d){
                    if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
                        return 5;
                    } else {
                        return -5;
                    }
                })
                .attr("dx", function(d){
                    if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 > Math.PI*1.5 ) {
                        return -60;
                    } else {
                        return 5;
                    }
                })
                .attr("transform", function(d) {
                    return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (radius-55) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (radius-55) + ")";
                })
                .text(function (d) {
                    return d.data.name;
                });
        }
    };
});

