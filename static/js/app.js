var attributes = ["Over Draft", "Credit History", "Average Credit Balance", "Housing", "Purpose", "Job", "Other Payment Plans", "Employment", "Property Magnitude"];

$.getJSON( "/data", function( data ) {

var treeData = data;

var margin = {top: 20, right: 120, bottom: 20, left: 120},
	width = 1960 - margin.right - margin.left,
	height = 600 - margin.top - margin.bottom;
	
var i = 0,
	duration = 750,
	root;

var tree = d3.layout.tree()
	.size([height, width]);

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

root = treeData;
root.x0 = height / 2;
root.y0 = 0;
  
update(root);
d3.select(self.frameElement).style("height", "1000px");

var visibleTextId = -1;

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
	  .on("click", click);

  nodeEnter.append("circle")
	  .attr("r", function(d) { return 5+0.05*(d.percentage[0]+d.percentage[1])})
	  .style("fill", function(d) { 
			return colorbrewer.RdBu[9][Math.round((9*d.percentage[0])/(d.percentage[0]+d.percentage[1]))];
		})
	  //.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })
		.on("mouseover", function(d,i){
			$("#attribute-card").html((d.value.length == 0 ? "Root" : attributes[d.value.length-1])+"<hr/>");
			$("#value-card").html(d.value[d.value.length-1]);
			$("#fraud-card").html(d.percentage[1]);
			$("#good-card").html(d.percentage[0]);
			$("#total-card").html(d.percentage[0]+d.percentage[1]);
			$("#current-values").val(d.value.join(","));
			if (!(d.parent && d.parent.children && d.parent.children.length < 15)){
				visibleTextId = d.id;
				update(d);
			}
		})
		.on("mouseout", function(d,i){
			if (!(d.parent && d.parent.children && d.parent.children.length < 15)){
				visibleTextId = -1;
				update(d);
			}
		});

	 nodeEnter.append("text")
	  .attr("x", function(d) { return d.children || d._children ? -25 : 13; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.name; })
	  .style("fill-opacity", 1e-6)

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
	  .duration(duration)
	  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
	  .attr("r", function(d) { return 5+0.05*(d.percentage[0]+d.percentage[1])})
	  .style("fill", function(d) { 
			return colorbrewer.RdBu[9][Math.round((9*d.percentage[0])/(d.percentage[0]+d.percentage[1]))];
		});
	  //.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
	  .duration(0)
	  .style("fill-opacity", function(d) { return (visibleTextId == d.id) || (d.parent && d.parent.children && d.parent.children.length < 15) ? 1 : 0;});

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
	  .duration(duration)
	  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	  .remove();

  nodeExit.select("circle")
	  .attr("r", function(d) { return 5+0.05*(d.percentage[0]+d.percentage[1])})

  nodeExit.select("text")
	  .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", function(d) {
		var o = {x: source.x0, y: source.y0};
		return diagonal({source: o, target: o});
	  });

  // Transition links to their new position.
  link.transition()
	  .duration(duration)
	  .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
	  .duration(duration)
	  .attr("d", function(d) {
		var o = {x: source.x, y: source.y};
		return diagonal({source: o, target: o});
	  })
	  .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
	d.x0 = d.x;
	d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
	d._children = d.children;
	d.children = null;
  } else {
	d.children = d._children;
	d._children = null;
  }
  update(d);
}

});

function deepSearch(){
	$.getJSON( "/match?q="+$("#current-values").val(), function( data ) {
		console.log(data.data[0]);
  var table = document.createElement('table');
	table.className = "table table-striped";
  var tableBody = document.createElement('tbody');

  var row = document.createElement('tr');
	attributes.forEach(function(element) {
      var cell = document.createElement('th');
      cell.appendChild(document.createTextNode(element));
			row.appendChild(cell);
	});
  tableBody.appendChild(row);

  data.data.forEach(function(rowData) {
    var row = document.createElement('tr');

    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  document.getElementById("modal_body").appendChild(table);
  	$('.modal').modal();
	});
}
