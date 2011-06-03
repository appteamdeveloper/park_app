// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

var route;
//
// create base UI tab and root window
// 

var win1 = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Tab 1',
    window:win1
});

//
//  add tabs
//
tabGroup.addTab(tab1);

var mapView = Titanium.Map.createView({
	mapType: Titanium.Map.STANDART_TYPE,
	region: {
		latitude: -23.552894, longitude: -46.651468,
		latitudeDelta: 0.01, longitudeDelta: 0.01
	},
	animate: true,
	regionFit: true,
	userLocation: true,
	height: 300,
	top: 0
});

var pinos = new Array();

// Function loadTweets()
function loadTweets()
{
	// Empty array "rowData" for our tableview
	pinos = new Array();	
	// Create our HTTP Client and name it "loader"
	var loader = Titanium.Network.createHTTPClient();
	// Sets the HTTP request method, and the URL to get data from
	loader.open("GET","http://localhost:8080/iParkWebService/estacionamentos");
	//loader.open("GET","http://api.twitter.com/1/statuses/user_timeline.json?screen_name=bruno_sbar");
	// Runs the function when the data is ready for us to process
	loader.onload = function() 
	{
		var tweets = eval('('+this.responseText+')');
		for (var i = 0; i < tweets.estacionamento.length; i++)
		{
			var nome = tweets.estacionamento[i].nome; // The tweet message
			var latitude = tweets.estacionamento[i].latitude; // The screen name of the user
			var longitude = tweets.estacionamento[i].longitude; // The profile image
			
			var pino = Titanium.Map.createAnnotation({
				latitude:  latitude, //-23.552894,//37.390749,
				longitude: longitude, //-46.651468,//-122.081651,
				title: nome,
				subtitle: "Mountain View, CA",
				pincolor: '../images/chat.png',//Titanium.Map.ANNOTATION_RED,
				animate: true,
				myid: 1,
				rightButton: 'images/icon_arrow_right.png'
			});
			
			mapView.addAnnotation(pino);
			pinos[i] = pino;
		}
	};
	// Send the HTTP request
	loader.send();
}

win1.add(mapView);

function testZoom(){
	mapView.region = {latitude:mapView.region.latitude, longitude:mapView.region.longitude, latitudeDelta:0.1, longitudeDelta:0.1};
	mapView.animate = true;
}

var button = Titanium.UI.createButton({
   title: 'Carregar',
   top: 300,
   left:0,
   width: 100
});

var button2 = Titanium.UI.createButton({
   title: 'Rota',
   top: 300,
   left:100,
   width: 100
});

button2.addEventListener('click',function(e)
{
	if(route != null)
		mapView.removeRoute(route);
	if(pinos.length > 0){
		var url = "http://maps.google.com/?saddr=" 
            + pinos[0].latitude + ',' + pinos[0].longitude + "&daddr=" 
            + pinos[2].latitude + ',' + pinos[2].longitude + "&doflg=ptk&hl=en&output=kml"
	    xhr = Titanium.Network.createHTTPClient();
	    xhr.open('GET',url);
	    Ti.API.info('>>> go get data for Rgeocode! ...URL: '+url);
	    xhr.onload = function(){
	        // Now parse the XML 
	        var xml = this.responseXML;
	        var points = [];
	        var coords = xml.documentElement.getElementsByTagName("LineString");
	        
	        var newPoints = [];
	        
	        
	        for(var cc=0; cc < coords.length; cc++) {
	            var line = coords.item(cc);
	            var str = line.firstChild.text.split(" ");
	            for(dd = 0; dd < str.length; dd++) {
	                var loc = str[dd].split(',');
                	if(loc[0] && loc[1]) {
                		points.push({latitude: loc[1], 
	                         longitude: loc[0]});
	                }	
	            }
	        }
	        
	        route = {
	            name:"route",
	            points:points,
	            color:"opacity: 0.5;",
	            width:4
	        };
	 
			        // add a route
	        mapView.addRoute(route);
	    };   
	    xhr.send();
	}	
});

button.addEventListener('click',function(e)
{
	if(route != null)
		mapView.removeRoute(route);
		
	if(pinos.length > 0){
		for(var i = 0; i < pinos.length; i++){
			mapView.removeAnnotation(pinos[i]);	
		}
	}
	loadTweets();
	testZoom();		
	Titanium.API.info("You clicked the button");
});

win1.add(button);
win1.add(button2);

// open tab group
tabGroup.open();
