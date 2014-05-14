app.controller('AppCtrl', function MapCtrl($scope, $modal, $log, $http){
	
	var apiUrl = 'http://localhost:1337/';///'http://api.availabs.org/gtfs/';
	$scope.test = 'Hello World';
	$scope.loading_agencies = true;
	$scope.agencies = [];
	$scope.routes =[];
    $scope.stops = [];
    $scope.loaded_agency = {};
	$http({url: apiUrl+'agency',method:"GET"}).success(function(data){
        $scope.agencies= data;
        $scope.loading_agencies = false;
    
    });
    $scope.loaded = false;
    $scope.loading = false;
	
	$scope.loadAgency = function(agency_id){
        $scope.loading = true;
        $scope.agencies.forEach(function(agency){
            if(agency.id == agency_id){
                return $scope.loaded_agency = agency;
            }
        });
        loadroutes(agency_id,function(){
            loadstops(agency_id,function(){
                $scope.loading = false;
                $scope.loaded = true;
            })
        })

    };
    
    $scope.getStopSchedule = function(stop_id){

    };

    $scope.loadRouteInfo = function(route_id){
        console.log('ng-click',route_id);
    };


    loadroutes = function(id,cb){
            d3.select('#routes').remove();
            d3.select('#stops').remove();
            
            $scope.routes = [];
            $http({url: apiUrl+'agency/'+id+'/routes/',method:"GET"}).success(function(route_data){
                var options = {
                    layerId:'routes',//sets id for group
                    stroke:'route_color',//property name for route color
                    style:{'stroke-width':'3px','fill':'none'},//style tag
                    mouseover:{
                        style:{cursor:'pointer','stroke-width':'6px',fill:"none"},
                        info: [{name:'Route Name',prop:'route_short_name'},{name:'Route Long Name',prop:'route_longs_name'},{name:'Route Id',prop:'route_id'}]
 
                    }
                };
                var geo = topojson.feature(route_data, route_data.objects.routes);
                map.addLayer(new L.GeoJSON.d3(geo,options));
                var bounds = d3.geo.bounds(geo);
                map.fitBounds([bounds[0].reverse(),bounds[1].reverse()]);
                geo.features.forEach(function(route){
                    $scope.routes.push(route.properties)
                });
                cb();
           });
        }
        
        loadstops = function(id,cb){
            $scope.stops = [];
            $http({url: apiUrl+'agency/'+id+'/stops/',method:"GET"}).success(function(stop_data){
                var options = {
                    layerId:'stops',
                    type:'point',
                    radius:3,
                    style:{cursor:'pointer', fill:'#e74c3c', opacity:0.5, stroke:'#e74c3c', 'stroke-width':0},
                    mouseover:{
                        style:{fill:'#89ca27', stroke:'#2ecc71',opacity:0.8, 'stroke-width':16},
                        info: [{name:'Stop Name',prop:'stop_name'},{name:'Stop ID',prop:'stop_id'},{name:'Stop Code',prop:'stop_code'}]
                    }
                };

                var geo = topojson.feature(stop_data, stop_data.objects.stops);
                map.addLayer(new L.GeoJSON.d3(geo,options));
                geo.features.forEach(function(stop){
                    $scope.stops.push(stop.properties)
                });
                cb();
            });
        }
	
});