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

              layer.bringToFront();

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
      maxZoom: 17,
      minZoom: 11
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
               // console.log(d.contributions);
                return Math.round(d.contributions);
              });
            })(cityData)
        ).range(['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b']);
//        .range(['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704']);
//        .range(['#034e7b', '#0c2c84', '#225ea8',
//          '#1d91c0', '#41b6c4', '#7fcdbb',
//          '#c7e9b4', '#ffffcc', '#f7fcb9',
//          '#d9f0a3', '#addd8e', '#78c679',
//          '#41ab5d', '#238443', '#006837',
//          '#004529']);

    for (var i = 0, len = cityData.length; i < len; i++) {
      cityData[i].geojson.color = color(cityData[i].contributions);
    }

    var keyColors = [];

    setupMap(cityData, 'city_map', 11, true);

    var blockWidth = 50; //= Math.ceil(640 / color.quantiles().length);
    var blockHeight = 20;
    var height = color.quantiles().length * blockHeight;

    var svg = d3.select('#map_key')
        .append('svg')
        .attr('height', height)
        .attr('width', 200)
        .attr('class', 'map-key');
    var key = svg.selectAll('.key-block')
        .data(color.quantiles());

    var keyEnter = key.enter().append('g')
        .attr('transform', function(d, i) {
          return 'translate(0,' + (i * blockHeight) +  ')';
        })
        .attr('class', 'key-block');

     keyEnter.append('rect')
        .attr('height', blockHeight)
        .attr('width', blockWidth)
        .attr('y','0')
        .style('fill', function(d) {
          return color(d);
        });

    var prevAmt = '$0.00';
    var count = color.quantiles().length;

    keyEnter.append('text')
        .text(function (d, i) {
          if(i === 0) {

          } else if(i === count) {

          } else {

          }

          var dStr = '$' + parseInt(d, 10).toMoney();
          var keyStr = prevAmt + ' - ' + dStr ;
          prevAmt = dStr;
          return dStr;

        })
        .attr('x', blockWidth + 10)
        .attr('y', 4)
        .attr('dy', blockHeight / 2);


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