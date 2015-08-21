
var width = 960,
    height = 500;


/* - - - - - - - - -  Settings End - - - - - - - - -  */

/* - - - - - - - - -  Color Start- - - - - - - - -  */
// G, orange; T and U, red; C, blue; and A, green
colors = {};
colors.seqlogo = [d3.rgb('green'), d3.rgb('blue'), d3.rgb('orange'), d3.rgb('red')]; 
colors.pmsig = [d3.rgb('#26AF28'), d3.rgb('#468BFF'), d3.rgb('#AA8C00'), d3.rgb('#F35C5B')]; 
colors.set1 = colorbrewer.Set1[4].map(function(c) { return d3.rgb(c); });			// turn colors strings #000000 into d3.rgb objects
colors.set2 = colorbrewer.Set2[4].map(function(c) { return d3.rgb(c); });
colors.set3 = colorbrewer.Set3[4].map(function(c) { return d3.rgb(c); });
colors.current = colors.seqlogo;
colors.previous = colors.current;		// for fading

colors.strand = [d3.rgb("#19B5B7"), d3.rgb("#EB47DB")];
/* - - - - - - - - -  Color End - - - - - - - - -  */

var baseMap = ["A", "C", "G", "T"];




var dataset = {};
dataset["Default"] = {
	'bases': [
		{'A':0.25,'C':0.25,'G':0.25,'T':0.25},		// totaling 1.0
		{'A':0.25,'C':0.25,'G':0.25,'T':0.25},
		{'A':0.25,'C':0.25,'G':0.25,'T':0.25},
		{'A':0.25,'C':0.25,'G':0.25,'T':0.25},
		{'A':0.25,'C':0.25,'G':0.25,'T':0.25},
	],
	'alterations': [
		{'A':0.25,'C':0.25,'G':0.25,'T':0.25},		// totaling 1.0
		{'A':0.25,'C':0.25,'G':0.25,'T':0.25},
		{'A':0.25,'C':0.25,'G':0.25,'T':0.25},
		{'A':0.25,'C':0.25,'G':0.25,'T':0.25}	
	],
	'strand': {
		'plus': 0.5,
		'minus': 0.5,
	}
};

dataset["Signature 0"] = {
	'bases': [
		{'A':0.456783,'C':0.09622 ,'G':0.320569,'T':0.126428 },
		{'A':0.14292 ,'C':0.120229,'G':0.679338,'T':0.057513 },
		{'A':0.194916,'C':0.225219,'G':0.245604,'T':0.334261 },
		{'A':0.280921,'C':0.166793,'G':0.129435,'T':0.422851 },
		{'A':0.16038 ,'C':0.517299,'G':0.259141,'T':0.0631801}
	],
	'alterations': [
		{'A':0.00683693	,'C':0.131341	,'G':0.792244	,'T':0.0900889 },
		{'A':0.774358	,'C':0.00591256	,'G':0.037724	,'T':0.199743  },
		{'A':0.0186174	,'C':0.681494	,'G':0.0054263	,'T':0.310741  },
		{'A':0.309775	,'C':0.606085	,'G':0.0921147	,'T':0.00398728}
	],
	'strand': {
		'plus': 0.75,
		'minus': 0.25,
	}
};


var renyiEntropy = function(b) {
	return 1 + 0.5 * Math.log(Math.pow(b.A,2) + Math.pow(b.C,2) + Math.pow(b.G,2) + Math.pow(b.T,2));
}



var display = {"bases":[], "alterations":[]};

var updateData = function(dataID) {
	// calculate baselines with stack()
	
	var rotate = function(m) {
		var rotated = [];
		var stacked = d3.layout.stack()(["A", "C", "G", "T"].map(function(base) {
			return m.map(function(d, i) { 
				return {x: i, y: +d[base]}; 
			});
		}));
		stacked[0].map(function(a,i) { 		// create empty array of arrays
			rotated[i] = []; 
		});
		stacked.map(function(a, i) {			// fill empty array
			a.map(function(b,j) {
				rotated[j][i] = stacked[i][j];
			});
		});
		return rotated;
	}
	rotatedBases = rotate(dataset[dataID].bases);
	rotatedAlterations = rotate(dataset[dataID].alterations);
	
	// replace values in place, but keep the current transformation
	if (display.bases.length === 0) {
		display.bases = rotatedBases;
	} else {
		rotatedBases.forEach(function(b,i){
			b.forEach(function(d,j){
				$.extend(display.bases[i][j], d);
			})	
		})	
	}
	
	if (display.alterations.length === 0) {
		display.alterations = rotatedAlterations;
	} else {
		rotatedAlterations.forEach(function(b,i){
			b.forEach(function(d,j){
				$.extend(display.alterations[i][j], d);
			})	
		})	
	}
	
	// update strand
	display.strand = dataset[dataID].strand;

	// shortcut...
	currentData = dataset[dataID];
};
updateData("Signature 0");			// initalize 'Default' data



