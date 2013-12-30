'use strict';

Number.prototype.toMoney = function(decimals, decimal_sep, thousands_sep)
{
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
    return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
}

var controllers = angular.module('NYCCampFi.controllers', []);

controllers.controller('CandidateListController', function ($scope, $http) {
    $http.get('/api/candidates').success(function(candidates) {
        $scope.candidates = candidates;
      });
});


controllers.controller('OfficeListController', function ($scope, $http) {

    $http.get('/api/offices').success(function(offices) {
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
                    return ((x % 2) == 0) ? width - bar_height - 2 : bar_height;
                };

                var getY = function(x) {
                    return (x * bar_height) + totalBarHeight - (bar_height * d.totalBars);
                }

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
});

controllers.controller('OfficeCandidateListController', function ($scope, $routeParams, $http) {
    $scope.officeId = $routeParams.officeId;
    $scope.url = '/api/offices/' + $scope.officeId;

    $http.get('/api/offices/' + $routeParams.officeId).success(function(candidates) {
        $scope.candidates = candidates;
        $scope.office = candidates[0].office;
        $scope.name = '';
        $scope.candidate_contributions = '';
        $scope.detail_link = '';
//        console.log('office ' + $routeParams.officeId + '      : ' + candidates);
    });

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
             return Math.round(obj.candidate_contributions);
          });

          var domainMin = d3.min(data, function(obj) {
              return Math.round(obj.candidate_contributions);
          });

          var totalScale = null;

          var setScaleRange = function(min, max) {
              totalScale = d3.scale.linear().domain([0, domainMax]);
              totalScale = totalScale.rangeRound([min, max]);
          };

          setScaleRange(height - labelOffset - 10, 0);

          var yAxis = d3.svg.axis()
              .scale(totalScale)
              .orient("left")
              .tickSize(1)
              .tickPadding(2)
              .ticks(10, '$');

          var svg = el.attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

          var verticalBar = svg.selectAll('g')
              .data(data, function(d) {
                  return d.candidate_id;
              }).enter().append('g').attr('transform', function(d, i) {
                  return 'translate(' + ((i * bar_width)+15) + ', 0)';
              })
              .attr('class', 'vertical-bar');

          verticalBar.append('rect')
              .attr('y', function(d) {
                  return totalScale(d.candidate_contributions) - 10;
              })
              .attr('height', function(d) {
                  return height - labelOffset - totalScale(d.candidate_contributions);
              })
              .attr('width', bar_width - 5);

          verticalBar.append('line')
              .attr('x1', (bar_width/2)-3)
              .attr('y1', function () {
                  return height - labelOffset - 9;
              })
              .attr('x2', (bar_width/2)-3)
              .attr('y2', function() {
                  return height - labelOffset - 2;
              })
              .attr('class','vertical-bar-dash');

          verticalBar.append('text')
              .attr('x', bar_width/2)
              .attr('y', function (d) {
                  return height - labelOffset;
              })
              .attr('dy', '0.6125em')
              .text(function (d) {
                  return d.name.trim();
              })
              .attr('transform', function (d, i) {
                  return 'rotate(' + 95 + ', ' + (bar_width/2) + ',' + (height - labelOffset) + ')';
              });

          verticalBar.on('mouseover', function(d, i) {
              $scope.$apply(function () {
                  $scope.name = d.name.trim();
                  $scope.candidate_contributions = d.candidate_contributions;
                  $scope.detail_link = '/candidate/' + d.candidate_id;
              });

              d3.select('.candidate-info-box').style('display','block');

          });

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
              .attr('transform','translate(10, 0)');
      }
    };

});

controllers.controller('ZipCodeListController', function ($scope, $http) {

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

});

