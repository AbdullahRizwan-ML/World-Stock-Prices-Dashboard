export function drawIndustryComparisonChart(allData, selectedBrand) {
  // Step 1: Get brand's industry
  const brandData = allData.find(d => d.Brand_Name === selectedBrand);
  if (!brandData) return;

  const industry = brandData.Industry_Tag;

  // Step 2: Filter industry peers
  const industryPeers = allData.filter(d => d.Industry_Tag === industry);

  // Step 3: Group by brand and compute average close
  const avgCloseByBrand = Array.from(
    d3.rollup(industryPeers, v => d3.mean(v, d => +d.Close), d => d.Brand_Name)
  );

  // Step 4: Sort and pick top 5 peers + selected brand
  const topPeers = avgCloseByBrand
    .filter(([brand]) => brand !== selectedBrand)
    .sort((a, b) => d3.descending(a[1], b[1]))
    .slice(0, 5);

  // Include the selected brand in the list
  const brandAvg = avgCloseByBrand.find(([brand]) => brand === selectedBrand);
  if (brandAvg) topPeers.push(brandAvg);

  const width = 600;
  const height = 400;
  const margin = { top: 70, right: 30, bottom: 80, left: 180 }; // Increased top margin for title

  // Clear previous
  d3.select("#industryComparisonChart").html("");

  // Chart title (above graph)
  d3.select("#industryComparisonChart")
    .append("div")
    .style("text-align", "center")
    .style("margin-bottom", "10px")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("color", "#00bcd4")
    .text(`Industry Comparison: ${industry}`);

  const svg = d3.select("#industryComparisonChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const y = d3.scaleBand()
    .domain(topPeers.map(d => d[0]))
    .range([margin.top, height - margin.bottom])
    .padding(0.3);

  const x = d3.scaleLinear()
    .domain([0, d3.max(topPeers, d => d[1])])
    .range([margin.left - 50, width - margin.right]);

  // Tooltip
  const tooltip = d3.select("#industryComparisonChart")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0,0,0,0.75)")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).ticks(5));

  svg.append("g")
    .attr("transform", `translate(${margin.left - 50}, 0)`)
    .call(d3.axisLeft(y));

  // Bars
  svg.selectAll("rect")
    .data(topPeers)
    .join("rect")
    .attr("x", margin.left - 50)
    .attr("y", d => y(d[0]))
    .attr("width", d => x(d[1]) - margin.left)
    .attr("height", y.bandwidth())
    .attr("fill", d => d[0] === selectedBrand ? "#00bcd4" : "#007c91")
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
      d3.select(this).attr("fill", d => d[0] === selectedBrand ? "#00bcd4" : "#007c91");
      tooltip.style("opacity", 0);
    });

  // Labels
  svg.selectAll("text.label")
    .data(topPeers)
    .join("text")
    .attr("class", "label")
    .attr("x", d => x(d[1]) - 45)
    .attr("y", d => y(d[0]) + y.bandwidth() / 2 + 4)
    .text(d => d3.format(".2f")(d[1]))
    .attr("fill", "#000");

  // X-axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 65)
    .attr("text-anchor", "middle")
    .style("fill", "#e0e0e0")
    .style("font-size", "12px")
    .text("Average Close Price (USD)");

  // Y-axis label
  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", 10)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("fill", "#e0e0e0")
    .style("font-size", "12px")
    .text("Brand");
}