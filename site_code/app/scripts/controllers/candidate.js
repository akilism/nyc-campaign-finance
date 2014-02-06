'use strict';

controllers.controller('CandidateDetailsController',['$scope', '$routeParams', '$http', '$rootScope', function ($scope, $routeParams, $http, $rootScope) {
  $scope.candidateId = $routeParams.candidateId;
  $scope.url = '/api/candidates/' + $scope.candidateId;

  $http.get('/api/candidates/' + $routeParams.candidateId).success(function(candidate) {
    $scope.candidate = candidate;
    $scope.total_contributions = candidate.total_contributions;
    $scope.total_match = candidate.total_match;
    $scope.total = candidate.total;

    $http.get('/api/candidates/' + $routeParams.candidateId + '/occupations/10').success(function(occupations) {
      $scope.candidate.occupations = occupations;
      nycCampaignFinanceApp.emitLoaded($rootScope);
    });
    $http.get('/api/candidates/' + $routeParams.candidateId + '/contributors/10').success(function(contributors) {
      $scope.candidate.contributors = contributors;
    });
    $http.get('/api/candidates/' + $routeParams.candidateId + '/employers/10').success(function(employers) {
      $scope.candidate.employers = employers;
    });
    $http.get('/api/candidates/' + $routeParams.candidateId + '/zip_codes/1').success(function(zip_codes) {
      $scope.candidate.zip_codes = zip_codes;

      if (zip_codes.length > 0) {
        $scope.setupMap(zip_codes, 'mini_map', 13);
        $scope.zipTotal = zip_codes[0].total;
        $scope.zipCode = zip_codes[0].zip_code;
        $scope.borough = zip_codes[0].borough;
      } else { $('.mini-map').css('display','none');}

    });

  });

  $scope.setupMap = function(zipCodes, selector, initalZoom) {
    var map = L.map(selector);
    var zipGroup = L.featureGroup();
    var popup;
    for (var i = 0, len = zipCodes.length; i < len; i++) {
      var geo = L.geoJson(zipCodes[i].geojson, {
        onEachFeature: function(feature, layer) {
          layer.bindPopup(zipCodes[i].borough + ' - ' + zipCodes[i].zip_code + '<br>Total: $' +
                  zipCodes[i].total.toMoney() +
                  '<br> Contributors: ' + zipCodes[i].count,
               popup,
               {
                 'keepInView': true,
                 'closeOnClick': false,
                 'closeButton': false
               });
          console.log(popup);
        }
      });
      zipGroup.addLayer(geo);
    }
    var bounds = zipGroup.getBounds();
    zipGroup.addTo(map);
    map.setView(bounds.getCenter(), initalZoom);
    L.tileLayer('http://{s}.tile.cloudmade.com/f30cb9efcacd473fa9725b30982cd71b/997/256/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
      maxZoom: 15,
      minZoom: 12,
    }).addTo(map);
  };

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
      var width = 960 - margin.left - margin.right;
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
      };


      var svg = el
          .attr('width',width)
          .attr('height', height);

      setScaleRange(0, width-20);

      var axis =d3.svg.axis()
          .scale(totalScale)
          .orient("bottom")
          .ticks(10)
          .tickFormat(nycCampaignFinanceApp.currencyFormat)
          .tickSize(height)
          .tickPadding(10);

      svg.append('g').attr('class','x axis').attr('transform','translate(3, -30)').call(axis);

      var bar = svg.append('g')
          .attr('class', 'bar')
          .attr('transform','translate(3, 0)');

      var label = svg.append('g')
          .attr('class', 'label')
          .attr('transform','translate(3, 0)');

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
    }
  };
}]);