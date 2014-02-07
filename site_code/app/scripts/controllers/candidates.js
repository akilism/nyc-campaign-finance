'use strict';

controllers.controller('OfficeCandidateListController',['$scope', '$routeParams', '$http', '$window', '$rootScope',
  function ($scope, $routeParams, $http, $window, $rootScope) {
    $scope.officeId = $routeParams.officeId;
    $scope.url = '/api/offices/' + $scope.officeId;
    $scope.option = 'candidate_total';
    $http.get('/api/offices/' + $routeParams.officeId).success(function(candidates) {

      $scope.office = candidates[0].office;
      $scope.candidate_name = '';
      $scope.candidate_value = '';
      $scope.candidate_contributions = '';
      $scope.candidate_match = '';
      $scope.detail_link = '';
      $scope.selectedCandidates = candidates.slice(0, 5);
      $scope.candidates = candidates.sort(function (a, b) {
        if(a.name < b.name) { return -1; }

        if(a.name > b.name) { return 1; }

        return 0;
      });
      nycCampaignFinanceApp.emitLoaded($rootScope);
  //        console.log('office ' + $routeParams.officeId + '      : ' + candidates);
  });

  $scope.byTotal = function byTotal() {
    $scope.option = 'candidate_total';
    d3.transition().duration(550).each(function() { $scope.verticalBarGraphRenderer($scope.el, $scope.selectedCandidates); });
  };
  $scope.byContributions = function byContributions() {
    $scope.option = 'candidate_contributions';
    d3.transition().duration(550).each(function() { $scope.verticalBarGraphRenderer($scope.el, $scope.selectedCandidates); });
  };
  $scope.byMatch = function byMatch() {
    $scope.option = 'candidate_match';
    d3.transition().duration(550).each(function() { $scope.verticalBarGraphRenderer($scope.el, $scope.selectedCandidates); });
  };
  $scope.byContributors = function byContributors() {
    $scope.option = 'count_contributors';

    d3.transition().duration(550).each(function() { $scope.verticalBarGraphRenderer($scope.el, $scope.selectedCandidates); });
  };

  $scope.verticalBarGraphRenderer = function (el, data) {
    if (!$scope.el) {
      $scope.el = el;
    }

    if(data && data.length > 0) {
      var count_candidates = data.length;
      var margin = {top: 20, right: 0, bottom: 0, left: 5}
      var width = 795 - margin.left - margin.right;
      var height = 640 - margin.top - margin.bottom;
      var labelOffset = 225;
      var bar_width = 35; //(width / count_candidates) > 20 ? width / count_candidates : 20;

//      if (bar_width == 20) {
//        width = (22) * count_candidates;
//      }

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

      setScaleRange(0, width - 30 - labelOffset);

      if (!$scope.svg) {

        $scope.svg = el.attr('width', width)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

        $scope.svg.insert("g")
            .attr("class", "x axis")
            .attr('transform','translate(' + labelOffset + ', ' + (height - 30) + ')');;
      }

      var svg = $scope.svg;

      var xAxis =d3.svg.axis()
          .scale(totalScale)
          .orient("top")
          .ticks(5)
          .tickSize(height - 30)
          .tickPadding(10);

      if($scope.option !== 'count_contributors') {
       xAxis.tickFormat(nycCampaignFinanceApp.currencyFormat);
      }

      var verticalBar = svg.selectAll('.vertical-bar')
          .data(data, function(d) {
            return d.candidate_id;
          }).sort(function (a, b) {
            return b[$scope.option] - a[$scope.option];
          });

      var vertEnter = verticalBar.enter().append('g').attr('transform', function(d, i) {
        return 'translate(' + labelOffset + ',' + ((i * bar_width)+15) + ')';
      })
          .attr('class', 'vertical-bar');

      vertEnter.append('rect')
//          .attr('x', function(d) {
//            return totalScale(d[$scope.option]) - 10;
//          })
          .attr('width', function(d) {
            return totalScale(d[$scope.option]);
          })
          .attr('height', bar_width - 5);

//      vertEnter.append('line')
//          .attr('x1', (bar_width/2)-3)
//          .attr('y1', function () {
//            return height - labelOffset - 9;
//          })
//          .attr('x2', (bar_width/2)-3)
//          .attr('y2', function() {
//            return height - labelOffset - 2;
//          })
//          .attr('class','vertical-bar-dash');
      vertEnter.append('text')
          .attr('x', function (d) {
            return 0;
          })
          .attr('y', function (d) {
            //return height - labelOffset;
            return (bar_width/2) + 5;
          })
          .attr('text-anchor', 'end')
          .attr('dx', '-.5em')
          //.attr('dy', '0.6125em')
          .text(function (d) {
            return d.name.trim();
          });
//          .attr('transform', function (d, i) {
//            return 'rotate(' + (70) + ', ' + (bar_width/2) + ',' + (height - labelOffset) + ')';
//          });

      verticalBar.on('mouseover', function(d, i) {
        $scope.$apply(function () {
          $scope.candidate_name = d.name.trim();
          $scope.candidate_value = $scope.value = nycCampaignFinanceApp.getValue(d[$scope.option], $scope.option);
          $scope.candidate_total = d.candidate_total;
          $scope.candidate_match = d.candidate_match;
          $scope.candidate_contributions = d.candidate_contributions;
          $scope.count_contributors = d.count_contributors.toLocaleString();
          $scope.detail_link = '/candidate/' + d.candidate_id;
        });
      })
      .on('mouseleave', function() {
        nycCampaignFinanceApp.hideToolTip('candidate_info');
      })
      .on('mousemove', function () {
        nycCampaignFinanceApp.positionToolTip('candidate_info');
      })
      .on('click', function(d, i) {
        $window.location.href = $scope.detail_link;
      });

      var barUpdate = d3.transition(verticalBar)
          .attr('transform', function(d, i) {
            return 'translate(' + labelOffset + ', ' + ((i * bar_width)+15) + ')';
          });

      barUpdate.select('rect')
          .attr('width', function(d) {
            return totalScale(d[$scope.option]);
          })
          .attr('height', function(d, i) {
            return bar_width - 5;
          });
//          .attr('x', function(d) {
//            return totalScale(d[$scope.option]) - 10;
//          });

//      barUpdate.select('text')
//          .attr('x', bar_width/2)
//          .attr('y', function (d) {
//            return height - labelOffset;
//          })
//          .attr('dy', '0.6125em')
//          .text(function (d) {
//            return d.name.trim();
//          })
//          .attr('transform', function (d, i) {
//            return 'rotate(' + (70) + ', ' + (bar_width/2) + ',' + (height - labelOffset) + ')';
//          });

      verticalBar.exit().remove();

      d3.transition(svg).select('.x.axis').call(xAxis);
    }
  };



  $scope.toggleSelected = function ($event, i) {

    $(event.target).toggleClass('active');
    //var i = parseInt($event.target.id.replace('can_', ''), 10);
    var selectedIdx = $scope.selectedCandidates.indexOf($scope.candidates[i]);

    if (selectedIdx === -1) {
      $scope.selectedCandidates.push($scope.candidates[i]);
    } else {
      $scope.selectedCandidates.splice(selectedIdx, 1);
    }

    d3.transition().duration(550).each(function() { $scope.verticalBarGraphRenderer($scope.el, $scope.selectedCandidates); });
  };

    $scope.removeActive = function($event, candidate_id) {
      console.log($scope.selectedCandidates);

      candidate_id = parseInt(candidate_id, 10);

      $('#can_' + candidate_id).removeClass('active');

      for (var i = 0, len = $scope.selectedCandidates.length; i < len; i++) {
         if($scope.selectedCandidates[i].candidate_id === candidate_id) {
           $scope.selectedCandidates.splice(i, 1);

         }
      }
    };

    $scope.isSelected = function(candidate_id) {
        
    };
}]);