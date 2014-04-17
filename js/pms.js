
var width = 960,
    height = 500;


/* - - - - - - - - -  Settings End - - - - - - - - -  */

/* - - - - - - - - -  Color Start- - - - - - - - -  */
// G, orange; T and U, red; C, blue; and A, green
colors = {};
colors.seqlogo = [d3.rgb('green'), d3.rgb('blue'), d3.rgb('orange'), d3.rgb('red')]; 
colors.set1 = colorbrewer.Set1[4].map(function(c) { return d3.rgb(c); });			// turn colors strings #000000 into d3.rgb objects
colors.set2 = colorbrewer.Set2[4].map(function(c) { return d3.rgb(c); });
colors.set3 = colorbrewer.Set3[4].map(function(c) { return d3.rgb(c); });
colors.current = colors.seqlogo;
colors.previous = colors.current;		// for fading
/* - - - - - - - - -  Color End - - - - - - - - -  */

var baseMap = ["A", "C", "G", "T"];


var j = '{"bases":[\
		{"A":0.456783,"C":0.09622,"G":0.320569,"T":0.126428},\
		{"A":0.14292,"C":0.120229,"G":0.679338,"T":0.057513},\
		{"A":0.194916,"C":0.225219,"G":0.245604,"T":0.334261},\
		{"A":0.280921,"C":0.166793,"G":0.129435,"T":0.422851},\
		{"A":0.16038,"C":0.517299,"G":0.259141,"T":0.0631801}\
	],\
	"alterations":[\
		{"A":0.00683693,"C":0.131341,"G":0.792244,"T":0.0900889},\
		{"A":0.774358,"C":0.00591256,"G":0.037724,"T":0.199743},\
		{"A":0.0186174,"C":0.681494,"G":0.0054263,"T":0.310741},\
		{"A":0.309775,"C":0.606085,"G":0.0921147,"T":0.00398728}\
	]\
}';

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
	]	
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
	]	
};

dataset["Signature 1"] = {
	'bases': [
		{'A':0.0131038,'C':0.272986	,'G':0.308754 ,'T':0.405156  },
		{'A':0.242807 ,'C':0.194019	,'G':0.075388 ,'T':0.487786  },
		{'A':0.0283908,'C':0.411785	,'G':0.129991 ,'T':0.429833  },
		{'A':0.415831 ,'C':0.235867	,'G':0.343361 ,'T':0.00494084},
		{'A':0.353272 ,'C':0.0769459,'G':0.0499446,'T':0.519837  }
	],
	'alterations': [
		{'A':0.0865178,'C':0.328423  ,'G':0.340154  ,'T':0.504458  },
		{'A':0.674434 ,'C':0.00492005,'G':0.213325  ,'T':0.122081  },
		{'A':0.359977 ,'C':0.609779  ,'G':0.0155819 ,'T':0.0614081 },
		{'A':0.797531 ,'C':0.203814  ,'G':0.00807721,'T':0.00471106}
	]	
};

dataset["Signature 2"] = {
	'bases': [
		{'A':0.17272 ,'C':0.538852,'G':0.0672839,'T':0.221144 },
		{'A':0.133672,'C':0.154618,'G':0.230174 ,'T':0.481535 },
		{'A':0.314928,'C':0.374459,'G':0.22335  ,'T':0.0872619},
		{'A':0.050314,'C':0.091599,'G':0.738873 ,'T':0.119214 },
		{'A':0.524569,'C':0.159021,'G':0.0322241,'T':0.284186 }
	],
	'alterations': [
		{'A':0.00740596,'C':0.281173  ,'G':0.564092 ,'T':0.169547 },
		{'A':0.19761   ,'C':0.00623138,'G':0.0229948,'T':0.791858 },
		{'A':0.211745  ,'C':0.53183   ,'G':0.0104368,'T':0.277299 },
		{'A':0.479435  ,'C':0.232054  ,'G':0.342324	,'T':0.0269064}
	]	
};







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
	

};
updateData("Default");			// initalize 'Default' data


