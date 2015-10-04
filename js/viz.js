// set default value for heatmap color block variance
var block_number = 70;
// Initialize sidebar to help text
$("#sidebar_title").text("Getting Started");
$("#sidebar_description").text("Click on a tile to display more information about that hour. Filter the data using the buttons at the top right.");

function displayHeatmap(filter) {
  // Rewrite heatmap title with appropriate text
  $("#heatmap_label").text("Heatmap: " + filter)

  // Remove previous chart
  d3.select("svg").remove();
  // Render heatmap 
  d3.csv("show_data.csv",
    function(d) { 
      // switch heatmap data source based on button clicked
      switch (filter) {
        case "Pageviews, Callers, & Online Listeners":
          return {
            day: +d.day,
            hour: +d.hour,
            listeners: +d.listeners,
            pageviews: +d.pageviews,
            callerlog: +d.callerlog,
            total: +d.listeners + +d.pageviews + +d.callerlog,
            description: d.description,
            showName: d.showName,
            slug: d.slug,
            archive_slug: d.archive_slug
          };          
        break;
      case "Listeners":
        block_number = 35;
        return {
          day: +d.day,
          hour: +d.hour,
          listeners: +d.listeners,
          pageviews: +d.pageviews,
          callerlog: +d.callerlog,
          total: +d.listeners,
          description: d.description,
          showName: d.showName,
          slug: d.slug,
          archive_slug: d.archive_slug
        };          
      break;
      case "Pageviews":
        block_number = 50;
        return {
          day: +d.day,
          hour: +d.hour,
          listeners: +d.listeners,
          pageviews: +d.pageviews,
          callerlog: +d.callerlog,
          total: +d.pageviews,
          description: d.description,
          showName: d.showName,
          slug: d.slug,
          archive_slug: d.archive_slug
        };          
      break;
      case "# Callers":
        block_number = 5;
        return {
          day: +d.day,
          hour: +d.hour,
          listeners: +d.listeners,
          pageviews: +d.pageviews,
          callerlog: +d.callerlog,
          total: +d.callerlog,
          description: d.description,
          showName: d.showName,
          slug: d.slug,
          archive_slug: d.archive_slug
        };          
      break;
      }

    },
    function(error, data) {      
      // load size, color, and label info
      var margin = { top: 30, right: 0, bottom: 180, left: 30 },
            width = 700 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom,
            gridSize = Math.floor(width / 24),
            legendElementWidth = gridSize*2,
            buckets = block_number,
            colors = ["#a7eaf1","#83E0EC","#60D7E6","#3DCEE1","#21BFD4","#1C9FB0"],
            days = ["Mo", "Tu", "We", "Th", "Fr", "Sa","Su"],
            times = ["12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"];

      // Heatmap
      // Uses d3-tip for tooltips and jQuery for dynamic access to other visualizations
      var colorScale = d3.scale.quantile()
          .domain([0, buckets - 1, d3.max(data, function (d) { return d.total; })])
          .range(colors);

      var svg = d3.select("#heatmap").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
          .data(days)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

      var timeLabels = svg.selectAll(".timeLabel")
          .data(times)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });
       var tip = d3.tip()
        .attr('class','d3-tip')
        .offset([0,0])
        .html(function(d) {
          return d.showName + "<br>" +
                 "Listeners: " + d.listeners + "<br>" + 
                 "Pageviews: " + d.pageviews + "<br>" +
                 "Callers: " + d.callerlog;
        });
      // render heatmap
      var heatMap = svg.selectAll(".hour")
          .data(data)
          .enter().append("rect")
          .attr("x", function(d) { return (d.hour) * gridSize; })
          .attr("y", function(d) { return (d.day) * gridSize; })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "hour bordered")
          .attr("width", gridSize)
          .attr("height", gridSize)
          .attr("hour", function(d) { return d.hour; })
          .attr("day", function(d) { return d.day; })
          .style("fill", colors[0])
          .on("click", function(d) {  
            refreshSidebar(d.showName, d.description, d.archive_slug, d.slug);
          })
          .on('mouseover',tip.show)
          .on('mouseout', tip.hide)
          svg.append("g").call(tip);

      // animation on heatmap load
      heatMap.transition().duration(1300)
          .style("fill", function(d) { return colorScale(d.total); });

      heatMap.append("name").text(function(d) { return d.day; });
      heatMap.append("description").text(function(d) { return d.hour; });

      // create legend colorbars with labels
      var legend = svg.selectAll(".legend")
          .data([0].concat(colorScale.quantiles()), function(d) { return d; })
          .enter().append("g")
          .attr("class", "legend");

      legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i + width/4 -5; })
        .attr("y", height + 101)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", function(d, i) { return colors[i]; });

      legend.append("text")
        .attr("class", "mono")
        .text(function(d) { return "≥ " + Math.round(d); })
        .attr("x", function(d, i) { return legendElementWidth * i + width/4+7; })
        .attr("y", height + 100 + gridSize);

    var type = "listeners";
    switch (filter) {
      case "Pageviews, Callers, & Online Listeners":
        $("#hourly_label").text("Listeners per hour");
      break;
      case "Listeners":
        $("#hourly_label").text("Listeners per hour");
      break;
      case "Pageviews":
        $("#hourly_label").text("Pageviews per hour");
        type = "pageviews";
      break;
      case "# Callers":
        $("#hourly_label").text("Callers per hour");
        type = "callerlog";
      break;
    }
    $("#listener_chart").html("");
    // Listener chart
    // Uses dimple library with custom fonts, data source, ordering, animation
    var svg = dimple.newSvg("#listener_chart", 720, 240);
    var myChart = new dimple.chart(svg, data);
    myChart.defaultColors = [
      new dimple.color("#60D7E6")
    ]; 
    myChart.setBounds(50, 30, 640, 160);
    var x = myChart.addCategoryAxis("x", ["day", "hour"]);
    x.addGroupOrderRule([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
    x.fontSize = "12px";
    x.fontFamily = "Open Sans";
    var y = myChart.addMeasureAxis("y", type);
    y.fontSize = "12px";
    y.fontFamily = "Open Sans";
    var s = myChart.addSeries(null, dimple.plot.line);
    // Customized tooltips with interactivity with heatmap
    s.getTooltipText = function(e){
      $("rect[hour=" + e["xField"][1] + '][day='+ e["x"] + "]").fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
      return [dayOfWeekAsString(e["x"]), "Hour: " + e["xField"][1], "Listeners:" + e["yValueList"][0]];
    }
    myChart.draw();
  });
}
// Display all by default
displayHeatmap("Pageviews, Callers, & Online Listeners");





// Custom function to populate sidebar using jQuery
function refreshSidebar(showname, description, archive_slug, slug) {
  $("#sidebar_title").text(showname);
  $("#sidebar_listen_link").html("<a href='https://www.wrek.org/playlist.php/main/128kbs/current/" + 
                                  archive_slug + ".m3u' target='_blank'>Listen (128kbps) </a>");
  // Detect whether or not image exists
  if (archive_slug === slug) {
      $("#sidebar_image").html("<img src='https://www.wrek.org/wp-content/themes/wrek/images/ss_icons/" +slug + ".png'>");
  } else {
     $("#sidebar_image").html("");
  }
  $("#sidebar_title").text(showname);
  $("#sidebar_description").text(description);
}


// Custom function to convert integer days to Strings
function dayOfWeekAsString(dayIndex) {
  return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][dayIndex];
}
