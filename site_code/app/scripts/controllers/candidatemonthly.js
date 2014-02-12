'use strict';

controllers.controller('CandidateMonthlyController',['$scope', '$routeParams', '$http', function ($scope, $routeParams, $http) {

  $http.get('/api/candidate/' + $routeParams.candidateId + '/months').success(function(months) {
    for(var i = 0, len = months.length; i < len; i++) {
      months[i].contribution_date = new Date(months[i].contribution_date);
      months[i].total = parseFloat(months[i].total);
    }
    $scope.months = months;
    $scope.month_total = 0.0;
  });

  $scope.candidateMonthlyGraphRenderer = function(el, data) {
    if(data) {

      var domainMax = d3.max(data, function(obj) {
        return Math.round(obj.total);
      });

      var margin = {top: 0, right: 0, bottom: 0, left: (domainMax > 900000) ? 90 : 90};
      var width = 900 - margin.left - margin.right;
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
          .tickFormat(nycCampaignFinanceApp.currencyFormat);

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
          .on('mousemove', function(d, i) {
            $scope.$apply(function () {
              $scope.month = d.contribution_date.getMonth() + 1;
              $scope.month_total = d.total;
              $scope.year = d.contribution_date.getFullYear();
            });
            nycCampaignFinanceApp.positionToolTip('candidate_monthly_tooltip', width, d3.event);
          })
          .on('mouseleave', function() {
            nycCampaignFinanceApp.hideToolTip('candidate_monthly_tooltip');
          });
    }
  };
}]);