var updateDisplay = function() {
	baseGroups.data(display.bases)		// rebind

	rect.data(Object)
		.transition()
			.duration(1000)
			.attr("y", function(d, i) { return y(d.y0); })
			.attr("height", function(d) { return y(d.y); })
			
	labels.data(Object)
		.transition()
			.duration(1000)
			.attr("y", function(d, i) { return y(d.y0+d.y/2); })
			.attr("font-size", function(d, i){ return y(d.y) + "px"; })
			.attr("opacity", function (d,i) {  return (d.y>0.15) ? 1 : 0; })
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
			.duration(1000)
			.attr("x", function(d, i, a) { return x(d.w.y0); })
			.attr("y", function(d, i) { return y(d.y0); })
			.attr("height", function(d) { return y(d.y); })
			.attr("width", function(d,i,a) { return x(d.w.y); })
			
	centralLabels.data(Object)
		.transition()
			.duration(1000)
				.attr("x", function(d,i,a) { return x(d.w.y0 + d.w.y/2); })	
				.attr("y", function(d, i) { return y(d.y0+d.y/2); })
				.attr("opacity", function (d,i) { return (d.y>0.15 && d.w.y>0.15) ? 1 : 0; })	
				.attr("font-size", function(d,i,a) { return y(d3.min([d.y, d.w.y])) + "px"; })
			
}






// scales for [0,1] to [0,100]
var x = d3.scale.linear().domain([0,1]).range([0, 100]);
var y = x;  // same a x

var svg = d3.select("#display svg");

var envelope = svg.append("g")
	.attr("class", "enevelope")
	.attr("transform", "translate(280,40)")
	
envelope.append("rect")

	.attr("height", 190)
	.attr("width", 80)
	.style("fill", "#ddd")
	.style("stroke", "#ddd")
	.style("stroke-width", "40px")
	.style("stroke-linejoin", "round")
	

var baseGroups = svg.selectAll("g.bases")					// select not-yet exisiting svg:g
		.data(display.bases)
	.enter().append("svg:g")								// add g on enter svg:g
		.attr("class", "bases")								// add class	
		.attr("transform", function(d,i) { 
			if (d.transform===undefined) d.transform = d3.transform();
			var t = d.transform;
			t.translate = [(30+120*i), 30];			
			return t.toString(); 
		})
		.attr("clip-path", "url(#clip)") // clipping

// base probablities
var rect = baseGroups.selectAll("rect")
		.data(Object)			// nested data get automatically passed?
	.enter().append("svg:rect")
		.attr("x", 0)
		.attr("y", function(d, i) { return y(d.y0); })
		.attr("opacity", 1)
		.attr("height", function(d) { return y(d.y); })
		.attr("width", x(1))
		.style("fill", function(d, i) { return colors.current[i]; })

// base labels
var labels = baseGroups.selectAll("text")
		.data(Object)
	.enter().append("svg:text")
		.attr("x", function(d,i,a) { return x(0.5); })	// cache d3.transform
		.attr("y", function(d, i) { return y(d.y0+d.y/2); })
		.attr("font-size", function(d, i){ return y(d.y) + "px"; })
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
		
		
		
		
// central group
var centralTop = svg.append("g")
	.attr("class", "top")
	.attr("transform", "translate(270,140)")
	.attr("clip-path", "url(#clip)") // clipping
		
var centralGroup = centralTop.selectAll("g.central")					// select not-yet exisiting svg:g
		.data(display.alterations)
	.enter().append("svg:g")								// add g on enter svg:g
		.attr("class", "central")								// add class	

var centralRect = centralGroup.selectAll("rect")
		.data(Object)			// nested data get automatically passed?
	.enter().append("svg:rect")
		.attr("x", function(d, i, a) {
			d.w = display.bases[2][a]; 		// get x & width from 3rd bases, cache
			return x(d.w.y0);
		})
		.attr("y", function(d, i) { return y(d.y0); })		// get y & height from replacement alterations
		.attr("height", function(d) { return y(d.y); })
		.attr("width", function(d,i,a) { 
			return x(d.w.y);					// recall cached 3rd base
		})
		.style("fill", function(d, i) { return colors.current[i]; })
	
	
	
// central labels
var centralLabels = centralGroup.selectAll("text")
		.data(Object)
	.enter().append("svg:text")
		.attr("x", function(d,i,a) { 
			return x(d.w.y0 + d.w.y/2); 			// recall cached 3rd base
		})	// cache d3.transform
		.attr("y", function(d, i) {
			d.transform = d3.transform(); 				// cache rotation center
			var rx = 50;
			var ry = y(d.y/2+d.y0);
			d.transform.rotationCenter = [rx, ry];
			return y(d.y0+d.y/2); 
		})
		.attr("font-size", function(d,i,a) {
			
			return y(d3.min([d.y, d.w.y])) + "px"; 
		})
		.attr("text-anchor", "middle")				// center text h
		.attr("alignment-baseline", "central")		// center text v
		
		.text(function (d,i,a) { return baseMap[i]; })	// only show label if data is displayed
		.attr("opacity", function (d,i) { return (d.y>0.15 && d.w.y>0.15) ? 1 : 0; })		
		.style("fill", "white")



