// update & fade colors
var updateColors = function() {
	// clean up
	var changeColor= function(selection) {
		selection.selectAll("rect.foreground")
			.style("fill", function(d, i) { return colors.previous[i]; })
			.transition()
				.duration(1000)
				.style("fill", function(d, i) { return colors.current[i]; })
	}
	var changeColorTop= function(selection) {
		selection.selectAll("rect")
			.style("fill", function(d, i) { return colors.previous[i]; })
			.transition()
				.duration(1000)
				.style("fill", function(d, i) { return colors.current[i]; })
	}
	baseGroups.call(changeColor);
	centralGroup.call(changeColorTop);			
}

/*
// update rotate
var updateRotation = function(angle, duration) {
	if (duration === undefined) duration = 1000
	
	// rotate groups
	
	baseGroups.transition()
		.duration(duration)
		.attrTween("transform", function(d,i,a) {
			var t = d.transform;
			var from = t.toString().replace(")skewX(", ",50,50)skewX(");
			t.rotate = angle;
			var to = t.toString().replace(")skewX(", ",50,50)skewX(");
			return d3.interpolateString(from, to);
		})

	labels.transition()
		.duration(duration)
		.attrTween("transform", function(d,i,a) { 
			var t = d.transform;
			var rx = 50;
			var ry = y(d.y/2+d.y0);
			var str = ","+rx+","+ry+")skewX(";
			var from = t.toString().replace(")skewX(", str);
			t.rotate = -angle;
			t.rotationCenter = [rx, ry];
			d.transform = t;
			var to = t.toString().replace(")skewX(", str);
			return d3.interpolateString(from, to);
		});

}

*/

// Interactions


$("body").on('click', "#menu-file .dataset a", function(e) {		// cmp with $("#menu-file .dataset a").on('click', function(e) {
	e.preventDefault();
	var id = $(this).data("id");
	
	console.log(id);

	$("#menu-file .dataset").removeClass("active");		// unset
	$(this).parent().addClass("active");
	readData(id);
	
});
	
// export
$("body").on('click', "#menu-file .export a", function(e) {		// cmp with $("#menu-file .dataset a").on('click', function(e) {
	e.preventDefault();
	console.log("export");
	
	
	downloadSVG()
});