var updateDisplay = function() {
	baseGroups.data(display.bases)		// rebind

	var duration = 0;
	
	rectBackground.data(Object)			// nested data get automatically passed?
		.transition()
			.duration(duration)
				.attr("x", function(d, i) { return y(d.y0); })
				.attr("width", function(d) { return y(d.y); })

	
	rect.data(Object)
		.transition()
			.duration(duration)
			.attr("x", function(d, i) { return y(d.y0); })
			.attr("y", function(d,i,a) { 
				var h = 1 - renyiEntropy(currentData.bases[a]);	// find better way to access values
				return y(h);
			})
			.attr("width", function(d) { return y(d.y); })
	
	labels.data(Object)
		.transition()
			.duration(duration)
			.attr("y", function(d,i,a) { 
				var e = renyiEntropy(currentData.bases[a]);	// find better way to access values
				return y(1-e+e/2);
			})
			.attr("x", function(d, i) { return y(d.y0+d.y/2); })
			.attr("font-size", adjustLabelSize)
			.attr("opacity", function (d,i) {  return (d.y>0.15) ? 1 : 0; })	// show/hide bases
			.attrTween("transform", function(d,i,a) {
				var t = d.transform;	// get transform & old rotation center
				var rx = t.rotationCenter[0];
				var ry = t.rotationCenter[1];
				var from = t.toString().replace(")skewX(", ","+rx+","+ry+")skewX(");
				rx = 50;				// calculate new rotation center
				ry = y(d.y/2+d.y0);
				var to = t.toString().replace(")skewX(", ","+rx+","+ry+")skewX(");
				t.rotationCenter = [rx, ry];
				d.transform = t;		// update transform
				return d3.interpolateString(from, to);
			})
		
	centralGroup.data(display.alterations);		// rebind
		
	centralRect.data(Object)
		.transition()
			.duration(duration)
			.attr("x", function(d, i, a) { return x2(d.w.y0); })
			.attr("y", function(d) { 
				if (d.x===1) { 			// adjust scales.. C	
					return cScale(d.y0);
				} else if (d.x===3) {  // T
					return tScale(d.y0);
				}
				return y2(d.y0); 	// not needed..?
			})
			.attr("height", function(d) { 
				if (d.x===1) { // C
					return cScale(d.y);
				} else if (d.x===3) {  // T
					return tScale(d.y);
				}
				return y2(d.y);		// not needed..?
			})
			.attr("width", function(d,i,a) { return x2(d.w.y); })
			
	centralLabels.data(Object)
		.transition()
			.duration(duration)
				.attr("x", function(d,i,a) { return x2(d.w.y0 + d.w.y/2); })	
				.attr("y", function(d, i) { 
					if (d.x===1) { 			// adjust scales.. C	
						return cScale(d.y0+d.y/2);
					} else if (d.x===3) {  // T
						return tScale(d.y0+d.y/2);
					}
					return y2(d.y0+d.y/2);
				})
				.attr("opacity", function (d,i) { return (d.y>0.15 && d.w.y>0.15) ? 1 : 0; })	
				.attr("font-size", adjustLargeLabelSize)
	
	// update strand, quick and dirty

	// remove
	strands.selectAll(".arc").remove()
				
	// recreate
	arcs = strands.selectAll("g.arc")
	    .data(pie([display.strand.plus, display.strand.minus]))
	  .enter().append("g")
	    .attr("class", "arc")

	arcs.append("path")
		.attr("d", arc)
		.attr("stroke", "#fff")
		.attr("stroke-width", 0.5)
		.style("fill", function(d,i) { return colors.strand[i]; });

	arcs.append("text")
		.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.attr("font-family", "Fira Sans")
		.attr("font-weight", 500)
		.attr("font-size", "50px")
		.style("fill", "white")
		.text(function(d,i) { if (i===0) return "+"; return "-"; });

	// connex
	connex = envelope.selectAll("path")
			.data(display.bases[2])

	connex.attr("d", function(d) {
			var padding = 0;
			var start = y2(d.y0)+padding;
			var topWidth = y2(d.y0+d.y);
			var bottomWidth = 50+y(d.y0+d.y);
			var bottom = 50+y(d.y0)+padding;
			var h = 100;
			return 	"M"+start+",0 L"+topWidth+",0"+
					"C"+topWidth+","+h/2+" "+bottomWidth+","+h/2+" "+bottomWidth+","+h+
					"L"+bottom+","+h+
					"C"+bottom+","+h/2+" "+start+","+h/2+" "+start+",0"+
					"Z";
		})
	
	
}








