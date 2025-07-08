export function drawBarChart(data) {
  // Calculate average Close per industry
  let industryData = Array.from(
    d3.rollup(data, v => d3.mean(v, d => +d.Close), d => d.Industry_Tag)
  );

  // Clear previous chart and dropdown
  d3.select("#barChart").html("");

  // Chart title (above filters)
  d3.select("#barChart")
    .append("div")
    .style("text-align", "center")
    .style("margin-bottom", "10px")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("color", "#00bcd4")
    .text("Average Close Price by Industry");

  // Create dropdown filter
  const filterDiv = d3.select("#barChart")
    .append("div")
    .style("margin-bottom", "10px");

  filterDiv.append("label")
    .attr("for", "barFilter")
    .text("Select View: ");
    

  const select = filterDiv.append("select")
    .attr("id", "barFilter");

  select.selectAll("option")
    .data(["Top 10", "Bottom 10", "All"])
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  // Tooltip div
  const tooltip = d3.select("#barChart")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0,0,0,0.75)")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  function update(view) {
    d3.select("#barChart svg").remove();

    let filteredData = [...industryData];
    filteredData.sort((a, b) => d3.descending(a[1], b[1]));

    if (view === "Top 10") {
      filteredData = filteredData.slice(0, 10);
    } else if (view === "Bottom 10") {
      filteredData = filteredData.slice(-10);
    }

    const width = 600;
    const height = 400;
    const margin = { top: 60, right: 30, bottom: 60, left: 180 }; // Adjusted bottom margin for labels

    const svg = d3.select("#barChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Scales
    const y = d3.scaleBand()
      .domain(filteredData.map(d => d[0]))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d[1])])
      .nice()
      .range([margin.left, width - margin.right]);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${margin.top})`)
      .call(d3.axisTop(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("rect")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("x", x(0))
      .attr("y", d => y(d[0]))
      .attr("height", y.bandwidth())
      .attr("width", d => x(d[1]) - x(0))
      .attr("fill", "#00bcd4")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#007c91");
        tooltip.style("opacity", 1)
          .html(`<strong>${d[0]}</strong><br/>Avg Close: $${d[1].toFixed(2)}`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "#00bcd4");
        tooltip.style("opacity", 0);
      });

    // X-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .style("fill", "#e0e0e0")
      .style("font-size", "12px")
      .text("Average Close Price (USD)");

    // Y-axis label
    svg.append("text")
      .attr("x", -height / 2)
      .attr("y", margin.left / 2)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("fill", "#e0e0e0")
      .style("font-size", "12px")
      .text("Industry");
  }

  // Initial render
  update("Top 10");

  // On dropdown change
  select.on("change", function () {
    update(this.value);
  });
}