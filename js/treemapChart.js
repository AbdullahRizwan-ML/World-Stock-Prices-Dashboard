export function drawTreemapChart(data, selectedBrand = "All") {
  const container = d3.select("#treemapChart");
  container.html(""); // Clear existing SVG

  console.log("Initializing Treemap Chart for brand:", selectedBrand);

  // Dynamically set width and height based on window size
  const width = window.innerWidth - 40; // Subtract margin/padding for layout
  const height = Math.min(500, window.innerHeight * 0.4); // Cap height at 500px or 40% of screen height
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  const svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Title
  svg.append("text")
    .attr("x", (width - margin.left - margin.right) / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", "#00bcd4")
    .text("Volume by Brand");

  // Filter data based on selected brand
  const filteredData = data.filter(d => d.Volume && !isNaN(+d.Volume));
  const nestedData = d3.group(filteredData, d => d.Brand_Name);
  const root = d3.hierarchy({ children: Array.from(nestedData, ([name, values]) => ({
    name,
    value: d3.sum(values, d => +d.Volume),
    isSelected: name === selectedBrand
  })) })
    .sum(d => d.value);

  // Compute treemap layout
  const treemap = d3.treemap()
    .size([width, height])
    .padding(2)
    .round(true);

  treemap(root);

  // Color scale
  const color = d3.scaleOrdinal()
    .domain(root.children.map(d => d.data.name))
    .range(d3.schemeCategory10)
    .unknown("#ccc");

  // Draw rectangles
  const nodes = svg.selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => d.data.isSelected ? d3.color(color(d.data.name)).darker(1) : color(d.data.name))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1);

  // Add tooltips
  const tooltip = container.append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.75)")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  nodes.on("mouseover", (event, d) => {
    tooltip.style("opacity", 1)
      .html(`<strong>${d.data.name}</strong><br>Volume: ${d3.format(",.2r")(d.data.value)}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 20) + "px");
    d3.select(event.currentTarget).select("rect").attr("fill", d3.color(color(d.data.name)).brighter(0.5));
  })
  .on("mouseout", (event, d) => {
    tooltip.style("opacity", 0);
    d3.select(event.currentTarget).select("rect").attr("fill", d => d.data.isSelected ? d3.color(color(d.data.name)).darker(1) : color(d.data.name));
  });

  // Add labels if space allows
  nodes.filter(d => (d.x1 - d.x0) > 40 && (d.y1 - d.y0) > 20)
    .append("text")
    .attr("x", d => (d.x1 - d.x0) / 2)
    .attr("y", d => (d.y1 - d.y0) / 2)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .style("fill", "white")
    .style("font-size", "12px")
    .text(d => d.data.name.length > 10 ? d.data.name.substring(0, 10) + "..." : d.data.name);

  // Resize handler
  window.addEventListener("resize", () => {
    drawTreemapChart(data, selectedBrand); // Re-render on resize
  });
}