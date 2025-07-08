export function drawCountryDistribution(data) {
  const countries = Array.from(d3.rollup(data, v => v.length, d => d.Country))
    .sort((a, b) => d3.descending(a[1], b[1]));

  const width = 600;
  const height = 400;
  const margin = { top: 60, right: 30, bottom: 100, left: 80 };

  const svg = d3.select("#countryDistribution")
    .html("") // Clear previous content
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(countries.map(d => d[0]))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(countries, d => d[1])])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // X Axis Label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom + 70)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Country");

  // Y Axis
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Y Axis Label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Number of Records");

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", "#00bcd4")
    .text("Country-wise Record Distribution");

  // Tooltip
  const tooltip = d3.select("#countryDistribution")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Bars with interactivity
  svg.selectAll("rect")
    .data(countries)
    .join("rect")
    .attr("x", d => x(d[0]))
    .attr("y", d => y(d[1]))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(d[1]))
    .attr("fill", "#00bcd4")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("fill", "#007c91");
      tooltip.style("opacity", 1).html(`<strong>${d[0]}</strong><br/>Records: ${d[1]}`);
    })
    .on("mousemove", function (event) {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("fill", "#00bcd4");
      tooltip.style("opacity", 0);
    });
}
