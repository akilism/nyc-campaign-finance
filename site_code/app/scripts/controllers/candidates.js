'use strict';

controllers.controller('OfficeCandidateListController',['$scope', '$routeParams', '$http', '$window', 'candidates',
  function ($scope, $routeParams, $http, $window, candidates) {
    $scope.officeId = $routeParams.officeId;
    $scope.option = 'candidate_total';
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

    for(var i = 0, len = $scope.selectedCandidates.length; i < len; i++) {
      $('#can_' + $scope.selectedCandidates[i].id).addClass('active');
    }

    $scope.byTotal = function byTotal($event) {
    nycCampaignFinanceApp.sort($event, 'candidate_total', $scope, 'barGraphRenderer', 'selectedCandidates');
  };

    $scope.byContributions = function byContributions($event) {
    nycCampaignFinanceApp.sort($event, 'candidate_contributions', $scope, 'barGraphRenderer', 'selectedCandidates');
  };

    $scope.byMatch = function byMatch($event) {
    nycCampaignFinanceApp.sort($event, 'candidate_match', $scope, 'barGraphRenderer', 'selectedCandidates');
  };

    $scope.byContributors = function byContributors($event) {
    nycCampaignFinanceApp.sort($event, 'count_contributors', $scope, 'barGraphRenderer', 'selectedCandidates');
  };

    $scope.barGraphRenderer = function (el, data) {
    if (!$scope.el) {
      $scope.el = el;
    }

    if(data && data.length > 0) {
      var countCandidates = data.length;
      var margin = {top: 20, right: 0, bottom: 0, left: 5}
      var width = 760 - margin.left - margin.right;
      var height = 600 - margin.top - margin.bottom;
      var barHeight = 35; //(width / countCandidates) > 20 ? width / countCandidates : 20;

      var domainMax = d3.max(data, function(obj) {
        return Math.round(obj[$scope.option]);
      });

      var domainMin = d3.min(data, function(obj) {
        return Math.round(obj[$scope.option]);
      });

      var maxName = d3.max(data, function(obj) {
        return (obj.name.trim().length < 27) ? obj.name.trim().length : 27;
      });

      var labelOffset = (maxName + .5) * 9;

      var totalScale = null;

      var setScaleRange = function(min, max) {
        totalScale = d3.scale.linear().domain([0, domainMax]);
        totalScale = totalScale.rangeRound([min, max]);
      };

      //Shrink the scale range down to fit a little padding and the labels.
      setScaleRange(10, width - 30 - labelOffset);

      //Setup the svg.
      if (!$scope.svg) {
        $scope.svg = el.attr('width', width)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform','translate(0,' + margin.top + ')');

        $scope.svg.insert("g")
            .attr('class', 'x axis')
            .attr('transform','translate(' + (labelOffset- 10) + ', ' + (height - 30) + ')');;
      }

      var svg = $scope.svg;

      //Setup the X axis. Align to top.
      var xAxis =d3.svg.axis()
          .scale(totalScale.nice(5))
          .orient('top')
          .ticks(5)
          .tickSize(height - 30)
          .tickPadding(10);

      //count of contributors is not a currency.
      if($scope.option !== 'count_contributors') {
       xAxis.tickFormat(nycCampaignFinanceApp.currencyFormat);
      }

      var bar = svg.selectAll('.vertical-bar')
          .data(data, function(d) {
            return d.candidate_id;
          }).sort(function (a, b) {
            return b[$scope.option] - a[$scope.option];
          });

      //Add Horizontal Bars.
      var barEnter = bar.enter().append('g').attr('transform', function(d, i) {
        return 'translate(' + labelOffset + ',' + ((i * barHeight)+15) + ')';
      })
      .attr('class', 'vertical-bar');

      barEnter.append('rect')
      .attr('width', function(d) {
        return totalScale(d[$scope.option]);
      })
      .attr('height', barHeight - 5);

      //Add text labels on the left. Right align.
      barEnter.append('text')
      .attr('x', function (d) {
        return 0;
      })
      .attr('y', function (d) {
        return (barHeight/2) + 5;
      })
      .attr('text-anchor', 'end')
      .attr('dx', function () {
        return '-.5em';
      })
      .text(function (d) {
        return d.name.trim();
      });

      //Add event handlers.
      bar.on('mouseover', function(d, i) {
        $scope.$apply(function () {
          $scope.candidate_name = d.name.trim();
          $scope.candidate_value = $scope.value = nycCampaignFinanceApp.getValue(d[$scope.option], $scope.option);
          $scope.candidate_total = d.candidate_total;
          $scope.candidate_match = d.candidate_match;
          $scope.candidate_contributions = d.candidate_contributions;
          $scope.count_contributors = d.count_contributors.toLocaleString();
          $scope.detail_link = '/candidate/' + d.candidate_id;
        });
        nycCampaignFinanceApp.positionToolTip('candidate_info', '', d3.event);
      })
      .on('mouseleave', function() {
        nycCampaignFinanceApp.hideToolTip('candidate_info');
      })
      .on('mousemove', function () {
        nycCampaignFinanceApp.positionToolTip('candidate_info', '', d3.event);
      })
      .on('click', function(d, i) {
        $window.location.href = $scope.detail_link;
      });


      //Update Transition for bars.
      var barUpdate = bar.transition()
      .attr('transform', function(d, i) {
        return 'translate(' + labelOffset + ', ' + ((i * barHeight)+15) + ')';
      });

      barUpdate.select('rect')
      .attr('width', function(d) {
        return totalScale(d[$scope.option]);
      })
      .attr('height', function(d, i) {
        return barHeight - 5;
      });

      bar.exit().remove();

      //x axis update transition.
      d3.transition(svg).select('.x.axis').call(xAxis);
    }
  };

    $scope.toggleSelected = function ($event, i) {

    $($event.target).toggleClass('active');
    //var i = parseInt($event.target.id.replace('can_', ''), 10);
    var selectedIdx = $scope.selectedCandidates.indexOf($scope.candidates[i]);

    if (selectedIdx === -1) {
      //check if len is 15. //max that will fit.
      if($scope.selectedCandidates.length === 15) {
        $('#can_' + $scope.selectedCandidates[0].candidate_id).removeClass('active');
        $scope.selectedCandidates.splice(0, 1, $scope.candidates[i]);
      } else {
        $scope.selectedCandidates.push($scope.candidates[i]);
      }
    } else {
      $scope.selectedCandidates.splice(selectedIdx, 1);
    }

    $scope.setWindow();
    d3.transition().duration(550).each(function() { $scope.barGraphRenderer($scope.el, $scope.selectedCandidates); });
  };

    $scope.isSelected = function(candidate_id) {
    for(var i = 0, len = $scope.selectedCandidates.length; i < len; i++) {
      if($scope.selectedCandidates[i].candidate_id === candidate_id) {
        return true;
      }
    }
    return false;
  };

    $scope.removeActive = function($event, candidate_id, i) {
    candidate_id = parseInt(candidate_id, 10);

    $('#can_' + candidate_id).removeClass('active');

    if($scope.isSelected(candidate_id)) {
      $scope.selectedCandidates.splice(i, 1);
      $scope.setWindow();
    }
  };

    $scope.addActive = function(candidate_id) {
    candidate_id = parseInt(candidate_id, 10);

    if($scope.isSelected(candidate_id)) {
        $('#can_' + candidate_id).addClass('active');
    }
  };

    $scope.setWindow = function() {
    if ($scope.selectedCandidates.length === 0) {
      $('.candidates').addClass('hide');
    } else {
      $('.candidates').removeClass('hide');
    }
  };

}]);