// scales for [0,1] to [0,100]
var x = d3.scale.linear().domain([0,1]).range([0, 100]);
var y = x;  // same a x
var x2 = d3.scale.linear().domain([0,1]).range([0, 200]);
var y2 = x2;

var cScale = d3.scale.linear().domain([0,1]).range([0, 200]);
var tScale = d3.scale.linear().domain([0,1]).range([0, 200]);

var svg = d3.select("#display svg");






var arc = d3.svg.arc().outerRadius(50).innerRadius(0);
var pie = d3.layout.pie();

var strands = svg.append("g")
	.attr("class", "strands")
	.attr("transform", "translate(560,80)")
	
//var strandData = {plus: 0.8847220518086, minus: 0.513152779481914};
var arcs = strands.selectAll("g.arc")
		.data(pie([display.strand.plus, display.strand.minus]))
	.enter().append("g")
		.attr("class", "arc")

arcs.append("path")
	.attr("d", arc)
	.attr("fill", function(d,i) { return colors.strand[i]; })
	.attr("stroke", "#fff")
	.attr("stroke-width", 0.5)
	
arcs.append("text")
	.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	.attr("dy", ".35em")
	.style("text-anchor", "middle")
	.attr("font-family", "Fira Sans")
	.attr("font-weight", 500)
	.attr("font-size", "50px")
	.style("fill", "white")
	.text(function(d,i) { if (i===0) return "+"; return "-"; });



	

var baseGroups = svg.selectAll("g.bases")					// select not-yet exisiting svg:g
		.data(display.bases)
	.enter().append("svg:g")								// add g on enter svg:g
		.attr("class", "bases")								// add class
		.attr("transform", function(d,i) { 
			if (d.transform===undefined) d.transform = d3.transform();
			var t = d.transform;
			t.translate = [(30+120*i), 330];		// positioning		
			return t.toString(); 
		})
		.attr("clip-path", function(d,i) {
			if (i===2) return "url(#centerBase)";	// bottom round only
			return "url(#standardBase)";			// all round
		})
;

//baseGroups.append("rect")
//	.attr("class", "baseBackground")
		

// base probablities
var rectBackground = baseGroups.selectAll("rect.background")
		.data(Object)			// nested data get automatically passed?
	.enter().append("svg:rect")
		.attr("class", "background")
		.attr("fill", "#e5e5e5")
		.attr("fill-opacity", 1)
		.attr("stroke", "#fff")
		.attr("stroke-width", 0.5)
		.attr("stroke-opacity", 1)
		.attr("x", function(d, i) { return y(d.y0); })		// switching x,y
		.attr("y", function(d,i,a) { return y(0); })
		.attr("width", function(d) { return y(d.y); })
		.attr("height", function(d,i,a) { return y(1); })



var rect = baseGroups.selectAll("rect.foreground")
		.data(Object)			// nested data get automatically passed?
	.enter().append("svg:rect")
		.attr("class", "foreground")
		.attr("x", function(d, i) { return y(d.y0); })		// switching x,y
		.attr("y", function(d,i,a) { 
			var h = 1 - renyiEntropy(currentData.bases[a]);	// find better way to access values
			return y(h);
		})
		.attr("opacity", 1)
		.attr("width", function(d) { return y(d.y); })
		.attr("height", function(d,i,a) {
			return y(1);
		})
		.style("fill", function(d, i) { return colors.current[i]; })

var adjustLabelSize = function(d,i,a) {
	var h = renyiEntropy(currentData.bases[a]);	// find better way.. scale?
	var w = d.y;
	return y(d3.min([w,h]));
}

