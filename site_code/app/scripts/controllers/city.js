'use strict';

controllers.controller('CityController',['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {

  var setupMap = function(zipCodes, selector, initalZoom, setDetail) {
    var map = L.map(selector);
    var zipGroup = L.featureGroup();
    for (var i = 0, len = zipCodes.length; i < len; i++) {
      var geo = L.geoJson(zipCodes[i].geojson, {
        onEachFeature: function(feature, layer) {
          if (setDetail) {
            var zipCode = zipCodes[i].zip_code;
            var borough = zipCodes[i].borough;
            var total = zipCodes[i].total;
            var match = zipCodes[i].match;
            var contributions = zipCodes[i].contributions;
            var count = zipCodes[i].count;
            var position = i + 1;

            layer.bindPopup(zipCodes[i].zip_code + '<br>Total: $' + zipCodes[i].total.toMoney() +
                '<br>' + nycCampaignFinanceApp.addOrdinal(position) + ' in contributions.' + '<br> Contributors: ' + zipCodes[i].count);

            layer.on('mouseover', function (e) {
              layer.setStyle( {
                //fillColor: 'rgb(241, 169, 15)',
                color: '#00f',
                opacity: 1,
                weight: 2,
                fillOpacity: '0.9'
              });

              $scope.$apply(function () {
                $scope.zip_code = zipCode;
                $scope.borough = borough;
                $scope.contributions = contributions;
                $scope.total = total;
                $scope.match = match
                $scope.count_contributors = count;
                $scope.position = nycCampaignFinanceApp.addOrdinal(position);
              });
            });

            layer.on('mouseout', function (e) {
              layer.setStyle( {
                //fillColor: feature.color,
                color: '#000',
                weight: 1,
                fillOpacity: '0.9'
              });
            });

            layer.setStyle({
              color: 'rgb(0, 0, 0)',
              weight: 1,
              fillColor: feature.color,
              fillOpacity: 0.9
            });
          }
        }
      });
      zipGroup.addLayer(geo);
    }
    var bounds = zipGroup.getBounds();
    zipGroup.addTo(map);
    map.setView(bounds.getCenter(), initalZoom);
//f30cb9efcacd473fa9725b30982cd71b
    L.tileLayer('http://{s}.tile.cloudmade.com/f30cb9efcacd473fa9725b30982cd71b/997/256/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
      maxZoom: 18
    }).addTo(map);
  };

  var setCityMap = function(cityData) {
    var mean = d3.mean(cityData, function (d) {
      return d.contributions;
    });

    var median = d3.median(cityData, function (d) {
      return d.contributions;
    });

    var max = cityData[0].contributions;
    var min = cityData[cityData.length-1].contributions;

    var map = Array.prototype.map;

    var color = d3.scale.quantile();
    color.domain(
            (function (data) {
              return map.call(data, function(d) {
                console.log(d.contributions);
                return Math.round(d.contributions);
              });
            })(cityData)
        ).range(['#034e7b', '#0c2c84', '#225ea8',
          '#1d91c0', '#41b6c4', '#7fcdbb',
          '#c7e9b4', '#ffffcc', '#f7fcb9',
          '#d9f0a3', '#addd8e', '#78c679',
          '#41ab5d', '#238443', '#006837',
          '#004529']);


    for (var i = 0, len = cityData.length; i < len; i++) {
      cityData[i].geojson.color = color(cityData[i].contributions);
//            console.log(cityData[i].geojson.color + ' - ' + cityData[i].contributions);
    }

    var keyColors = [];

    for (i = 0, len = color.quantiles().length; i < len; i++) {
      //color.quantiles()[i]
      console.log(color.quantiles()[i] + ' - ' + color(color.quantiles()[i]));
    }

    setupMap(cityData, 'city_map', 11, true);

    var width = Math.ceil(640 / color.quantiles().length);
    d3.select('#map_key')
        .append('svg')
        .attr('height', '50')
        .append('g')
        .selectAll('rect')
        .data(color.quantiles())
        .enter()
        .append('rect')
        .attr('height','20')
        .attr('width', width)
        .attr('y','0')
        .attr('x', function(d,i) {
          return (i * width);
        })
        .style('fill', function(d) {
          return color(d);
        });


  };

  $http.get('/api/city/').success(function(cityData) {
    $scope.cityData = cityData;
    $scope.zip_code = cityData[0].zip_code;
    $scope.borough = cityData[0].borough;
    $scope.count_contributors = cityData[0].count;
    $scope.contributions = cityData[0].contributions;
    $scope.total = cityData[0].total;
    $scope.match = cityData[0].match;
    $scope.position = '1st';
    $('.city-map').css('display','block');
    setCityMap(cityData);
    nycCampaignFinanceApp.emitLoaded($rootScope);
  });

}]);