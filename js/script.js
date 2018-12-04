$.smartscroll();


var selectedCountry =  $("#dropdown1 option:selected").val();
var selectedMonth = $("#dropdown2 option:selected").val();
var highlightColor = "#D4000D";
var startPoint = -0.5;
var endPoint = 0.5;

var countryDeathsByMonth = {};
var seriesData = [];

function changeBorough() {
  selectedCountry =  $("#dropdown1 option:selected").val();
  selectedMonth = $("#dropdown2 option:selected").val();
  startPoint = parseFloat(selectedMonth);
  endPoint = startPoint+1.0;

  $.ajax({
    type:"GET",
    url:
    "./js/bigData.json",
    dataType: "json",
    async:true,
    success:function(data){
      console.log(data);
      doLogic(data);
      buildChart(data);
    },
    error:function(error){
      console.log(error);
    }
  })
}

function changeMonth() {
  selectedCountry =  $("#dropdown1 option:selected").val();
  selectedMonth = $("#dropdown2 option:selected").val();
  startPoint = parseFloat(selectedMonth);
  endPoint = startPoint+1.0;

  $.ajax({
    type:"GET",
    url:
    "./js/bigData.json",
    dataType: "json",
    async:true,
    success:function(data){
      console.log(data);
      doLogic(data);
      buildChart(data);
    },
    error:function(error){
      console.log(error);
    }
  })
}


console.log ('DOM loaded');

// Set up variables
var countryNames = [];
var numDeaths = [];
var magnitude = [];

var incidentsByMag = [];
var incidentsByYear = [];


$.ajax({
  type:"GET",
  url:
  "./js/bigData.json",
  dataType: "json",
  async:true,
  success:function(data){
    console.log(data);
    doLogic(data);
    buildDT(data);
    buildChart(data);
  },
  error:function(error){
    console.log(error);
  }
})

function buildDT(data){
  $("#table").dataTable({
    data:data,
    columns:[
      {"data":"YEAR"},
      {"data":"COUNTRY"},
      {"data":"EQ_PRIMARY"},
      {"data":"DEATHS",
      "defaultContent": ""},
      {"data":"INJURIES",
    "defaultContent": ""}
    ],
    responsive: true
  })
}

// Function to do logic
function doLogic(data){
  var mag5 = 0;
  var mag6 = 0;
  var mag7 = 0;
  var mag8 = 0;
  var mag9 = 0;
  var year1900 = 0;
  var year1920 = 0;
  var year1940 = 0;
  var year1960 = 0;
  var year1980 = 0;
  var year2000 = 0;

  incidentsByMag = [];
  incidentsByYear = [];

  var eventsByCountry={};
  for(i=0;i<data.length;i++){

    var country = data[i].COUNTRY;

    if (country in eventsByCountry){
      eventsByCountry[country] +=1;
    }
    else{
      eventsByCountry[country] = 1;
    }

    countryNames.push(country);
    var deaths = parseInt(data[i].TOTAL_DEATHS);
    numDeaths.push(deaths);
    var mag = parseFloat(data[i].EQ_PRIMARY);
    var year = parseInt(data[i].YEAR);

    magnitude.push(mag);
    if (mag<=5.9){
      mag5++;
    }
    else if (mag<=6.9){
      mag6++;
    }
    else if (mag<=7.9){
      mag7++;
    }
    else if(mag<=8.9){
      mag8++;
    }
    else{
      mag9++;
    }
    if (year<=1919){
      year1900++;
    }
    else if (year<=1939){
      year1920++;
    }
    else if (year<=1959){
      year1940++;
    }
    else if(year<=1979){
      year1960++;
    }
    else if(year<=1999){
      year1980++;
    }
    else{
      year2000++;
    }
  }
  incidentsByMag.push(mag5);
  incidentsByMag.push(mag6);
  incidentsByMag.push(mag7);
  incidentsByMag.push(mag8);
  incidentsByMag.push(mag9);
  incidentsByYear.push(year1900);
  incidentsByYear.push(year1920);
  incidentsByYear.push(year1940);
  incidentsByYear.push(year1960);
  incidentsByYear.push(year1980);
  incidentsByYear.push(year2000);

  // Do logic for line chart
  seriesData = [];
  countryDeathsByMonth = {};
  // Ignore the countries that have less than 10 incidents
  console.log(eventsByCountry);
  var bigCountries = [];
  for (var country in eventsByCountry){
    if (eventsByCountry[country]>100){
      bigCountries.push(country);
    }
  }
  console.log(bigCountries);
  // Build data for each country's total deaths by month
  for(var x = 0; x < data.length; x++) {
    var month = parseInt(data[x].MONTH);
    var c = data[x].COUNTRY;
    var d = data[x].DEATHS;
    if (parseInt(d)>=0){
      d = parseInt(data[x].DEATHS);
    }
    else{
      d = 0;
    }
    console.log(data[x].MONTH+'/'+c+'/'+d)
    if (bigCountries.indexOf(c)>-1){
      for (var m=1; m<13; m++){
        if (month == m){
          if (c in countryDeathsByMonth){
            countryDeathsByMonth[c][m-1]+=d;
          }
          else{
            countryDeathsByMonth[c] = [0,0,0,0,0,0,0,0,0,0,0,0];
            countryDeathsByMonth[c][m-1]+=d;
          }
        }
      }
    }
  }
  console.log(countryDeathsByMonth);
  // Data structure for line chart
  var colorArray = ["#D9CBA3","#9ACFEB","#D5FFDF","#FFD5D8","#AAB0AA","#E9D2FB","#FEEA7E","#74CEB7","#ED964B"];
  var ci=0;
  for (var key in countryDeathsByMonth){
    var x = document.getElementById("dropdown1");
    var option = document.createElement("option");
    option.text = key;
    x.add(option);
    seriesData.push({
      name:key,
      data:countryDeathsByMonth[key],
      color: selectedCountry==key ? highlightColor : colorArray[ci]
    });
    ci++;
  }
  console.log(seriesData);
}