var adjustLargeLabelSize = function(d,i,a) {
	var w = d.w.y;
	var h = d.y;
	console.log(w, h);
	
	return y2(d3.min([w, h])) + "px"; 
}

		
// base labels
var labels = baseGroups.selectAll("text")
		.data(Object)
	.enter().append("svg:text")
		.attr("y", function(d,i,a) { 
			var e = renyiEntropy(currentData.bases[a]);	// find better way to access values
			return y(1-e+e/2);
		})
		.attr("x", function(d, i) { 
			return y(d.y0+d.y/2);
		})
		.attr("font-family", "Fira Sans")
		.attr("font-weight", 500)
		.attr("font-size", adjustLabelSize)
		.attr("text-anchor", "middle")				// center text h
		.attr("alignment-baseline", "central")		// center text v
		.attr("opacity", function (d,i) { return (d.y>0.15) ? 1 : 0; })
		.text(function (d,i) { 			
			d.transform = d3.transform(); 			// cache rotation center
			var rx = 50;
			var ry = y(d.y/2+d.y0);
			d.transform .rotationCenter = [rx, ry];			
			return baseMap[i]; })					// conditionally show labels
		.style("fill", "white")
		




var envelope = svg.append("g")
	.attr("class", "envelope")
	.attr("transform", "translate(220,230)")

// changed drawing order
var connex = envelope.selectAll("path")
		.data(display.bases[2])
	.enter().append("path")
		.attr("fill", "#ccc")				// add SVG attr inline, so they show up in print
		.attr("fill-opacity", 0.5)	
		.attr("stroke", "#fff")
		.attr("stroke-width", 0.5)
		.attr("d", function(d) {
			var padding = 0;
			var start = y2(d.y0)+padding;
			var topWidth = y2(d.y0+d.y);
			var bottomWidth = 50+y(d.y0+d.y);
			var bottom = 50+y(d.y0)+padding;
			var h = 100;
			return 	"M"+start+",0 L"+topWidth+",0"+
					"C"+topWidth+","+h/2+" "+bottomWidth+","+h/2+" "+bottomWidth+","+h+
					"L"+bottom+","+h+
					"C"+bottom+","+h/2+" "+start+","+h/2+" "+start+",0"+
					"Z";
		})






		
// central group
var centralTop = svg.append("g")
	.attr("class", "top")
	.attr("transform", "translate(220,30)")
	.attr("clip-path", "url(#mutatedBase)") // clipping


		
var centralGroup = centralTop.selectAll("g.central")					// select not-yet exisiting svg:g
		.data(display.alterations)
	.enter().append("svg:g")								// add g on enter svg:g
		.attr("class", "central")								// add class


// scalefactor top



var centralRect = centralGroup.selectAll("rect")
		.data(Object)			// nested data get automatically passed?
	.enter().append("svg:rect")
		.attr("x", function(d, i, a) {
			d.w = display.bases[2][a]; 		// get x & width from 3rd bases, cache
			return x2(d.w.y0);
		})
		.attr("y", function(d, i) { return y2(d.y0); })		// get y & height from replacement alterations
		.attr("height", function(d) { return y2(d.y); })
		.attr("width", function(d,i,a) { 
			return x2(d.w.y);					// recall cached 3rd base
		})
		.style("fill", function(d, i) { return colors.current[i]; })
	
	

// central labels
var centralLabels = centralGroup.selectAll("text")
		.data(Object)
	.enter().append("svg:text")
		.attr("x", function(d,i,a) { 
			return x2(d.w.y0 + d.w.y/2); 			// recall cached 3rd base
		})	// cache d3.transform
		.attr("y", function(d, i) {
			d.transform = d3.transform(); 				// cache rotation center
			var rx = 50;
			var ry = y(d.y/2+d.y0);
			d.transform.rotationCenter = [rx, ry];
			return y2(d.y0+d.y/2); 
		})
		.attr("font-family", "Fira Sans")
		.attr("font-weight", 500)
		.attr("font-size", adjustLargeLabelSize)
		.attr("text-anchor", "middle")				// center text h
		.attr("alignment-baseline", "central")		// center text v
		
		.text(function (d,i,a) { return baseMap[i]; })	// only show label if data is displayed
		.attr("opacity", function (d,i) { return (d.y>0.15 && d.w.y>0.15) ? 1 : 0; })		
		.style("fill", "white")





