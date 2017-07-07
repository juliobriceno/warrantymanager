 
google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(initChart);
$(window).on("resize", function (event) {
  initChart();
});


function initChart() {
  var options = {
    legend:'none',
    width: '100%',
    height: '100%',
    tooltip: { isHtml: true },
    chartArea: {left: "3%",top: "3%",height: "94%",width: "94%"},
    colors: ['#7CB5EC', '#5C5C61','transparent'],
    pieHole: 0.50,
    pieStartAngle: -90,
    is3D: false,
    pieSliceText: 'none',
  };
 
  var data = google.visualization.arrayToDataTable([
    ['Task', 'Hours per Day'],
          ['Work',     11],
          ['Eat',      2],
          ["Hide" , (11+2)]                    //addition of value of all elements
  ]);
  drawChart(data, options);
}


function drawChart(data, options) {

var tooltip = [
    Math.round((11/(11+2))*100) + "%",
    Math.round((2/(11+2))*100)+ "%",
    "Hiii3",
  ];

var chart = new google.visualization.PieChart(document.getElementById('piechart'));
var chart2 = new google.visualization.PieChart(document.getElementById('piechart2'));
 
  var sliceid = 0;

function eventHandler(e){
    chart.setSelection([e]);
    try {
      selection = chart.getSelection();
      sliceid = selection[0].row;
    }
    catch(err) {
      ;
    }
    $(".google-visualization-tooltip-item-list li:eq(0)").css("font-weight", "bold");
    $(".google-visualization-tooltip-item-list li:eq(1)").html(tooltip[sliceid]).css("font-family", "Arial");
  }

google.visualization.events.addListener(chart, 'onmousedown', eventHandler);
  google.visualization.events.addListener(chart, 'onmouseover', eventHandler);
  chart.draw(data, options);

google.visualization.events.addListener(chart2, 'onmousedown', eventHandler);
  google.visualization.events.addListener(chart2, 'onmouseover', eventHandler);
  chart2.draw(data, options);
}
