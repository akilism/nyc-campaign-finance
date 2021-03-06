'use strict';

controllers.controller('CandidateDetailsController',['$scope', '$routeParams', '$http', '$rootScope', 'candidate',
  function ($scope, $routeParams, $http, $rootScope, candidate) {
    nycCampaignFinanceApp.emitLoaded($rootScope);
    $scope.candidateId = $routeParams.candidateId;
    $scope.candidate = candidate;
    $scope.total_contributions = candidate.total_contributions;
    $scope.total_match = candidate.total_match;
    $scope.total = candidate.total;
    $scope.zip_codes = candidate.zip_codes;

    console.log(candidate);
    $scope.breadCrumb = function() {
      return '<a href="/" title="Offices">Offices</a> > <a href="/office/' + $scope.candidate.office_id + '" alt="' + $scope.candidate.office + '">';
    };

    $scope.setupMap = function(zipCodes, selector, initalZoom) {
      var map = L.map(selector);
      var zipGroup = L.featureGroup();
      for (var i = 0, len = zipCodes.length; i < len; i++) {
        var geo = L.geoJson(zipCodes[i].geojson, {
          onEachFeature: function(feature, layer) {
            layer.bindPopup(zipCodes[i].borough + ' - ' + zipCodes[i].zip_code + '<br>Total: $' +
                zipCodes[i].total.toMoney() +
                '<br> Contributors: ' + zipCodes[i].count,
                {
                  'keepInView': true,
                  'closeOnClick': false,
                  'closeButton': false
                });
          }
        });
        zipGroup.addLayer(geo);
      }
      var bounds = zipGroup.getBounds();
      zipGroup.addTo(map);
      var zipLayers = zipGroup.getLayers()[0].getLayers();
      if (zipLayers.length > 0) {
        var popup = zipLayers[0]._popup;
        popup.setLatLng(bounds.getCenter());
        popup.openOn(map);
      }

      map.setView(bounds.getCenter(), initalZoom);

      L.tileLayer('http://api.tiles.mapbox.com/v3/akilism.i31nhlpm/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 15,
        minZoom: 12
      }).addTo(map);

    };

    $scope.nameTotalBarGraph = function(el, data) {
      if (data) {
        var margin = { top: 0, right: 0, bottom: 0, left: 0 };
        var width = 900 - margin.left - margin.right;
        var bar_height = 25;
        var count = data.length;
        var height = (bar_height * count) + 30;
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

        var maxName = d3.max(data, function(obj) {
          return obj.name.length;
        });

        var labelOffset = (maxName + .5) * 7.45;

        var sorter = function(a, b) {
          if (a.total_contributions > b.total_contributions) { return -1; }
          if (a.total_contributions < b.total_contributions) { return 1; }
          return 0;
        };


        var color = d3.scale.quantile();
        color.domain([0, domainMax])
            .range(['#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b']);

        var svg = el
            .attr('width',width)
            .attr('height', height);

        setScaleRange(10, width - labelOffset - 33);

        var axis =d3.svg.axis()
            .scale(totalScale.nice(5))
            .orient("bottom")
            .ticks(5)
            .tickFormat(nycCampaignFinanceApp.currencyFormat)
            .tickSize(height - 25)
            .tickPadding(5);

        svg.append('g').attr('class','x axis').attr('transform','translate(' + (labelOffset-10) + ', 0)').call(axis);

        var bar = svg.append('g')
            .attr('class', 'bar')
            .attr('transform','translate(' + labelOffset + ', 0)');

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
            .style('fill', function(d) {
              return color(d.total_contributions);
            });

        var labels = label
            .selectAll("text")
            .data(data, function (d) {
              return d.id;
            });

        setScaleRange(0, width);

        labels.enter()
            .append("text")
            .sort(sorter)
            .attr('class', 'bar-label-name')
            .text(function(d) {
              return d.name;
            })
            .attr('text-anchor', 'end')
            .attr('dx', function () {
              return (maxName / 2) + 'em';
            })
            .attr('y', function(d, i) {
              return ((i + 1) * bar_height) - 10;
            })
            .attr('x', function (d) {
              return 0;
            });

        rect.on('mouseover', function(d, i) {
          $scope.$apply(function () {
            $scope.name = d.name;
            $scope.value = '$' + d.total_contributions.toMoney();
          });
          nycCampaignFinanceApp.positionToolTip('bar_info', '', d3.event);
        })
            .on('mouseleave', function() { nycCampaignFinanceApp.hideToolTip('bar_info'); })
            .on('mousemove', function () { nycCampaignFinanceApp.positionToolTip('bar_info', '', d3.event); })

      }
    };

    if ($scope.zip_codes && $scope.zip_codes.length > 0 && $scope.zip_codes[0].geojson) {
      $scope.setupMap($scope.zip_codes, 'mini_map', 13);
      $scope.zipTotal = $scope.zip_codes[0].total;
      $scope.zipCode = $scope.zip_codes[0].zip_code;
      $scope.borough = $scope.zip_codes[0].borough;
    } else { $('.mini-map').css('display','none'); }




  }]);
