
var width = 960;
var height = 800;
var state_objects;

var value_range;
var slices;
var quantize;

var svg = d3.select("#map").append("svg")
.attr("width", width)
.attr("height", height);


var redraw = function(current_slice) {
	svg.selectAll("g").selectAll("path")
	.attr("class", function(d) { return quantize(all_data[d.id][current_slice]); });
	
	$('#controls a').each(function(i, el) {
		el = $(el);
		if (el.html() == current_slice) {
			el.addClass('active');
		} else {
			el.removeClass('active');
		}
	});
}


var drawControls = function() {
	var control_links = [];
	slices.forEach(function(slice_name) {
		control_links.push("<a href=\"#\">" + slice_name + "</a>");
	});
		$('#controls').append(control_links.join(" | "));
		$('#controls').on('click', function(e) {
			e.preventDefault();
			if (e.target.tagName === 'A') {
				// current_slice = e.target.innerHTML;
				redraw(e.target.innerHTML);
			}
		});
}


var drawLegend = function() {
	var legend_output = '';
	
	var min = value_range[0];
	var max = value_range[1];
	for (var i = min; i < max; i += (max - min)/10) {
		legend_output += "<span class=\"legend_block " + quantize(i) + "\">" + i.toFixed( 3) + "</span>";
	}
	
	$('#legend').html(legend_output);
}


var all_data = {};

$(function() {
	d3.json("maps/wa-perth.json", function(map) {
		d3.csv("data/MotorVehiclesDeltas.csv", function(data) {
			var time_keys = {};
			var max, min;
			
			data.forEach(function(item) {
				if (item.State !== 'WA') { return; }  // for now
				
				var id = item['ASGC.2008.Code'];
				all_data[id] = {};
				
				for (var key in item) {
					if (key.substr(0,1) !== 'X') { continue; }
					time_keys[key] = true;
					all_data[id][key] = item[key];
					
					// if (!max) { max = 1 * item[key]; }
					// if (!min) { min = 1 * item[key]; }
					// if (item[key] > max) { max = 1 * item[key]; }
					// if (item[key] < min) { min = 1 * item[key]; }
		}
	});
				
				// var delta = Math.floor((Math.ceil(max) - Math.floor(min))/10) + 1;
				// var delta = (max - min)/10;
				
				slices = Object.keys(time_keys);
				// value_range = [min, min + 10*delta];
				value_range = [0, 0.02];
				console.log(all_data);
				
				var projection = d3.geo.mercator()
				.center([115.85, -31.95])
				//.rotate([4.4, 0])
				//.parallels([50, 60])
				.scale(50000)
				.translate([width / 2, height / 2]);
				
				quantize = d3.scale.quantize()
				.domain(value_range)
				.range(d3.range(9).map(function(i) { return "decile-" + i; }));
				
				var path = d3.geo.path()
				.projection(projection);
				
				svg.append("g")
				.attr("class", "australia")
				.selectAll("path")
				.data(topojson.feature(map, map.objects["WA-perth"]).features)
				.enter().append("path")
				.attr("id", function(d) { return d.id; })
				.attr("d", path);
				
				drawControls();
				drawLegend();
				redraw(slices[0]);
				
				});
});
				}); 