// Function to build charts
function buildChart(data){

  Highcharts.chart('chart-1', {
    chart: {
      type: 'bar',
      style: {
        fontFamily: 'Open Sans'
      }
    },
    title: {
      text: 'Significant Earthquake by Magnitude',
      style: {
        color: 'white',
        fontWeight: 'bold'
      }
    },
    subtitle: {
      text: 'Year: 1900-2018 | Magnitude: >=5 | Source: NOAA.GOV'
    },
    xAxis: {
      categories: ['5-5.9', '6-6.9', '7-7.9', '8-8.9', '9+'],
      title: {
        text: 'Magnitude'
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Incidents',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    tooltip: {
      valueSuffix: ' '
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true
        }
      }
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'top',
      x: -40,
      y: 80,
      floating: true,
      borderWidth: 1,
      backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
      shadow: true
    },
    credits: {
      enabled: false
    },
    series: [{
      name: "Number of Incidents",
      data: incidentsByMag,
      showInLegend: false,}]
    });


    Highcharts.chart('chart-2', {
      chart: {
        type: 'bar',
        style: {
          fontFamily: 'Open Sans'
        }
      },
      title: {
        text: 'Significant Earthquake by Year',
        style: {
          color: 'white',
          fontWeight: 'bold'
        }
      },
      subtitle: {
        text: 'Year: 1900-2018 | Magnitude: >=5 | Source: NOAA.GOV'
      },
      xAxis: {
        categories: ['1900-1919', '1920-1939', '1940-1959', '1960-1979', '1980-1999','2000-2018'],
        title: {
          text: 'Year'
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Incidents',
          align: 'high'
        },
        labels: {
          overflow: 'justify'
        }
      },
      tooltip: {
        valueSuffix: ' '
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -40,
        y: 80,
        floating: true,
        borderWidth: 1,
        backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
        shadow: true
      },
      credits: {
        enabled: false
      },
      series: [{
        name: "Number of Incidents",
        data: incidentsByYear,
        showInLegend: false,}]
      });



      Highcharts.chart('chart-3', {
        chart: {
          type: 'line'
        },
        title: {
          text: 'Total Deaths in Earthquake By Country',
          style: {
            color: 'white',
            fontWeight: 'bold'
          }
        },
        subtitle: {
          text: 'Source: NOAA.GOV'
        },
        credits: {
          enabled: false
        },
        legend: {
          itemStyle: {
            color: 'white',
            fontWeight: 'bold'
          }
        },
        xAxis: {
          categories: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
          plotBands: [{ // mark the selected month
            color: selectedMonth=="" ? 'white':'#D46C75',
            from: startPoint,
            to: endPoint
          }]
        },
        yAxis: {
          title: {
            text: 'Total Deaths'
          },
        },
        plotOptions: {
          line: {
            dataLabels: {
              enabled: true
            },
            enableMouseTracking: false
          }
        },
        series: seriesData
      });

    }

    var url = 'https://newsapi.org/v2/everything?q=earthquakes&sortBy=publishedAt&apiKey=c357240fe54e467aa4bd696d7f223920'

    $.ajax({
      type: "GET",
      url: url,
      success:function(data){
        var num=0;
        for (i=0; i<data.articles.length; i++){
          if (data.articles[i].title.includes("earthquake")||data.articles[i].title.includes("earthquakes")){
            console.log(data.articles[i]);
            num++;
            if(num<=3){  //Only show first 3 pieces of news
              var container = "#container"+num;
              $(container).append("<div class='newsInfo' id=line"+num+"></div>");
              var textWrapper = "#line"+num;
              $(textWrapper).append("<p class='news' id=title"+num+">"+data.articles[i].title+"</p>");
              $(textWrapper).append("<p class='news' id=sub"+num+">"+data.articles[i].author+" | "+data.articles[i].publishedAt+"</p>");
              $(container).append("<img class='newsIMG' alt='picture' src="+data.articles[i].urlToImage+">");
            }
          }
        }
      },
      error:function(error){
        console.log(error);
      }
    })


    var map;
    // Initialize and add the map
    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: new google.maps.LatLng(2.8,-187.3),
        mapTypeId: 'terrain',
        styles: [
          {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
          {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
          {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{color: '#263c3f'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{color: '#6b9a76'}]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{color: '#38414e'}]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{color: '#212a37'}]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{color: '#9ca5b3'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{color: '#746855'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{color: '#1f2835'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{color: '#f3d19c'}]
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{color: '#2f3948'}]
          },
          {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{color: '#17263c'}]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{color: '#515c6d'}]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{color: '#17263c'}]
          }
        ]
      });
      // Create a <script> tag and set the USGS URL as the source.
      var script = document.createElement('script');

      // This example uses a local copy of the GeoJSON stored at
      // http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojsonp
      script.src = 'https://developers.google.com/maps/documentation/javascript/examples/json/earthquake_GeoJSONP.js';
      document.getElementsByTagName('head')[0].appendChild(script);

      map.data.setStyle(function(feature) {
        var magnitude = feature.getProperty('mag');
        return {
          icon: getCircle(magnitude)
        };
      });
    }


    function getCircle(magnitude) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'red',
        fillOpacity: .2,
        scale: Math.pow(2, magnitude) / 2,
        strokeColor: 'white',
        strokeWeight: .5
      };
    }

    function eqfeed_callback(results) {
      map.data.addGeoJson(results);
    }
