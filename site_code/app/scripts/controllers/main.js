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
                var bar_height = 40;
                var count = data.length;
                var totalBarHeight = 0;
                var domainMax = d3.max(data, function(obj) {
                    return obj.total;
                });
                var domainMin = d3.min(data, function(obj) {
                    return obj.total;
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
                    var g = Math.floor(scaleVal * 0.175);
                    var b = Math.floor(scaleVal  * 0.025);
                    //return 'rgb(' + r + ', ' + g + ', ' + b +')';
                    return 'rgb(21, 150, 21)';
                };

                var buildWiggleBar = function(d, i) {

                    if (!d.total) { return; }
                    var scaleVal = totalScale(d.total);
                    var getElbows = function() {
                        if ((d.remainderBarWidth > 0) && (d.totalBars == 1)) {
                            return 1;
                        } else if (d.remainderBarWidth > 0) {
                            return d.totalBars;
                        } else {
                            return 0;
                        }
                    };

                    d.totalBars = Math.floor(scaleVal/width);
                    d.remainderBarWidth = scaleVal % width;
                    d.elbows = getElbows();
//                    console.log('totalBars             :' + d.totalBars);
//                    console.log('remainderBarWidth     :' + d.remainderBarWidth);
//                    console.log('elbows                :' + d.elbows);
                    if (d.remainderBarWidth > 0) {
                        d3.select(this)
                            .append('rect')
                            .attr('x', function () {
                                if(d.totalBars > 0) {
                                    return ((d.totalBars % 2) == 0) ? (width - d.remainderBarWidth) - bar_height : bar_height - 2;
                                }

                                return 0;
                            })
                            .attr('y', totalBarHeight)
                            .style('fill', getColor)
                            .style('stroke', '#e4eaf0')
                            .style('stroke-width', '2px')
                            .attr('height', bar_height)
                            .attr('width', d.remainderBarWidth);
                        totalBarHeight += bar_height;
                    }

                    for (var x = 0; x < d.totalBars; x++) {
                        d3.select(this)
                            .append('rect')
                            .attr('x', function () {
                                if (d.elbows > 0) {
                                    if (x == d.totalBars - 1) {
                                        return bar_height - 2;
                                    } else if (d.remainderBarWidth > 0) {
                                        return bar_height - 2;
                                    } else {
                                        return 0;
                                    }
                                }//TODO Refactor this conditional.

                                return 0;
                            })
                            .attr('y', totalBarHeight)
                            .style('fill', getColor)
                            .style('stroke', '#e4eaf0')
                            .style('stroke-width', '2px')
                            .attr('height', bar_height)
                            .attr('width', function () {
                                if (d.elbows > 0) {
                                    if (x == d.totalBars - 1) {
                                        return width - bar_height;
                                    } else if (d.remainderBarWidth > 0) {
                                        return width - (bar_height*2) + 2;
                                    } else {
                                        return width-bar_height;
                                    }
                                }
                                return width-2;
                            });
                        totalBarHeight += bar_height;
                    }

                    for (var p = 0; p < d.elbows; p++) {
                        var arc = d3.svg.arc();
                        if((p % 2) == 1) {
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
                            .attr('transform', function() {
                                var getX = function(o) {
                                    return ((o % 2) == 1) ? width - bar_height - 2 : bar_height;
                                };

                                var getY = function(o) {
                                    return (o * bar_height) + totalBarHeight - (bar_height * d.totalBars);
                                };

                                return 'translate(' + getX(p) + ',' + getY(p) + ')';
                            })
                            .style('fill', getColor);
                    }

                    d3.select(this)
                      .append('text')
                      .attr('class','wiggle-label')
                      .text(d.office + ' - ' + '$' + Number(d.total).toMoney(2))
                      .attr('transform', function(d, i) {
                          if (d.remainderBarWidth > 0) { d.totalBars++; }
                          return 'translate(' + 15 + ',' + (totalBarHeight - (d.totalBars * bar_height) + (bar_height/2) + 6) + ')';
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
        if (candidate[0].zip_data) {
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