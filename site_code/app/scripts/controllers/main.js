'use strict';

Number.prototype.toMoney = function(decimals, decimal_sep, thousands_sep) {
    var n = this,
        c = isNaN(decimals) ? 2 : Math.abs(decimals), //if decimal is zero we must take it, it means user does not want to show any decimal
        d = decimal_sep || '.', //if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)

    /*
     according to [http://stackoverflow.com/questions/411352/how-best-to-determine-if-an-argument-is-not-sent-to-the-javascript-function]
     the fastest way to check for not defined parameter is to use typeof value === 'undefined'
     rather than doing value === undefined.
     */
        t = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, //if you don't want to use a thousands separator you can pass empty string as thousands_sep value

        sign = (n < 0) ? '-' : '',

    //extracting the absolute value of the integer part of the number and converting to string
        i = parseInt(n = Math.abs(n).toFixed(c), 10) + '',

        j = ((j = i.length) > 3) ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
};

var controllers = angular.module('NYCCampFi.controllers', []);

controllers.controller('CandidateListController',['$scope', '$http', function ($scope, $http) {
    $http.get('/api/candidates').success(function(candidates) {
        $scope.candidates = candidates;
      });
}]);

controllers.controller('OfficeListController',['$scope', '$http', function ($scope, $http) {

    $scope.option = 'total';

    $http.get('/api/offices').success(function(offices) {
        $scope.total = 0;
        for (var x = 0, len = offices.length; x < len; x++) {
            $scope.total += offices[x].total;
        }

        $scope.offices = offices;

    });

    $scope.officeRenderer = function(el, data) {

        var totalScale = d3.scale.linear().domain([0, d3.max(data, function(obj)  {
            return Math.round(obj.total_contributions);
        })]);

        var setScaleRange = function(min, max) {
            totalScale = totalScale.rangeRound([min, max]);
        };

        var off = el.selectAll('li');
        off.data(offices);
        off.each( function(d, i) {
            setScaleRange(150, 640);
            var scaleValue = totalScale(d.total_contributions);
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

    $scope.wiggleBarGraph = function(el, data) {
        if(data) {
            var width = 640;
            var height = 320;
            var bar_height = 30;
            var count = data.length;
            var totalBarHeight = 0;
            var domainMax = d3.max(data, function(obj) {
                return Math.round(obj.total_contributions);
            });
            var domainMin = d3.min(data, function(obj) {
                return Math.round(obj.total_contributions);
            });
            var totalScale = d3.scale.linear().domain([0, domainMax]);
            var setScaleRange = function(min, max) {
                totalScale = d3.scale.linear().domain([0, domainMax]);
                totalScale = totalScale.rangeRound([min, max]);
            };

            setScaleRange(200, width);

            var svg = el.attr('width', width);

            var wiggleBar = svg.selectAll('g')
                .data(data, function(d) {
                    return d.office_id;
                });

            var getColor = function(d, i) {
                var scaleVal = totalScale(d.total);
                var r = Math.floor(scaleVal * 0.025);
                var g = Math.floor(scaleVal * 0.25);
                var b = Math.floor(scaleVal  * 0.025);
                //return 'rgb(' + r + ', ' + g + ', ' + b +')';
                return 'rgb(16, 160, 16)';
            };

            var buildWiggleBar = function(d, i) {
                if (!d.total_contributions) { return; }
                var scaleVal = totalScale(d.total_contributions);
                d.totalBars = Math.floor(scaleVal/width);
                d.remainderBarWidth = scaleVal % width;
                d.elbows = (d.remainderBarWidth > 0) ? d.totalBars : d.totalBars -1;
//                    console.log('totalBars             :' + d.totalBars);
//                    console.log('remainderBarWidth     :' + d.remainderBarWidth);
//                    console.log('elbows                :' + d.elbows);

                var getX = function(x) {
                    return ((x % 2) === 0) ? width - bar_height - 2 : bar_height;
                };

                var getY = function(x) {
                    return (x * bar_height) + totalBarHeight - (bar_height * d.totalBars);
                };

                for (var x = 0; x < d.totalBars; x++) {
                    d3.select(this)
                        .append('rect')
                        .attr('x', function () {
                            if (d.elbows > 0) {
                                if (x == 0) {
                                    return 0;
                                } else if ((x > 0) && (d.remainderBarWidth > 0)) {
                                    return bar_height - 2;
                                } else {
                                    return 0;
                                }
                            }//TODO Refactor this conditional.

                            return 0;
                        })
                        .attr('y', totalBarHeight)
                        .style('fill', getColor)
                        .style('stroke', '#ffffff')
                        .style('stroke-width', '2px')
                        .attr('height', bar_height)
                        .attr('width', function () {
                            if (d.elbows > 0) {
                                if (x == 0) {
                                    return width - bar_height;
                                } else if ((x > 0) && (d.remainderBarWidth > 0)) {
                                    return width - (bar_height*2) + 2;
                                } else {
                                    return width-bar_height;
                                }
                            }
                            return width;
                        });

                    totalBarHeight += bar_height;
                }

                if (d.remainderBarWidth > 0) {
                    d3.select(this)
                        .append('rect')
                        .attr('x', function () {
                            if(d.totalBars > 0) {
                                return ((d.totalBars % 2) == 0) ? bar_height - 2 : (width - d.remainderBarWidth) - bar_height;
                            }

                            return 0;
                        })
                        .attr('y', totalBarHeight)
                        .style('fill', getColor)
                        .style('stroke', '#ffffff')
                        .style('stroke-width', '2px')
                        .attr('height', bar_height)
                        .attr('width', d.remainderBarWidth);
                    totalBarHeight += bar_height;
                }

                for (var x = 0; x < d.elbows; x++) {
                    var arc = d3.svg.arc();
                    if((x % 2) == 0) {
                        arc.innerRadius(2)
                            .outerRadius(bar_height-1)
                            .startAngle(0)
                            .endAngle(Math.PI);
                    } else {
                        arc.innerRadius(2)
                            .outerRadius(bar_height-1)
                            .startAngle(Math.PI)
                            .endAngle(Math.PI*2);
                    }
                    d3.select(this)
                        .append('path')
                        .attr('d', arc)
                        .attr('transform', function(d) {
                            return 'translate(' + getX(x) + ',' + getY(x) + ')';
                        })
                        .style('fill', getColor);
                }

                d3.select(this)
                    .append('text')
                    .attr('class','wiggle-label')
                    .text(d.office + ' - ' + '$' + Number(d.total_contributions).toMoney(2))
                    .attr('transform', function(d, i) {
                        if (d.remainderBarWidth > 0) { d.totalBars++; }
                        return 'translate(' + 5 + ',' + (totalBarHeight - (d.totalBars * bar_height) + (bar_height/2) + 6) + ')';
                    });
            };

            wiggleBar.enter()
                .append('g')
                .each(buildWiggleBar)
                .on('click', function (d, i) {
                    window.location.href = '/office/' + d.office_id;
                });
            //.attr('transform','rotate(180, ' + width/2 + ',' + totalBarHeight/2 + ')');

            if (totalBarHeight > 0) {
                svg.attr('height', totalBarHeight);
            }
        }
    };

    $scope.byTotal = function byTotal() {
        $scope.option = 'total';
        d3.transition().duration(550).each(function() { $scope.officeBubble($scope.el, $scope.offices); });
    };

    $scope.byContributions = function byContributions() {
        $scope.option = 'total_contributions';
        d3.transition().duration(550).each(function() { $scope.officeBubble($scope.el, $scope.offices); });
    };

    $scope.byMatch = function byMatch() {
        $scope.option = 'total_match';
        d3.transition().duration(550).each(function() { $scope.officeBubble($scope.el, $scope.offices); });
    };

    $scope.byContributors = function byContributors() {
        $scope.option = 'count_contributors';
        d3.transition().duration(550).each(function() { $scope.officeBubble($scope.el, $scope.offices); });
    };

    $scope.officeBubble = function(el, data) {
        if(data) {
            var totalScale = d3.scale.linear().domain([0, d3.max(data, function(obj)  {
                return Math.round(obj[$scope.option]);
            })]);

            var setScaleRange = function(min, max) {
                totalScale = totalScale.rangeRound([min, max]);
            };

            var map = Array.prototype.map;
            var color = d3.scale.quantile();
            color.domain(
                    (function (data) {
                        return map.call(data, function(d) {
                            return Math.round(d[$scope.option]);
                        });
                    })(data)
                ).range(['#034e7b', '#0c2c84', '#225ea8',
                    '#1d91c0', '#41b6c4', '#7fcdbb',
                    '#c7e9b4', '#ffffcc', '#f7fcb9',
                    '#d9f0a3', '#addd8e', '#78c679',
                    '#41ab5d', '#238443', '#006837',
                    '#004529']);

            var fontColor = d3.scale.quantile();
            fontColor.domain(
                    (function (data) {
                        return map.call(data, function(d) {
                            return Math.round(d[$scope.option]);
                        });
                    })(data)
                ).range(['#fff', '#fff', '#fff',
                    '#000', '#000', '#000',
                    '#000', '#000', '#000',
                    '#000', '#000', '#000',
                    '#000', '#fff', '#fff',
                    '#fff']);

            var root = {};
            root.name = 'offices';
            root.children = [];

            for(var x = 0, len = data.length; x < len; x++) {
                root.children[x] = {
                    'value': data[x][$scope.option],
                    'name': data[x].office,
                    'office_id': data[x].office_id,
                    'total_contributions': data[x].total_contributions,
                    'total_match': data[x].total_match,
                    'total': data[x].total,
                    'count_contributors': data[x].count_contributors
                };
            }

            var diameter = parseInt(el.style('width').replace('px',''), 10);

            if (!$scope.el) {
                $scope.el = el;

                $scope.svg = el.attr('width', diameter)
                    .attr('height', (diameter * .75));
            }

            var svg = $scope.svg;
            var bubbles = d3.layout.pack()
                .sort(null)
                .size([diameter, diameter])
                .padding(11.5)
                .nodes(root)
                .filter(function (d) {
                    return !d.children;
                });

            var office = svg.selectAll('g')
                .data(bubbles)
                .sort(function (a, b) {
                    return b[$scope.option] - a[$scope.option];
                });

            var officeEnter = office.enter()
                .append('g')
                .attr('class','bubble')
                .attr('transform', function(d) { return 'translate(' + d.x + ',' + (d.y-80) + ')' });

            officeEnter.append('title')
                .text(function (d) {
                    return d.name + ' - $' + d.value.toMoney();
                });

            officeEnter.append('circle').transition()
                .attr('r', function(d) {
                    return d.r + 5;
                })
                .style('fill', function (d) {
                    return color(d.value);
                });


            officeEnter.append('text')
                .attr('dy', '.075em')
                .attr('class', 'bubble-name')
                .style('font-size', function (d) {
                    return (d.r *.015) + 'em';
                })
                .style('text-anchor', 'middle')
                .style('fill', function (d) {
                    return fontColor(d.value);
                })
                .text(function (d) {
                    return d.name.substring(0, d.r / 3);
                });

            officeEnter.append('text')
                .attr('dy', '1.25em')
                .attr('class', 'bubble-value')
                .style('text-anchor', 'middle')
                .style('font-size', function (d) {
                    return (d.r *.015) + 'em';
                })
                .style('fill', function (d) {
                    return fontColor(d.value);
                })
                .text(function (d) {
                    return '$' + d.value.toMoney().substring(0, d.r / 3);
                });

            officeEnter.on('click', function (d, i) {
                    window.location.href = '/office/' + d.office_id;
                });

            officeEnter.on('mouseover', function(d, i) {
                $scope.$apply(function () {
                    $scope.displayClass = 'shown';
                    $scope.name = d.name;
                    $scope.value = getValue(d.value, $scope.option);
                });
                $('.office-details').on('mousemove', function () {
                    $(this).css({
                        'top': event.y - 20,
                        'left': event.x + 12
                    });
                });
            });

            officeEnter.on('mouseout', function () {
                $('.office-details').removeClass('shown');
            });

            officeEnter.on('mousemove', function () {
                var $$officeDetails = $('.office-details');
                $$officeDetails.addClass('shown');
                $$officeDetails.css({
                    'top': event.y - 20,
                    'left': event.x + 10
                });
            });

            var getValue = function getValue(val, option) {
                var is_contributor = (option.indexOf('count') != -1);
                option = option.replace('_',' ');

                if (is_contributor) {
                    return val.toLocaleString();
                }

                return '$' + val.toMoney();
            }

            var officeUpdate = d3.transition(office)
                .attr('transform', function(d) { return 'translate(' + d.x + ',' + (d.y-80) + ')' });

            officeUpdate.select('circle')
                .attr('r', function(d) {
                    return d.r + 5;
                })
                .style('fill', function (d) {
                    return color(d.value);
                });

            office.select('.bubble-name')
                .attr('dy', '.075em')
                .style('font-size', function (d) {
                    return (d.r *.015) + 'em';
                })
                .style('fill', function (d) {
                    return fontColor(d.value);
                })
                .text(function (d) {
                    return d.name.substring(0, d.r / 3);
                });

            office.select('.bubble-value')
                .attr('dy', function (d) {
                    if(d.r * .015 < .5) {
                        return '2.75em';
                    }

                    return '1.15em';
                })
                .style('font-size', function (d) {
                    return (d.r *.015) + 'em';
                })
                .style('fill', function (d) {
                    return fontColor(d.value);
                })
                .text(function (d) {
                    if ($scope.option === 'count_contributors') {
                        return d.value.toLocaleString().substring(0, d.r / 3);
                    }
                    return '$' + d.value.toMoney().substring(0, d.r / 3);
                });

            office.select('title')
                .text(function (d) {
                    if ($scope.option === 'count_contributors') {
                        return (d.name + ' - ' + d.value.toLocaleString());
                    }
                    return d.name + ' - $' + d.value.toMoney();
                });
        }
    };
//    $scope.officeDonut = function(el, data) {
//        if (data) {
//            var width = 640;
//            var height = 480;
//            var domainMax = d3.max(data, function(obj)  {
//                return Math.round(obj.total_contributions);
//            });
//            var domainMin = d3.min(data, function(obj)  {
//                return Math.round(obj.total_contributions);
//            });
//            var totalScale = d3.scale.linear().domain([0, domainMax]);
//            var setScaleRange = function(min, max) {
//                totalScale = d3.scale.linear().domain([0, domainMax]);
//                totalScale = totalScale.rangeRound([min, max]);
//            };
//
//            var getColor = function(d) {
//                setScaleRange(150, 800);
//                var scaleValue = totalScale(d.value);
//                var r = Math.floor(scaleValue * 0.025);
//                var g = Math.floor(scaleValue * 0.25);
//                var b = Math.floor(scaleValue  * 0.025);
//                return 'rgb(' + r + ', ' + g + ', ' + b +')';
//            };
//
//            var svg = el
//                .attr('width',width)
//                .attr('height', height);
//
//            var tick = function (e) {
//                circles.selectAll('circle')
//                    .each(cluster(10 * e.alpha * e.alpha))
//                    .each(collide(.5))
//                    .attr("cx", function(d) { return d.x; })
//                    .attr("cy", function(d) { return d.y; });
//            };
//
//            var force = d3.layout.force()
//                .nodes(data)
//                .size([width. height])
//                .gravity(.02)
//                .on('tick', tick)
//                .start();
//
//
//            var circles = svg.append('g')
//                .attr('class', 'circles')
//                .selectAll('circle').data(data).enter();
//
//            setScaleRange(0, height);
//            circles.append('circle')
//                .attr('r', function (d) {
//                    setScaleRange(10,50);
//                    return totalScale(d.total_contributions);
//                })
//                .attr('class','office-circle')
//                .attr('fill', getColor)
//                .call(force.drag);
//        }
//    };

}]);

controllers.controller('OfficeCandidateListController',['$scope', '$routeParams', '$http', '$window', function ($scope, $routeParams, $http, $window) {
    $scope.officeId = $routeParams.officeId;
    $scope.url = '/api/offices/' + $scope.officeId;
    $scope.option = 'candidate_total';
    $http.get('/api/offices/' + $routeParams.officeId).success(function(candidates) {
        $scope.candidates = candidates;
        $scope.office = candidates[0].office;
        $scope.name = '';
        $scope.candidate_contributions = '';
        $scope.candidate_match = '';
        $scope.detail_link = '';
//        console.log('office ' + $routeParams.officeId + '      : ' + candidates);
    });

    $scope.byTotal = function byTotal() {
        $scope.option = 'candidate_total';
        d3.transition().duration(550).each(function() { $scope.verticalBarGraphRenderer($scope.el, $scope.candidates); });
    };

    $scope.byContributions = function byContributions() {
        $scope.option = 'candidate_contributions';
        d3.transition().duration(550).each(function() { $scope.verticalBarGraphRenderer($scope.el, $scope.candidates); });
    };

    $scope.byMatch = function byMatch() {
        $scope.option = 'candidate_match';
        d3.transition().duration(550).each(function() { $scope.verticalBarGraphRenderer($scope.el, $scope.candidates); });
    };

    $scope.byContributors = function byContributors() {
        $scope.option = 'count_contributors';

        d3.transition().duration(550).each(function() { $scope.verticalBarGraphRenderer($scope.el, $scope.candidates); });
    };

    $scope.verticalBarGraphRenderer = function (el, data) {
      if(data) {
          var count_candidates = data[0].count_candidates;
          var margin = {top: 0, right: 0, bottom: 0, left: 60}
          var width = 640 - margin.left - margin.right;
          var height = 800 - margin.top - margin.bottom;
          var labelOffset = 200;
          var bar_width = (width / count_candidates) > 20 ? width / count_candidates : 20;

          if (bar_width == 20) {
              width = (22) * count_candidates;
          }

          var domainMax = d3.max(data, function(obj) {
              return Math.round(obj[$scope.option]);
          });

          var domainMin = d3.min(data, function(obj) {
              return Math.round(obj[$scope.option]);
          });

          var totalScale = null;

          var setScaleRange = function(min, max) {
              totalScale = d3.scale.linear().domain([0, domainMax]);
              totalScale = totalScale.rangeRound([min, max]);
          };

          setScaleRange(height - labelOffset - 5, 0);

          if (!$scope.el) {
              $scope.el = el;

              $scope.svg = el.attr('width', width + margin.left + margin.right)
                  .attr('height', height + margin.top + margin.bottom)
                  .append('g')
                  .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

              $scope.svg.insert("g")
                  .attr("class", "y axis")
                  .attr('transform','translate(10, 0)');
          }

          var svg = $scope.svg;

          var yAxis = d3.svg.axis()
              .scale(totalScale)
              .orient("left")
              .tickSize(1)
              .tickPadding(2)
              .ticks(10);

          if($scope.option !== 'count_contributors') {
              yAxis.tickFormat(currencyFormat);
          }

          var verticalBar = svg.selectAll('.vertical-bar')
              .data(data, function(d) {
                  return d.candidate_id;
              }).sort(function (a, b) {
                  return b[$scope.option] - a[$scope.option];
              });

          var vertEnter = verticalBar.enter().append('g').attr('transform', function(d, i) {
                  return 'translate(' + ((i * bar_width)+15) + ', 0)';
              })
              .attr('class', 'vertical-bar');

          vertEnter.append('rect')
              .attr('y', function(d) {
                  return totalScale(d[$scope.option]) - 10;
              })
              .attr('height', function(d) {
                  return height - labelOffset - totalScale(d[$scope.option]);
              })
              .attr('width', bar_width - 5);

          vertEnter.append('line')
              .attr('x1', (bar_width/2)-3)
              .attr('y1', function () {
                  return height - labelOffset - 9;
              })
              .attr('x2', (bar_width/2)-3)
              .attr('y2', function() {
                  return height - labelOffset - 2;
              })
              .attr('class','vertical-bar-dash');

          vertEnter.append('text')
              .attr('x', bar_width/2)
              .attr('y', function (d) {
                  return height - labelOffset;
              })
              .attr('dy', '0.6125em')
              .text(function (d) {
                  return d.name.trim();
              })
              .attr('transform', function (d, i) {
                  return 'rotate(' + 100 + ', ' + (bar_width/2) + ',' + (height - labelOffset) + ')';
              });

          verticalBar.on('mouseover', function(d, i) {
              $scope.$apply(function () {
                  $scope.name = d.name.trim();
                  $scope.candidate_total = d.candidate_total;
                  $scope.candidate_match = d.candidate_match;
                  $scope.candidate_contributions = d.candidate_contributions;
                  $scope.count_contributors = d.count_contributors.toLocaleString();
                  $scope.detail_link = '/candidate/' + d.candidate_id;
              });

          verticalBar.on('click', function(d, i) {
                  $window.location.href = $scope.detail_link;
              });

              d3.select('.candidate-info-box').style('display','block');

          });

          var barUpdate = d3.transition(verticalBar)
              .attr('transform', function(d, i) {
                  return 'translate(' + ((i * bar_width)+15) + ', 0)';
              });

            barUpdate.select('rect')
                .attr('height', function(d) {
                  console.log(d.name + ' - ' + (typeof d[$scope.option]) + ' - ' + d[$scope.option]);
                  return height - labelOffset - totalScale(d[$scope.option]);
                })
                .attr('y', function(d) {
                    return totalScale(d[$scope.option]) - 10;
                });

            d3.transition(svg).select('.y.axis').call(yAxis);
      }
    };

}]);

controllers.controller('ZipCodeListController',['$scope', '$http', function ($scope, $http) {

    $http.get('/api/zip_codes').success(function(zipCodes) {
        $scope.zipCodes = zipCodes;
    });

    $scope.zipCodeRenderer = function(el, data) {
        if (data) {
            var domainMax = d3.max(data, function(obj)  {
                return Math.round(obj.total);
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
                return Math.round(obj.total);
            });

            var domainMin = d3.min(data, function(obj)  {
                return Math.round(obj.total);
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

}]);

controllers.controller('CandidateDetailsController',['$scope', '$routeParams', '$http', function ($scope, $routeParams, $http) {
    $scope.candidateId = $routeParams.candidateId;
    $scope.url = '/api/candidates/' + $scope.candidateId;

    $http.get('/api/candidates/' + $routeParams.candidateId).success(function(candidate) {
        $scope.candidate = candidate;
//        console.log('candidate ' + $routeParams.candidateId + '      : ' + candidate.name);
        $scope.total_contributions = candidate.total_contributions;
        $scope.total_match = candidate.total_match;
        $scope.total = candidate.total;

        $http.get('/api/candidates/' + $routeParams.candidateId + '/occupations/10').success(function(occupations) {
            $scope.candidate.occupations = occupations;
//            console.log('occupations : ' + occupations.length);
        });
        $http.get('/api/candidates/' + $routeParams.candidateId + '/contributors/10').success(function(contributors) {
            $scope.candidate.contributors = contributors;
//            console.log('contributors : ' + contributors.length);
        });
        $http.get('/api/candidates/' + $routeParams.candidateId + '/employers/10').success(function(employers) {
            $scope.candidate.employers = employers;
//            console.log('employers : ' + employers.length);
        });
        $http.get('/api/candidates/' + $routeParams.candidateId + '/zip_codes/1').success(function(zip_codes) {
            $scope.candidate.zip_codes = zip_codes;
//            console.log('zip_codes : ' + zip_codes.length);

            if (zip_codes.length > 0) {
                setupMap(zip_codes, 'mini_map', 13);
                $scope.zipTotal = zip_codes[0].total;
                $scope.zipCode = zip_codes[0].zip_code;
                $scope.borough = zip_codes[0].borough;
            } else { $('.mini-map').css('display','none');}

        });
    });

    $scope.occupationPieRenderer = function(el, data) {
        if (data) {
            var width = 320;
            var height = 320;
            var radius = Math.min(width, height)/2;
            var domainMax = $scope.total;
            var domainMin = d3.min(data, function(obj)  {
                return Math.round(obj.total);
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
    $scope.nameTotalBarGraph = function(el, data) {
        if (data) {
            var margin = { top: 0, right: 0, bottom: 0, left: 0 };
            var width = 640 - margin.left - margin.right;
            var bar_height = 25;
            var height = (bar_height * data.length) + 50;
            var domainMax = d3.max(data, function(obj)  {
                return Math.round(obj.total_contributions);
            });
            var domainMin = d3.min(data, function(obj)  {
                return Math.round(obj.total_contributions);
            });
            var totalScale = d3.scale.linear().domain([0, domainMax]);
            var setScaleRange = function(min, max) {
                totalScale = d3.scale.linear().domain([0, domainMax]);
                totalScale = totalScale.rangeRound([min, max]);
            };

            var sorter = function(a, b) {
                if (a.total_contributions > b.total_contributions) { return -1; }
                if (a.total_contributions < b.total_contributions) { return 1; }
                return 0;
            };

            var getColor = function(d) {
                setScaleRange(150, 900);
                var scaleValue = totalScale(d.total_contributions);
                var r = Math.floor(scaleValue * 0.025);
                var g = Math.floor(scaleValue * 0.25);
                var b = Math.floor(scaleValue  * 0.025);
                return 'rgb(' + r + ', ' + g + ', ' + b +')';
//                      return 'rgb(16, 160, 16)';
            };


            var svg = el
                .attr('width',width)
                .attr('height', height);

            setScaleRange(0, width-20);

            var axis =d3.svg.axis()
                .scale(totalScale)
                .orient("bottom")
                .ticks(10)
                .tickFormat(currencyFormat)
                .tickSize(height)
                .tickPadding(10);

            svg.append('g').attr('class','x axis').attr('transform','translate(3, -30)').call(axis);

            var bar = svg.append('g')
                .attr('class', 'bar')
                .attr('transform','translate(3, 0)');
//                .attr('transform', function(d) {
//                    return 'translate(' + + ',' + + ')';
//                });

            var label = svg.append('g')
                .attr('class', 'label')
                .attr('transform','translate(3, 0)');
//                .attr('transform', function(d) {
//                    return 'translate(' + width/2 + ',' + height/2 + ')';
//                });



            var rect = bar.selectAll('rect')
                .data(data , function(d) {
                    return d.id;
                });


            rect.enter()
            .append('rect')
            .sort(sorter)
            .attr('height', bar_height-5)
            .attr('width', function (d, i) {
                 return totalScale(d.total_contributions);
            })
            .attr('y', function(d, i) {
                return (i * (bar_height));
            })
            .style('fill', getColor);

            var labels = label
                .selectAll("text")
                .data(data, function (d) {
                    return d.id;
                });

            setScaleRange(0, width);

            var isInside = function (d) {
                if(d.name.length*11 > totalScale(d.total_contributions)) {
                    return false;
                }
                return true;
            };

            labels.enter()
                .append("text")
                .sort(sorter)
                .attr('class', function(d, i) {
                    if (isInside(d)) {
                        return 'bar-label-name';
                    } else {
                        return 'bar-label-name outside';
                    }
                })
                .text(function (d) {
                    return d.name;
                })
                .attr('transform', function(d, i) {
                    if (isInside(d)) {
                        return 'translate(' + 5 + ',' + ((bar_height * i) + (bar_height/2) + 3) + ')';
                    } else {
                        return 'translate(' + (totalScale(d.total_contributions) + 5) + ',' + ((bar_height * i) + (bar_height/2) + 3) + ')';
                    }
                });



//            labels.enter()
//                .append("text")
//                .sort(function(a, b) {
//                    if (a.total_contributions > b.total_contributions) { return -1; }
//                    if (a.total_contributions < b.total_contributions) { return 1; }
//                    return 0;
//                })
//                .attr('class', 'bar-label-total')
//                .text(function (d) {
//                    return '$' + d.total_contributions.toMoney(2);
//                })
//                .attr('transform', function(d, i) {
//                    return 'translate(' + 5 + ',' + ((bar_height * i) + (bar_height/2) + 12) + ')';
//                });
        }
    };
}]);

controllers.controller('CandidateMonthlyController',['$scope', '$routeParams', '$http', function ($scope, $routeParams, $http) {

    $http.get('/api/candidates/' + $routeParams.candidateId + '/months').success(function(months) {
//        console.log(months);
        for(var i = 0, len = months.length; i < len; i++) {
            months[i].contribution_date = new Date(months[i].contribution_date);
            months[i].total = parseFloat(months[i].total);
        }
        $scope.months = months;
        $scope.total_month = 0.0;
    });

    $scope.candidateMonthlyGraphRenderer = function(el, data) {
      if(data) {

          var domainMax = d3.max(data, function(obj) {
              return Math.round(obj.total);
          });

          var margin = {top: 0, right: 0, bottom: 0, left: (domainMax > 900000) ? 70 : 60};
          var width = 650 - margin.left - margin.right;
          var height = 240 - margin.top - margin.bottom;
          var count = data.length;

          var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);

          var dateMax = data[data.length-1].contribution_date;
          var dateMin = data[0].contribution_date;
          var timeScale = d3.time.scale().domain([dateMin, dateMax]).range([0, width]);


          var domainMin = d3.min(data, function(obj) {
              return Math.round(obj.total);
          });

          var totalScale = null;

          var setScaleRange = function(min, max) {
              totalScale = d3.scale.linear().domain([0, domainMax]).nice();
              totalScale = totalScale.rangeRound([min, max]);
          };

          setScaleRange(height - 50, 5);

          x.domain(data.map(function(d) { return d.contribution_date; }));

          var yAxis = d3.svg.axis()
              .scale(totalScale)
              .orient("left")
              .tickSize(1)
              .tickPadding(5)
              .ticks(6)
              .tickFormat(currencyFormat);

          var xAxis = d3.svg.axis()
              .scale(timeScale)
              .tickSize(50,1)
              .tickFormat(d3.time.format('%m, %Y'));

          var svg = el.attr('width', width + margin.left + margin.right + 6)
              .attr('height', height + margin.top + margin.bottom + 6)
              .append('g')
              .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

          var lineGraph = svg.selectAll('g')
              .data(data, function(d) {
                  return d.contribution_date;
              });

          var pathSegment = d3.svg.line()
              .x(function(d) { return timeScale(d.contribution_date); })
              .y(function(d) { return totalScale(d.total); })
              .interpolate('linear');

//          var pathSegmentContributions = d3.svg.line()
//              .x(function(d) { return timeScale(d.contribution_date); })
//              .y(function(d) { return totalScale(d.total_contributions); })
//              .interpolate('linear');
//
//          var pathSegmentMatch = d3.svg.line()
//              .x(function(d) { return timeScale(d.contribution_date); })
//              .y(function(d) { return totalScale(d.total_match); })
//              .interpolate('linear');

          svg.append('path')
              .attr('d', pathSegment(data))
              .attr('class', 'candidate-month-line');

//          svg.append('path')
//              .attr('d', pathSegmentContributions(data))
//              .attr('class', 'candidate-month-contribution-line');
//
//          svg.append('path')
//              .attr('d', pathSegmentMatch(data))
//              .attr('class', 'candidate-month-match-line');

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
              .attr('transform','translate(0, 2)');

          svg.append("g")
              .attr("class", "x axis")
              .attr('transform','translate(0, ' + (height-49) + ')')
              .call(xAxis)
              .selectAll('text')
              .attr('x', 5)
              .attr('y', 0)
              .attr('transform', 'rotate(90)')
              .attr('dy','.35em')
              .style('text-anchor', 'start');

          lineGraph.enter().append('svg:circle')
              .attr('cx', function (d) { return timeScale(d.contribution_date); })
              .attr('cy', function (d) { return totalScale(d.total); })
              .attr('r', 4)
              .attr('class','candidate-month-point')
              .on('mousemove', function(d, i) {
                  $scope.$apply(function () {
                      $scope.month = d.contribution_date.getMonth() + 1;
                      $scope.month_total = d.total;
                      $scope.year = d.contribution_date.getFullYear();
                  });
                  positionToolTip('candidate_monthly_tooltip', width);
              })
              .on('mouseleave', function() {
                  hideToolTip('candidate_monthly_tooltip');
              });
      }
    };
}]);

controllers.controller('CityController',['$scope', '$http', function ($scope, $http) {

    var setupMap = function(zipCodes, selector, initalZoom, setDetail) {
        var map = L.map(selector);
        var zipGroup = L.featureGroup();
        for (var i = 0, len = zipCodes.length; i < len; i++) {
            var geo = L.geoJson(zipCodes[i].geojson, {
                onEachFeature: function(feature, layer) {
                    if (setDetail) {
                        var zipCode = zipCodes[i].zip_code;
                        var borough = zipCodes[i].borough;
                        var total = zipCodes[i].total;
                        var match = zipCodes[i].match;
                        var contributions = zipCodes[i].contributions;
                        var count = zipCodes[i].count;
                        var position = i + 1;

                        layer.bindPopup(zipCodes[i].zip_code + '<br>Total: $' + zipCodes[i].total.toMoney() +
                            '<br>' + addOrdinal(position) + ' in contributions.' + '<br> Contributors: ' + zipCodes[i].count);

                        layer.on('mouseover', function (e) {
                            layer.setStyle( {
                                fillColor: 'rgb(241, 169, 15)',
                                fillOpacity: '0.9'
                            });

                            $scope.$apply(function () {
                                $scope.zip_code = zipCode;
                                $scope.borough = borough;
                                $scope.contributions = contributions;
                                $scope.total = total;
                                $scope.match = match
                                $scope.count_contributors = count;
                                $scope.position = addOrdinal(position);
                            });
                        });

                        layer.on('mouseout', function (e) {
                            layer.setStyle( {
                                fillColor: feature.color,
                                fillOpacity: '0.9'
                            });
                        });

                        layer.setStyle({
                            color: 'rgb(0, 0, 0)',
                            weight: '1',
                            fillColor: feature.color,
                            fillOpacity: '0.9'
                        });
                    }
                }
            });
            zipGroup.addLayer(geo);
        }
        var bounds = zipGroup.getBounds();
        zipGroup.addTo(map);
        map.setView(bounds.getCenter(), initalZoom);
//f30cb9efcacd473fa9725b30982cd71b
        L.tileLayer('http://{s}.tile.cloudmade.com/f30cb9efcacd473fa9725b30982cd71b/997/256/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
            maxZoom: 18
        }).addTo(map);
    };

    var setCityMap = function(cityData) {
        var mean = d3.mean(cityData, function (d) {
            return d.contributions;
        });

        var median = d3.median(cityData, function (d) {
            return d.contributions;
        });

        var max = cityData[0].contributions;
        var min = cityData[cityData.length-1].contributions;

        var map = Array.prototype.map;

        var color = d3.scale.quantile();
        color.domain(
                (function (data) {
                    return map.call(data, function(d) {
                        console.log(d.contributions);
                        return Math.round(d.contributions);
                    });
                })(cityData)
            ).range(['#034e7b', '#0c2c84', '#225ea8',
                     '#1d91c0', '#41b6c4', '#7fcdbb',
                     '#c7e9b4', '#ffffcc', '#f7fcb9',
                     '#d9f0a3', '#addd8e', '#78c679',
                     '#41ab5d', '#238443', '#006837',
                     '#004529']);


        for (var i = 0, len = cityData.length; i < len; i++) {
            cityData[i].geojson.color = color(cityData[i].contributions);
//            console.log(cityData[i].geojson.color + ' - ' + cityData[i].contributions);
        }

        var keyColors = [];

        for (i = 0, len = color.quantiles().length; i < len; i++) {
            //color.quantiles()[i]
            console.log(color.quantiles()[i] + ' - ' + color(color.quantiles()[i]));
        }

        setupMap(cityData, 'city_map', 11, true);

        var width = Math.ceil(640 / color.quantiles().length);
        d3.select('#map_key')
          .append('svg')
          .attr('height', '50')
          .append('g')
          .selectAll('rect')
          .data(color.quantiles())
          .enter()
          .append('rect')
          .attr('height','20')
          .attr('width', width)
          .attr('y','0')
          .attr('x', function(d,i) {
                return (i * width);
          })
          .style('fill', function(d) {
                return color(d);
          });


    };

    $http.get('/api/city/').success(function(cityData) {
        $scope.cityData = cityData;
        $scope.zip_code = cityData[0].zip_code;
        $scope.borough = cityData[0].borough;
        $scope.count_contributors = cityData[0].count;
        $scope.contributions = cityData[0].contributions;
        $scope.total = cityData[0].total;
        $scope.match = cityData[0].match;
        $scope.position = '1st';
        $('.city-map').css('display','block');
        setCityMap(cityData);
    });

}]);

var positionToolTip = function(id, width) {
    var $$tooltip = $('#' + id);
    $$tooltip.css('display','inline-block');
    $$tooltip.css('top', (event.pageY - ($$tooltip.height()/2)) + 'px');

    if((event.x + $$tooltip.width()) < width) {
        $$tooltip.css('left', event.x + 5 + 'px');
    } else {
        $$tooltip.css('left', (event.x - $$tooltip.width() - 20) + 'px');
    }
};

var hideToolTip = function(id) {
    var $$tooltip = $('#' + id);
    $$tooltip.css('display','none');
}

var currencyFormat = function (d) {
    if(d === 0) { return d; }
    return "$" + d;
};

var setupMap = function(zipCodes, selector, initalZoom) {
    var map = L.map(selector);
    var zipGroup = L.featureGroup();
    for (var i = 0, len = zipCodes.length; i < len; i++) {
      var geo = L.geoJson(zipCodes[i].geojson, {
          onEachFeature: function(feature, layer) {

          }
      });
      zipGroup.addLayer(geo);
    }
    var bounds = zipGroup.getBounds();
    zipGroup.addTo(map);
    map.setView(bounds.getCenter(), initalZoom);

    L.tileLayer('http://{s}.tile.cloudmade.com/f30cb9efcacd473fa9725b30982cd71b/997/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);
};

var addOrdinal = function (num) {
    if (num === NaN) { return undefined; }

    switch (num % 100) {
        case 11:
            return num + "th";
        case 12:
            return num + "th";
        case 13:
            return num + "th";
    }

    switch (num % 10) {
        case 1:
            return num + "st";
        case 2:
            return num + "nd";
        case 3:
            return num + "rd";
        default:
            return num + "th";
    }
}
