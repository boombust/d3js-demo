
var width = window.innerWidth - 6;
var height = window.innerHeight - 6;

var slices;
var quantize;
var svg;

var current_dataset;


var datasets = [
  {
    name: "BoomBust Index",
    file: "data/BBI_annual.csv",
    scale: [-1.5, 1.5],
    description: "Our secret-sauce index of economic boom or bust"
  },
  {
    name: "Motor Vehicle Ownership",
    files: {
      "ACT": "data/MotorVehiclesDeltas.ACT.csv",
      "NSW": "data/MotorVehiclesDeltas.NSW.csv",
      "NT": "data/MotorVehiclesDeltas.NT.csv",
      "Qld": "data/MotorVehiclesDeltas.Qld.csv",
      "SA": "data/MotorVehiclesDeltas.SA.csv",
      "Tas": "data/MotorVehiclesDeltas.Tas.csv",
      "Vic": "data/MotorVehiclesDeltas.Vic.csv",
      "WA": "data/MotorVehiclesDeltas.WA.csv"
    },
    scale: [0, 0.02],
    description: "Share of national motor ownership for each region"
  },
  {
    name: "Taxable Income",
    files: {
      "ACT": "data/TaxableIncomeDeltas.ACT.csv",
      "NSW": "data/TaxableIncomeDeltas.NSW.csv",
      "NT": "data/TaxableIncomeDeltas.NT.csv",
      "Qld": "data/TaxableIncomeDeltas.Qld.csv",
      "SA": "data/TaxableIncomeDeltas.SA.csv",
      "Tas": "data/TaxableIncomeDeltas.Tas.csv",
      "Vic": "data/TaxableIncomeDeltas.Vic.csv",
      "WA": "data/TaxableIncomeDeltas.WA.csv"
    },
    scale: [0.5, 1.5],
    description: "Ratio of the average taxable income in one region to the others"
  },
  {
    name: "Unemployment",
    files: {
      "ACT": "data/UnemploymentDeltas.ACT.csv",
      "NSW": "data/UnemploymentDeltas.NSW.csv",
      "NT": "data/UnemploymentDeltas.NT.csv",
      "Qld": "data/UnemploymentDeltas.Qld.csv",
      "SA": "data/UnemploymentDeltas.SA.csv",
      "Tas": "data/UnemploymentDeltas.Tas.csv",
      "Vic": "data/UnemploymentDeltas.Vic.csv",
      "WA": "data/UnemploymentDeltas.WA.csv"
    },
    scale: [0, 40],
    description: "Percentage unemployment in each statistical region"
  }
];


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


var drawCityLinks = function(current_city) {
	var link_html = '';
	var link_names = Object.keys(maps);

  $('#floating_description h1').html(current_city + ' ' + datasets[current_dataset].name);
  $('#floating_description p').html(datasets[current_dataset].description);

	link_names.forEach(function(link) {
	  var cls = '';
	  if (link == current_city) { cls = " class=\"active\""; }
		link_html += "<li" + cls + "><a href=\"#" + link + "\">" + link + "</a></li>";
	});
  $('#city_links').html(link_html);

  $('#city_links').on('click', function(e) {
    e.preventDefault();
    if (e.target.tagName === 'A') {
      svg.remove();
      init(e.target.innerHTML, current_dataset);
    }
  });
}


var drawDataSelector = function() {
  var form_html = "<select id=\"\">";

  datasets.forEach(function(dataset, i) {
    form_html += "<option value=\"" + i + "\" title=\"" + dataset.description + "\""

    if (current_dataset == i) {
      form_html += " selected=\"selected\"";
    }

    form_html += ">" + dataset.name + "</option>";
  });

  form_html += "</select>";

  $('#dataset_switcher').html(form_html);

  $('#dataset_switcher select').on('change', function(e) {
      svg.remove();

      var current_city = $('#city_links .active a').html();
      var new_val = $('#dataset_switcher select').val();

      init(current_city, new_val);
  });
}


var drawControls = function() {
	var control_links = [];
	slices.forEach(function(slice_name) {
		control_links.push("<a href=\"#\">" + slice_name + "</a>");
	});
  $('#controls').html(control_links.join(" | "));
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

	var min = datasets[current_dataset].scale[0];
	var max = datasets[current_dataset].scale[1];
	for (var i = min; i < max; i += (max - min)/10) {
		legend_output += "<span class=\"legend_block " + quantize(i) + "\">" + i.toFixed( 3) + "</span>";
	}

	$('#legend').html(legend_output);
}


var all_data = {};


var maps = {
  "Perth" : {
    state: "WA",
    map: {
      file: "maps/wa-perth.json",
      obj_name: "WA-perth",
      center: [115.85, -31.95],
      scale: 50000
    }
  },
  "Sydney" : {
    state: "NSW",
    map: {
      file: "maps/nsw-sydney.json",
      obj_name: "NSW-sydney",
      center: [151.22, -33.85],
      scale: 70000
    }
  },
  "Melbourne" : {
    state: "Vic",
    map: {
      file: "maps/vic-melbourne.json",
      obj_name: "Vic-melbourne",
      center: [144.96, -37.82],
      scale: 70000
    }
  },
  "Brisbane" : {
    state: "Qld",
    map: {
      file: "maps/qld-brisbane.json",
      obj_name: "Qld-brisbane",
      center: [153.02, -27.45],
      scale: 25000
    }
  },
  "Adelaide" : {
    state: "SA",
    map: {
      file: "maps/sa-adelaide.json",
      obj_name: "SA-adelaide",
      center: [138.60, -34.92],
      scale: 60000
    }
  }
}


var init = function(city, dataset_id) {
  current_dataset = dataset_id;

  svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

	d3.json(maps[city].map.file, function(map) {

	  if (datasets[dataset_id].files) {
	    var data_filename = datasets[dataset_id].files[maps[city].state];
	  } else {
	    var data_filename = datasets[dataset_id].file;
	  }

		d3.csv(data_filename, function(data) {
			var time_keys = {};
			var max, min;

			data.forEach(function(item) {
				// if (item.State !== maps[city].state) { return; }

				var id = item['ASGC.2008.Code'];
				all_data[id] = {};

				for (var key in item) {
					if (key.substr(0,1) !== 'X' && key.substr(0,3) !== 'Jun') { continue; }
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

      var projection = d3.geo.mercator()
        .center(maps[city].map.center)
        .scale(maps[city].map.scale)
        .translate([width / 2, height / 2]);

      quantize = d3.scale.quantize()
        .domain(datasets[current_dataset].scale)
        .range(d3.range(9).map(function(i) { return "decile-" + i; }));

      var path = d3.geo.path()
        .projection(projection);

      svg.append("g")
        .attr("class", "city")
        .selectAll("path")
        .data(topojson.feature(map, map.objects[maps[city].map.obj_name]).features)
        .enter().append("path")
        .attr("id", function(d) { return d.id; })
        .attr("d", path);

      drawDataSelector();
      drawCityLinks(city);
      drawControls();
      drawLegend();

      redraw(slices[0]);

    });
  });
}

$(function() {
  init("Perth", 0);
});
