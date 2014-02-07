'use strict';

controllers.controller('OfficeListController',['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {

  $scope.option = 'total';

  $http.get('/api/offices').success(function(offices) {
    $scope.total = 0;
    for (var x = 0, len = offices.length; x < len; x++) {
      $scope.total += offices[x].total;
    }

    $scope.offices = offices;
    nycCampaignFinanceApp.emitLoaded($rootScope);
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
          .padding(12)
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
          .attr('transform', function(d) { return 'translate(' + d.x + ',' + (d.y-120) + ')' });

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
          $scope.value = nycCampaignFinanceApp.getValue(d.value, $scope.option);
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



      var officeUpdate = d3.transition(office)
          .attr('transform', function(d) { return 'translate(' + d.x + ',' + (d.y-120) + ')' });

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

}]);