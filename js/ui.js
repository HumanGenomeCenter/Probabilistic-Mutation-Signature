// update & fade colors
var updateColors = function() {
	var changeColor= function(selection) {
		selection.selectAll("rect")
			.style("fill", function(d, i) { return colors.previous[i]; })
			.transition()
				.duration(1000)
				.style("fill", function(d, i) { return colors.current[i]; })
	}
	baseGroups.call(changeColor);
	centralGroup.call(changeColor);			
}


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


// Interactions

$("body").on('click', "#menu-file .dataset a", function(e) {		// cmp with $("#menu-file .dataset a").on('click', function(e) {
	var id = $(this).data("id");
	$("#menu-file .dataset").removeClass("active");		// unset
	$(this).parent().addClass("active");
	updateData(id);
	updateDisplay();
	e.preventDefault();
});
	

$("#menu-file #add_dataset a").on('click', function(e) {
	if (window.FileReader && window.FileList) {
		$("#uploadData").click();	// 
	} else {
		alert("Sorry, your browser does not support local file access");
	}
	e.preventDefault();
});

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


	
$("#menu-color a").on('click', function(e) {
	var id = $(this).data("id");

	$("#menu-color #seqlogo").attr("class", "");		// unset
	$("#menu-color #set1").attr("class", "");
	$("#menu-color #set2").attr("class", "");
	$("#menu-color #set3").attr("class", "");
	
	colors.previous = colors.current;
	if (id==="seqlogo") {
		
		colors.current = colors.seqlogo;
		$("#menu-color #seqlogo").attr("class", "active");
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




$("#slider").on("change", function(e) {
	var d = $(this).val();
	updateRotation(d);
});
	

// end document ready


var addDatasetToMenu = function(fileName) {
	var html = '<li role="presentation" class="dataset"><a role="menuitem" tabindex="-1" href="#" data-id="'+fileName+'">'+fileName+'</a></li>';
	$("#menu-file .dataset").last().after(html);
}



