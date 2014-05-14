var map, boroughSearch = [],
    theaterSearch = [],
    museumSearch = [];

/* Basemap Layers */
var mapquestOSM = L.tileLayer("http://{s}.tiles.mapbox.com/v3/am3081.h0po4e8k/{z}/{x}/{y}.png");

var mbTerrainSat = L.tileLayer("https://{s}.tiles.mapbox.com/v3/matt.hd0b27jd/{z}/{x}/{y}.png");

var mbTerrainReg = L.tileLayer("https://{s}.tiles.mapbox.com/v3/aj.um7z9lus/{z}/{x}/{y}.png");

var mapquestOAM = L.tileLayer("http://{s}.tiles.mapbox.com/v3/am3081.h0pml9h7/{z}/{x}/{y}.png", {
    maxZoom: 19,
  });
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.tiles.mapbox.com/v3/am3081.h0pml9h7/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
    maxZoom: 19,
    subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  })]);



map = L.map("map", {
  zoom: 5,
  center: [39, -95],
  layers: [mapquestOSM]
});

/* Larger screens get expanded layer control */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": mapquestOSM,
  "Aerial Imagery": mapquestOAM,
  "Imagery with Streets": mapquestHYB
};

var overlays = {};

var layerControl = L.control.layers(baseLayers, {}, {
  collapsed: isCollapsed
}).addTo(map);

/* Add overlay layers to map after defining layer control to preserver order */
var sidebar = L.control.sidebar("sidebar", {
  closeButton: true,
  position: "left"
}).addTo(map);
sidebar.toggle();

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});


/* Placeholder hack for IE */
if (navigator.appName == "Microsoft Internet Explorer") {
  $("input").each(function () {
    if ($(this).val() === "" && $(this).attr("placeholder") !== "") {
      $(this).val($(this).attr("placeholder"));
      $(this).focus(function () {
        if ($(this).val() === $(this).attr("placeholder")) $(this).val("");
      });
      $(this).blur(function () {
        if ($(this).val() === "") $(this).val($(this).attr("placeholder"));
      });
    }
  });
}
$(function(){
  var popup = {

      init : function() {

      // position popup
      windowW = $(window).width();
      $("#map").on("mousemove", function(e) {
        
        var x = e.pageX + 20;
        var y = e.pageY;
        var windowH = $(window).height();
        if (y > (windowH - 100)) {
          var y = e.pageY - 100;
        } else {
          var y = e.pageY - 20;
        }
        

        $("#info").css({
          "left": x,
          "top": y
        });
      });

    }

  };
  popup.init();
})