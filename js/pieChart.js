export function drawPieChart(data, highlightedSectors = []) {
  const width = 460, height = 360;
  const radius = Math.min(width, height) / 2 - 30;
  const highlightColor = "#00bcd4";

  // Prepare and aggregate data
  const rawData = Array.from(d3.rollup(data, v => v.length, d => d.Industry_Tag))
    .sort((a, b) => d3.descending(a[1], b[1]));

  const top10 = rawData.slice(0, 10);
  const otherSum = d3.sum(rawData.slice(10), d => d[1]);
  const pieData = otherSum > 0 ? [...top10, ["Other", otherSum]] : top10;
  const total = d3.sum(pieData, d => d[1]);

  const pie = d3.pie().value(d => d[1]);
  const arc = d3.arc().innerRadius(40).outerRadius(radius);
  const labelArc = d3.arc().innerRadius(radius / 2).outerRadius(radius - 10);

  const safeColorScheme = highlightedSectors.length > 0
    ? d3.schemeCategory10.filter(c => c.toLowerCase() !== highlightColor)
    : d3.schemeCategory10;

  const color = d3.scaleOrdinal()
    .domain(pieData.map(d => d[0]))
    .range(safeColorScheme);

  // Clear previous chart
  d3.select("#pieChart").html("");

  const svg = d3.select("#pieChart")
    .append("svg")
    .attr("width", width + 150)
    .attr("height", height + 50);

  // Move title to the top
  svg.append("text")
    .attr("x", (width + 10) / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", highlightColor)
    .style("font-weight", "bold")
    .text("Industry Tag Distribution");

  const chartGroup = svg.append("g")
    .attr("transform", `translate(${(width / 2) - 20}, ${height / 2 + 10})`);

  // Tooltip
  const tooltip = d3.select("#pieChart").append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Pie slices
  chartGroup.selectAll("path")
    .data(pie(pieData))
    .join("path")
    .attr("d", arc)
    .attr("fill", d => highlightedSectors.includes(d.data[0]) ? highlightColor : color(d.data[0]))
    .attr("stroke", d => highlightedSectors.includes(d.data[0]) ? "#004a75" : "#fff")
    .attr("stroke-width", d => highlightedSectors.includes(d.data[0]) ? 3 : 1)
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 1)
        .html(`<strong>${d.data[0]}</strong><br>${((d.data[1] / total) * 100).toFixed(1)}%`);
    })
    .on("mousemove", function (event) {
      tooltip.style("left", event.pageX + 10 + "px")
             .style("top", event.pageY - 30 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  // Percentage labels
  chartGroup.selectAll("text")
    .data(pie(pieData))
    .join("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .text(d => `${((d.data[1] / total) * 100).toFixed(1)}%`);

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 25}, ${(height - pieData.length * 20) / 2 + 20})`);

  legend.selectAll("rect")
    .data(pieData)
    .join("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 20)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", d => highlightedSectors.includes(d[0]) ? highlightColor : color(d[0]));

  legend.selectAll("text")
    .data(pieData)
    .join("text")
    .attr("x", 18)
    .attr("y", (d, i) => i * 20 + 10)
    .text(d => d[0])
    .attr("font-size", "12px")
    .attr("fill", "#e0e0e0");
}
