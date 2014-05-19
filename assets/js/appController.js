app.controller('AppCtrl', function MapCtrl($scope, $modal, $log, $http){
	
	var apiUrl = 'http://localhost:1337/';///'http://api.availabs.org/gtfs/';
	
    $scope.dt = new Date();
    var days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = 'EEEE MMMM d yyyy';
    $scope.dateOptions = {
        startingDay: 1
    };
    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.test = 'Hello World';
	$scope.loading_agencies = true;
	$scope.agencies = [];
	$scope.routes =[];
    $scope.stops = [];
    $scope.stopNames = {};
    $scope.loaded_agency = {};
	$http({url: apiUrl+'agency',method:"GET"}).success(function(data){
        $scope.agencies= data;
        $scope.loading_agencies = false;
    });
    $scope.loaded = false;
    $scope.loading = false;
	
	$scope.loadAgency = function(agency_id){
        $scope.current_agency = agency_id;
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
        //console.log('ng-click',route_id);
        $scope.route_info = route_id;
        $http.post(apiUrl+'agency/'+$scope.current_agency+'/routes/'+route_id+'/schedule',{'day':days[$scope.dt.getDay()]})
        .success(function(schedule_data){
            console.log(schedule_data);
            direction = {};
            stop = []
            schedule_data.forEach(function(sched_point){
                if(sched_point.direction_id == null){
                    sched_point.direction_id = 0;
                }
                if(typeof direction[sched_point.direction_id] == 'undefined'){
                    
                    console.log('hola');
                    direction[sched_point.direction_id] = {trips:{}};
                }
                if(typeof direction[sched_point.direction_id].trips[sched_point.trip_id] == 'undefined'){
                    direction[sched_point.direction_id].trips[sched_point.trip_id] = {};
                }
                var stop = sched_point.stop_id;
                var time = sched_point.arrival_time;
                direction[sched_point.direction_id].trips[sched_point.trip_id][stop] = time; 
            });
            console.log(direction);
            $scope.direction = direction;
            var zerostops = {};
            $scope.dirkeys = [];
            $scope.stopindex = {};
            for(var dir in direction){
                $scope.dirkeys.push(dir);
                zerostops[dir] = {}
                for (var key in direction[dir].trips ){
                    var index = 0;
                    for(stopid in direction[dir].trips[key]){
                        if(typeof zerostops[dir][stopid] == 'undefined'){
                          zerostops[dir][stopid] = []; 
                        }
                        zerostops[dir][stopid].push(index);
                        
                        index++;
                    }
                }
                $scope.stopindex[dir] = {};

                for(var stop in zerostops[dir]){
                    console.log(d3.min(zerostops[dir][stop]),stop)
                    $scope.stopindex[dir][d3.min(zerostops[dir][stop])] = stop;
                }
            }
            console.log('stopindex',$scope.stopindex);
            $scope.currentPage = 0;
            $scope.pageSize = 4;
                
        })
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
                $scope.stopNames[stop.properties.stop_id] = stop.properties.stop_name;
            });
            cb();
        });
    }
	
});
app.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        index = 0;
        output = {}
        for(var key in input){
            if(index >= start){
                output[key] = input[key];
            }
            index++;
        }
        return output;
    }
});
app.filter('limitJson', function() {
    return function(input, limit) {
        limit = +limit; //parse to int
        index = 0;
        output = {}
        for(var key in input){
            if(index < limit){
                output[key] = input[key];
            }else{break;}
            index++;
        }
        return output;
    }
});