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

nycCampaignFinanceApp.positionToolTip = function(id, width, event) {
  var $$tooltip = $('#' + id);
  $$tooltip.css('display','inline-block');
  var y = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
  $$tooltip.addClass('shown');

  $$tooltip.css({
    'top':  (event.pageY - ($$tooltip.height()/2) - y) + 'px',
    'left':  event.pageX + 10 + 'px'
  });
};

nycCampaignFinanceApp.hideToolTip = function(id) {
    var $$tooltip = $('#' + id);
    $$tooltip.removeClass('shown');
    $$tooltip.css('display','none');
};

nycCampaignFinanceApp.currencyFormat = function (d) {
    if(d === 0) { return d; }
    return "$" + parseFloat(d).toMoney();
};

nycCampaignFinanceApp.addOrdinal = function (num) {
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
};

nycCampaignFinanceApp.emitLoaded = function ($rootScope) {
  $rootScope.$emit('$NYCCampFiLoaded');
};

nycCampaignFinanceApp.getValue = function getValue(val, option) {
  var is_contributor = (option.indexOf('count') != -1);
  option = option.replace('_',' ');

  if (is_contributor) {
    return val.toLocaleString();
  }

  return '$' + val.toMoney();
}

nycCampaignFinanceApp.sort = function sort($event, option, $scope, viz, data) {
  if ($scope.option === option) { return; }
  nycCampaignFinanceApp.toggleActiveOption($event.target);
  $scope.option = option;
  d3.transition().duration(550).each(function() { $scope[viz]($scope.el, $scope[data]); });
};

nycCampaignFinanceApp.toggleActiveOption = function(target) {
  $('.active-option').toggleClass('active-option');
  $(target).toggleClass('active-option');
};