function downloadSVG() {
	var SVGRaw = svg.attr("version", "1.1").attr("xmlns", "http://www.w3.org/2000/svg").node().parentNode.innerHTML;
	d3.select(this).attr("href", "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgRaw))))
}

/*

var w = window.open(strUrl, strWindowName, [strWindowFeatures]);

*/


/*
$("#menu-file #add_dataset a").on('click', function(e) {
	if (window.FileReader && window.FileList) {
		$("#uploadData").click();	// 
	} else {
		alert("Sorry, your browser does not support local file access");
	}
	e.preventDefault();
});
*/

var readData = function(id) {
	var data = {};
	data.bases = []
	data.strand = {};
	data.alterations = [];
	d3.text("data/publication/raw/"+id+".txt", function(text) {
		
		// read as text, and parse rows ... becuase "real" TSV has headers
		rawData = d3.tsv.parseRows(text).map(function(row) {
			return row.map(function(value) { return +value; });
		});

		// bases
		rawData.slice(1,5).forEach(function(d,i) {					// adjacent bases
			data.bases.push({'A':d[0],'C':d[1] ,'G':d[2],'T':d[3]})
		});
		C = rawData[0][0] + rawData[0][1] + rawData[0][2];		// add center base
		T = rawData[0][3] + rawData[0][4] + rawData[0][5];
		centerBase = {'A':0,'C':C ,'G':0,'T':T};
		data.bases.splice(2, 0, centerBase)
		
		// strand
		data.strand.plus = rawData[5][0];
		data.strand.minus = rawData[5][1];
		
		//alteration
		data.alterations = [
			{'A':0, 'C':0, 'G':0, 'T':0 },		// A>X
			{'A':rawData[0][0] ,'C':0,'G':rawData[0][1] ,'T':rawData[0][2] },	// C>X
			{'A':0, 'C':0, 'G':0, 'T':0 },		// G>X
			{'A':rawData[0][3] ,'C':rawData[0][4] ,'G':rawData[0][5],'T':0}	// T>X
		]
		
		// update top C,T scales
		cScale.domain([0,C]);
		tScale.domain([0,T]);
		
		dataset[id] = data;		// add to datasets
		updateData(id);
		updateDisplay();
		
	});
	
	/*
The 1st row is substitution pattern (C>A, C>G, C>T, T>A, T>C, T>G).
The 2nd ~ 5th row is base pattern (A, C, G, T) for -2, -1, +1, +2
positions, respectively.
The 6th row is strand ratios (+, -).
	
0.0345021587438188	0.00769932201661882	0.820776226962449	0.00391277245590961	0.13304558395245	6.3935868753264e-05
0.223160987429869	0.231538458402398	0.266854021381499	0.278446532786234	0	0
0.273175702841706	0.255108259236039	0.293825322147511	0.177890715774743	0	0
0.159914819404354	0.143631178032	0.57256433175979	0.123889670803856	0	0
0.220263704840907	0.262601007185706	0.29866763211971	0.218467655853677	0	0
0.497135832065829	0.502864167934171	0	0	0	0

	
	
	*/

}

/*
$("#uploadData").on("change", function(e) {
	var files = $(this)[0].files;					// get file list
	for (i = 0; i < files.length; i++) {			// Loop over files
		var file = files[i];
		reader = new FileReader();
		var fileName = "" ? "Signature "+new Date().getTime() : file.name;  // file.name or default name + timestamp
		
		reader.onload = function(e) {				// Success
			var text = e.target.result;
			try {
				var json = JSON.parse(text);
				if (json.id) fileName = json.id;
				dataset[fileName] = json;	// add to dataset object
				addDatasetToMenu(fileName)// add to menu
				
			} catch(execption) {
				alert("Sorry, could not parse your data.");
				console.log("Sorry, could not parse your data.", execption.message);
			}
	
		}
		reader.onerror = function(error) {			// Error
			alert("Sorry, an error occured while loading your data.");
			console.log("Sorry, an error occured while loading your data.");
			console.log (error.getMessage())
		}

		reader.readAsText(file);
		
	}

});
*/

	
$("#menu-color a").on('click', function(e) {
	var id = $(this).data("id");

	$("#menu-color #seqlogo").attr("class", "");		// unset
	$("#menu-color #pmsig").attr("class", "");
	$("#menu-color #set1").attr("class", "");
	$("#menu-color #set2").attr("class", "");
	$("#menu-color #set3").attr("class", "");
	
	colors.previous = colors.current;
	if (id==="seqlogo") {
		colors.current = colors.seqlogo;
		$("#menu-color #seqlogo").attr("class", "active");
	} else if (id==="pmsig") {
		colors.current = colors.pmsig;
		$("#menu-color #pmsig").attr("class", "active");
	} else if (id==="set1") {
		colors.current = colors.set1;
		$("#menu-color #set1").attr("class", "active");
	} else if (id==="set2") {
		colors.current = colors.set2;
		$("#menu-color #set2").attr("class", "active");
	} else if (id==="set3") {
		colors.current = colors.set3;
		$("#menu-color #set3").attr("class", "active");
	}
	
	updateColors();
	e.preventDefault();
});

/*
$("#menu-display a").on('click', function(e) {
	var id = $(this).data("id");

	$("#menu-display #horizontal").attr("class", "");		// unset
	$("#menu-display #vertical").attr("class", "");
	
	if (id==="horizontal") {
		$("#menu-display #horizontal").attr("class", "active");
		updateRotation(0);
	} else if (id==="vertical") {
		$("#menu-display #vertical").attr("class", "active");
		updateRotation(-90);
	} 
	
	e.preventDefault();
});

*/



	

// end document ready


var addDatasetToMenu = function(fileName) {
	var html = '<li role="presentation" class="dataset"><a role="menuitem" tabindex="-1" href="#" data-id="'+fileName+'">'+fileName+'</a></li>';
	$("#menu-file .dataset").last().after(html);
}



