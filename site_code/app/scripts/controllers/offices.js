'use strict';

controllers.controller('OfficeListController',['$scope', '$http', '$rootScope', 'offices',
  function ($scope, $http, $rootScope, offices) {
    nycCampaignFinanceApp.emitLoaded($rootScope);
    $scope.option = 'total';
    $scope.offices = offices;
    $scope.total = 0;

    $scope.total = offices.reduce(function(prev, curr) {
      if(isNaN(prev)) { return prev.total + curr.total; }
      return prev + curr.total;
    });



    $scope.byTotal = function byTotal($event) {
      nycCampaignFinanceApp.sort($event, 'total', $scope, 'officeBubble', 'offices');
    };

    $scope.byContributions = function byContributions($event) {
      nycCampaignFinanceApp.sort($event, 'total_contributions', $scope, 'officeBubble', 'offices');
    };

    $scope.byMatch = function byMatch($event) {
      nycCampaignFinanceApp.sort($event, 'total_match', $scope, 'officeBubble', 'offices');
    };

    $scope.byContributors = function byContributors($event) {
      nycCampaignFinanceApp.sort($event, 'count_contributors', $scope, 'officeBubble', 'offices');
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
            ).range(['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b']);

        var fontColor = d3.scale.quantile();
        fontColor.domain(
                (function (data) {
                  return map.call(data, function(d) {
                    return Math.round(d[$scope.option]);
                  });
                })(data)
            ).range(['#000', '#fff']);

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

        //Setup pack layout.
        var bubbles = d3.layout.pack()
            .sort(null)
            .size([diameter, diameter])
            .padding(12)
            .nodes(root)
            .filter(function (d) {
              return !d.children;
            });

        //add bubble groups.
        var bubble = svg.selectAll('g')
            .data(bubbles)
            .sort(function (a, b) {
              return b[$scope.option] - a[$scope.option];
            });

        var bubbleEnter = bubble.enter()
            .append('g')
            .attr('class','bubble')
            .attr('transform', function(d) { return 'translate(' + d.x + ',' + (d.y-120) + ')' });

        bubbleEnter.append('circle').transition()
            .attr('r', function(d) {
              return d.r + 4;
            })
            .style('fill', function (d) {
              return color(d.value);
            })
            .style('stroke','rgb(189, 255, 210)')
            .style('stroke-width', '2px');


        bubbleEnter.append('text')
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

        bubbleEnter.append('text')
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

        bubbleEnter.on('click', function (d, i) {
          window.location.href = '/office/' + d.office_id;
        });
        bubbleEnter.on('mouseover', function(d, i) {
          $scope.$apply(function () {
            $scope.displayClass = 'shown';
            $scope.name = d.name;
            $scope.value = nycCampaignFinanceApp.getValue(d.value, $scope.option);
          });
          nycCampaignFinanceApp.positionToolTip('office_details', '', d3.event);
        });
        bubbleEnter.on('mouseout', function () {
          nycCampaignFinanceApp.hideToolTip('office_details', d3.event);
        });
        bubbleEnter.on('mousemove', function (d, i) {
          nycCampaignFinanceApp.positionToolTip('office_details', '', d3.event);
        });

        var bubbleUpdate = bubble.transition()
            .attr('transform', function(d) { return 'translate(' + d.x + ',' + (d.y-120) + ')' });

        bubbleUpdate.select('circle')
            .attr('r', function(d) {
              return d.r + 4;
            })
            .style('fill', function (d) {
              return color(d.value);
            })
            .style('stroke','rgb(189, 255, 210)')
            .style('stroke-width', '1px');

        bubble.select('.bubble-name')
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

        bubble.select('.bubble-value')
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
      }
    };
}]);