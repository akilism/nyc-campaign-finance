//From office list controller

$scope.wiggleBarGraph = function(el, data) {
  if(data) {
    var width = 640;
    var height = 320;
    var bar_height = 30;
    var count = data.length;
    var totalBarHeight = 0;
    var domainMax = d3.max(data, function(obj) {
      return Math.round(obj.total_contributions);
    });
    var domainMin = d3.min(data, function(obj) {
      return Math.round(obj.total_contributions);
    });
    var totalScale = d3.scale.linear().domain([0, domainMax]);
    var setScaleRange = function(min, max) {
      totalScale = d3.scale.linear().domain([0, domainMax]);
      totalScale = totalScale.rangeRound([min, max]);
    };

    setScaleRange(200, width);

    var svg = el.attr('width', width);

    var wiggleBar = svg.selectAll('g')
        .data(data, function(d) {
          return d.office_id;
        });

    var getColor = function(d, i) {
      var scaleVal = totalScale(d.total);
      var r = Math.floor(scaleVal * 0.025);
      var g = Math.floor(scaleVal * 0.25);
      var b = Math.floor(scaleVal  * 0.025);
      //return 'rgb(' + r + ', ' + g + ', ' + b +')';
      return 'rgb(16, 160, 16)';
    };

    var buildWiggleBar = function(d, i) {
      if (!d.total_contributions) { return; }
      var scaleVal = totalScale(d.total_contributions);
      d.totalBars = Math.floor(scaleVal/width);
      d.remainderBarWidth = scaleVal % width;
      d.elbows = (d.remainderBarWidth > 0) ? d.totalBars : d.totalBars -1;
//                    console.log('totalBars             :' + d.totalBars);
//                    console.log('remainderBarWidth     :' + d.remainderBarWidth);
//                    console.log('elbows                :' + d.elbows);

      var getX = function(x) {
        return ((x % 2) === 0) ? width - bar_height - 2 : bar_height;
      };

      var getY = function(x) {
        return (x * bar_height) + totalBarHeight - (bar_height * d.totalBars);
      };

      for (var x = 0; x < d.totalBars; x++) {
        d3.select(this)
            .append('rect')
            .attr('x', function () {
              if (d.elbows > 0) {
                if (x == 0) {
                  return 0;
                } else if ((x > 0) && (d.remainderBarWidth > 0)) {
                  return bar_height - 2;
                } else {
                  return 0;
                }
              }//TODO Refactor this conditional.

              return 0;
            })
            .attr('y', totalBarHeight)
            .style('fill', getColor)
            .style('stroke', '#ffffff')
            .style('stroke-width', '2px')
            .attr('height', bar_height)
            .attr('width', function () {
              if (d.elbows > 0) {
                if (x == 0) {
                  return width - bar_height;
                } else if ((x > 0) && (d.remainderBarWidth > 0)) {
                  return width - (bar_height*2) + 2;
                } else {
                  return width-bar_height;
                }
              }
              return width;
            });

        totalBarHeight += bar_height;
      }

      if (d.remainderBarWidth > 0) {
        d3.select(this)
            .append('rect')
            .attr('x', function () {
              if(d.totalBars > 0) {
                return ((d.totalBars % 2) == 0) ? bar_height - 2 : (width - d.remainderBarWidth) - bar_height;
              }

              return 0;
            })
            .attr('y', totalBarHeight)
            .style('fill', getColor)
            .style('stroke', '#ffffff')
            .style('stroke-width', '2px')
            .attr('height', bar_height)
            .attr('width', d.remainderBarWidth);
        totalBarHeight += bar_height;
      }

      for (var x = 0; x < d.elbows; x++) {
        var arc = d3.svg.arc();
        if((x % 2) == 0) {
          arc.innerRadius(2)
              .outerRadius(bar_height-1)
              .startAngle(0)
              .endAngle(Math.PI);
        } else {
          arc.innerRadius(2)
              .outerRadius(bar_height-1)
              .startAngle(Math.PI)
              .endAngle(Math.PI*2);
        }
        d3.select(this)
            .append('path')
            .attr('d', arc)
            .attr('transform', function(d) {
              return 'translate(' + getX(x) + ',' + getY(x) + ')';
            })
            .style('fill', getColor);
      }

      d3.select(this)
          .append('text')
          .attr('class','wiggle-label')
          .text(d.office + ' - ' + '$' + Number(d.total_contributions).toMoney(2))
          .attr('transform', function(d, i) {
            if (d.remainderBarWidth > 0) { d.totalBars++; }
            return 'translate(' + 5 + ',' + (totalBarHeight - (d.totalBars * bar_height) + (bar_height/2) + 6) + ')';
          });
    };

    wiggleBar.enter()
        .append('g')
        .each(buildWiggleBar)
        .on('click', function (d, i) {
          window.location.href = '/office/' + d.office_id;
        });
    //.attr('transform','rotate(180, ' + width/2 + ',' + totalBarHeight/2 + ')');

    if (totalBarHeight > 0) {
      svg.attr('height', totalBarHeight);
    }
  }
};

$scope.officeDonut = function(el, data) {
  if (data) {
    var width = 640;
    var height = 480;
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

    var getColor = function(d) {
      setScaleRange(150, 800);
      var scaleValue = totalScale(d.value);
      var r = Math.floor(scaleValue * 0.025);
      var g = Math.floor(scaleValue * 0.25);
      var b = Math.floor(scaleValue  * 0.025);
      return 'rgb(' + r + ', ' + g + ', ' + b +')';
    };

    var svg = el
        .attr('width',width)
        .attr('height', height);

    var tick = function (e) {
      circles.selectAll('circle')
          .each(cluster(10 * e.alpha * e.alpha))
          .each(collide(.5))
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    };

    var force = d3.layout.force()
        .nodes(data)
        .size([width. height])
        .gravity(.02)
        .on('tick', tick)
        .start();


    var circles = svg.append('g')
        .attr('class', 'circles')
        .selectAll('circle').data(data).enter();

    setScaleRange(0, height);
    circles.append('circle')
        .attr('r', function (d) {
          setScaleRange(10,50);
          return totalScale(d.total_contributions);
        })
        .attr('class','office-circle')
        .attr('fill', getColor)
        .call(force.drag);
  }
};

//from candidate details

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