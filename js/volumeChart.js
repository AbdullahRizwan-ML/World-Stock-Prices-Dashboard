export function drawVolumeChart(data) {
  // Step 1: Aggregate volume per brand
  const volumeData = Array.from(
    d3.rollup(data, v => d3.sum(v, d => +d.Volume), d => d.Brand_Name)
  );

  // Step 2: Sort & take Top 10 brands
  const topBrands = volumeData
    .sort((a, b) => d3.descending(a[1], b[1]))
    .slice(0, 10);

  // Dimensions
  const width = 600;
  const height = 420;
  const margin = { top: 60, right: 30, bottom: 80, left: 150 }; // Increased top margin for title

  // Clear existing and set up SVG
  const svg = d3.select("#volumeChart")
    .html("")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Title above the graph
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "#00bcd4")
    .style("font-weight", "bold")
    .text("Total Trade Volume by Brand");

  // Tooltip
  const tooltip = d3.select("#volumeChart")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.75)")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Scales
  const y = d3.scaleBand()
    .domain(topBrands.map(d => d[0]))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  const x = d3.scaleLinear()
    .domain([0, d3.max(topBrands, d => d[1])])
    .nice()
    .range([margin.left, width - margin.right]);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).ticks(5).tickFormat(d => d3.format(".2s")(d).replace("G", "B")));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Bars
  svg.selectAll("rect")
    .data(topBrands)
    .join("rect")
    .attr("y", d => y(d[0]))
    .attr("x", margin.left)
    .attr("width", d => x(d[1]) - margin.left)
    .attr("height", y.bandwidth())
    .attr("fill", "#00bcd4")
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("fill", "#007c91");

      tooltip
        .style("opacity", 1)
        .html(`<strong>${d[0]}</strong><br>Volume: ${d3.format(",.2r")(d[1])}`);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 12 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("fill", "#00bcd4");
      tooltip.style("opacity", 0);
    });

  // Value Labels
  svg.selectAll("text.label")
    .data(topBrands)
    .join("text")
    .attr("class", "label")
    .attr("x", d => x(d[1]) + 5)
    .attr("y", d => y(d[0]) + y.bandwidth() / 2 + 4)
    .text(d => d3.format(".2s")(d[1]).replace("G", "B"))
    .attr("fill", "black");

  // X-axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 40)
    .attr("text-anchor", "middle")
    .style("fill", "#e0e0e0")
    .style("font-size", "12px")
    .text("Total Volume (Units)");

  // Y-axis label
  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", margin.left / 2)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("fill", "#e0e0e0")
    .style("font-size", "12px")
    .text("Brand");
}