controllers.controller('CandidateDetailsController', function ($scope, $routeParams, $http) {
    $scope.candidateId = $routeParams.candidateId;
    $scope.url = '/api/candidates/' + $scope.candidateId;

    $http.get('/api/candidates/' + $routeParams.candidateId).success(function(candidate) {
        $scope.candidate = candidate;
        console.log('candidate ' + $routeParams.candidateId + '      : ' + candidate.name);
        $scope.total = candidate.total_contributions;
        if (candidate.zip_data) {
            setupMap(candidate[0].zip_data, 'mini_map');
            $scope.zipTotal = candidate[0].zip_data.total;
            $scope.zipCode = candidate[0].zip_data.properties.postalCode;
            $scope.borough = candidate[0].zip_data.properties.borough;
        }
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
            var width = 640;
            var height = 320;
            var bar_height = 40;
            var items = data.length;
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

            setScaleRange(0, width);
            var svg = el
                .append('svg')
                .attr('width',width)
                .attr('height', function(d) {
                    return bar_height * items;
                });

            var bar = svg.append('g')
                .attr('class', 'bar');
//                .attr('transform', function(d) {
//                    return 'translate(' + width/2 + ',' + height/2 + ')';
//                });

            var label = svg.append('g')
                .attr('class', 'label');
//                .attr('transform', function(d) {
//                    return 'translate(' + width/2 + ',' + height/2 + ')';
//                });

            var rect = bar.selectAll('rect')
                .data(data , function(d) {
                    return d.id;
                });

                rect.enter()
                .append('rect')
                .sort(function(a, b) {
                    if (a.total > b.total) { return -1; }
                    if (a.total < b.total) { return 1; }
                    return 0;
                })
                .attr('height', bar_height)
                .attr('width', function (d, i) {
                     return totalScale(d.total);
                })
                .attr('y', function(d, i) {
                    return (i * (bar_height));
                })
                .attr('x', 0)
                .style('fill', function(d) {
//                    setScaleRange(150, 800);
//                    var scaleValue = totalScale(d.total);
//                    var r = Math.floor(scaleValue * 0.025);
//                    var g = Math.floor(scaleValue * 0.25);
//                    var b = Math.floor(scaleValue  * 0.025);
//                    return 'rgb(' + r + ', ' + g + ', ' + b +')';
                      return 'rgb(16, 160, 16)';
                });

            var labels = label
                .selectAll("text")
                .data(data, function (d) {
                    return d.id;
                });

            labels.enter()
                .append("text")
                .sort(function(a, b) {
                    if (a.total > b.total) { return -1; }
                    if (a.total < b.total) { return 1; }
                    return 0;
                })
                .attr('class', 'label-occupation-name')
                .text(function (d) {
                    return d.name;
                })
                .attr('transform', function(d, i) {
                    return 'translate(' + 5 + ',' + ((bar_height * i) + (bar_height/2) - 3) + ')';
                });

            labels.enter()
                .append("text")
                .sort(function(a, b) {
                    if (a.total > b.total) { return -1; }
                    if (a.total < b.total) { return 1; }
                    return 0;
                })
                .attr('class', 'label-occupation-total')
                .text(function (d) {
                    return '$' + d.total.toMoney(2);
                })
                .attr('transform', function(d, i) {
                    return 'translate(' + 5 + ',' + ((bar_height * i) + (bar_height/2) + 12) + ')';
                });
        }
    };
});

var setupMap = function(geoData, selector) {
    var geo = L.geoJson(geoData);
    var bounds = geo.getBounds();
    var map = L.map(selector).setView(bounds.getCenter(), 13);
    geo.addTo(map);
    L.tileLayer('http://{s}.tile.cloudmade.com/f30cb9efcacd473fa9725b30982cd71b/997/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);
};


controllers.controller('CandidateMonthlyController', function ($scope, $routeParams, $http) {

    console.log('CandidateMonthlyController');
    $http.get('/api/candidates/' + $routeParams.candidateId + '/months').success(function(months) {
        console.log(months);
        for(var month in months) {
            months[month].contribution_date = new Date(months[month].contribution_date);
            months[month].total = parseFloat(months[month].total);
        }
        $scope.months = months;
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
              .ticks(6, '$');

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

          svg.append('path')
              .attr('d', pathSegment(data))
              .attr('class', 'candidate-month-line');

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
              .on('mouseover', function(d, i) {
                  $scope.$apply(function () {
                      $scope.month = d.contribution_date.getMonth() + 1;
                      $scope.total = d.total;
                      $scope.year = d.contribution_date.getFullYear();
                  });
                  positionToolTip('candidate_monthly_tooltip', width);
              })
              .on('mouseleave', function() {
                  hideToolTip('candidate_monthly_tooltip');
              });
      }
    };
});

var positionToolTip = function(id, width) {
    var $$tooltip = $('#' + id);
    $$tooltip.css('display','inline-block');
    $$tooltip.css('top', event.y - ($$tooltip.height()/2) + 'px');

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