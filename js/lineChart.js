export function drawLineChart(data) {
  const container = d3.select("#lineChart");
  container.html(""); // Clear existing SVG

  // Chart title (above filters)
  container.append("div")
    .style("text-align", "center")
    .style("margin-bottom", "10px")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("color", "#00bcd4")
    .text("Closing Price Over Time");

  // Create filter dropdown
  const brands = [...new Set(data.map(d => d.Brand_Name))];

  const filterDiv = container.append("div").style("margin-bottom", "10px");
  filterDiv.append("label").text("Select Brand: ");
  const brandSelect = filterDiv.append("select").attr("id", "lineBrandFilter");

  brandSelect.selectAll("option")
    .data(brands)
    .join("option")
    .attr("value", d => d)
    .text(d => d);
    

  // Set default brand
  const defaultBrand = brands[0];

  // Chart dimensions (enlarged)
  const width = 600, height = 400;
  const margin = { top: 50, right: 30, bottom: 90, left: 80 }; // Adjusted margins for larger chart

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const parseDate = d3.utcParse("%Y-%m-%d %H:%M:%S%Z");

  data.forEach(d => {
    d.date = parseDate(d.Date);
    d.Close = +d.Close;
  });

  function updateChart(selectedBrand) {
    const brandData = data
      .filter(d => d.Brand_Name === selectedBrand && d.date && !isNaN(d.Close))
      .sort((a, b) => d3.ascending(a.date, b.date));

    if (brandData.length === 0) return;

    const x = d3.scaleTime()
      .domain(d3.extent(brandData, d => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(brandData, d => d.Close)]).nice()
      .range([height - margin.bottom, margin.top]);

    svg.selectAll("*").remove(); // Clear previous chart

    // X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(6));

    // X-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom + 50)
      .attr("text-anchor", "middle")
      .style("fill", "#e0e0e0")
      .style("font-size", "12px")
      .text("Date");

    // Y-axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Y-axis label
    svg.append("text")
      .attr("x", -height / 2)
      .attr("y", margin.left / 2)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("fill", "#e0e0e0")
      .style("font-size", "12px")
      .text("Price");

    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.Close));

    // Line path without highlight on hover
    const path = svg.append("path")
      .datum(brandData)
      .attr("fill", "none")
      .attr("stroke", "#00bcd4")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Tooltip group for hover
    const tooltip = svg.append("g")
      .attr("class", "tooltip")
      .style("display", "none");

    tooltip.append("circle")
      .attr("r", 5)
      .attr("fill", "#ff9800");

    tooltip.append("text")
      .attr("dy", "-1em")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff");

    // Hover functionality (only show tooltip)
    svg.on("mousemove", function(event) {
      const [xCoord] = d3.pointer(event, this);
      const xValue = x.invert(xCoord);
      const bisectDate = d3.bisector(d => d.date).left;
      const idx = bisectDate(brandData, xValue, 1);
      const d0 = brandData[idx - 1];
      const d1 = brandData[idx] || d0;
      const d = xValue - (d0?.date || d1.date) > (d1.date - xValue) ? d1 : d0;

      if (d) {
        tooltip.style("display", null);
        tooltip.attr("transform", `translate(${x(d.date)}, ${y(d.Close)})`);
        tooltip.select("text").text(`$${d3.format(".2f")(d.Close)}`);
      }
    })
    .on("mouseout", () => tooltip.style("display", "none"));

    // Remove highlight on hover
    path.on("mouseover", null)
      .on("mouseout", null);
  }

  updateChart(defaultBrand);

  brandSelect.on("change", function () {
    updateChart(this.value);
  });
}

/*

export function drawLineChart(data) {
  const container = d3.select("#lineChart");
  container.html(""); // Clear existing SVG

  console.log("Initializing Line Chart...");

  // Chart title (above filters)
  container.append("div")
    .style("text-align", "center")
    .style("margin-bottom", "10px")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("color", "#00bcd4")
    .text("Closing Price Over Time");

  // Create filter dropdown
  const brands = [...new Set(data.map(d => d.Brand_Name))];
  console.log("Brands detected:", brands);

  const filterDiv = container.append("div").style("margin-bottom", "10px");
  filterDiv.append("label").text("Select Brand: ");
  const brandSelect = filterDiv.append("select").attr("id", "lineBrandFilter");

  brandSelect.selectAll("option")
    .data(brands)
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // Set default brand
  const defaultBrand = brands[0];

  // Chart dimensions
  const width = 600, height = 400;
  const margin = { top: 50, right: 30, bottom: 90, left: 80 };

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const parseDate = d3.utcParse("%Y-%m-%d %H:%M:%S%Z");

  data.forEach(d => {
    d.date = parseDate(d.Date);
    d.Close = +d.Close;
    if (!d.date || isNaN(d.Close)) console.warn("Invalid date or Close for:", d);
  });

  // Initialize scales with default values
  let x = d3.scaleTime()
    .domain([new Date(), new Date()]) // Default to a single point
    .range([margin.left, width - margin.right]);

  let y = d3.scaleLinear()
    .domain([0, 1]) // Default domain
    .range([height - margin.bottom, margin.top]);

  let currentData = [];

  // Define line function outside updateChart
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.Close));

  let tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");

  tooltip.append("circle").attr("r", 5).attr("fill", "#ff9800");
  tooltip.append("text").attr("dy", "-1em").attr("text-anchor", "middle").attr("fill", "#fff");

  function updateChart(selectedBrand) {
    console.log("Updating chart for brand:", selectedBrand);
    currentData = data
      .filter(d => d.Brand_Name === selectedBrand && d.date && !isNaN(d.Close))
      .sort((a, b) => d3.ascending(a.date, b.date));

    if (currentData.length === 0) {
      console.warn("No valid data for brand:", selectedBrand);
      return;
    }

    // Handle single date case
    const dates = currentData.map(d => d.date);
    const isSingleDate = new Set(dates).size === 1;
    console.log("Single date detected:", isSingleDate);

    x.domain(isSingleDate ? [d3.min(dates), d3.max(dates)] : d3.extent(dates));
    y.domain([0, d3.max(currentData, d => d.Close)]).nice();

    // Update only chart elements
    svg.selectAll(".chart-elements").remove();

    // X-axis
    svg.append("g")
      .attr("class", "x-axis chart-elements")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(isSingleDate ? 1 : 6));

    // X-axis label
    svg.append("text")
      .attr("class", "chart-elements")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom + 50)
      .attr("text-anchor", "middle")
      .style("fill", "#e0e0e0")
      .style("font-size", "12px")
      .text("Date");

    // Y-axis
    svg.append("g")
      .attr("class", "y-axis chart-elements")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Y-axis label
    svg.append("text")
      .attr("class", "chart-elements")
      .attr("x", -height / 2)
      .attr("y", margin.left / 2)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("fill", "#e0e0e0")
      .style("font-size", "12px")
      .text("Price");

    // Line path
    svg.append("path")
      .datum(currentData)
      .attr("class", "line-path chart-elements")
      .attr("fill", "none")
      .attr("stroke", "#00bcd4")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Initialize or reapply zoom after data is set
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
      .on("zoom", (event) => {
        if (!currentData || currentData.length === 0) return;
        const t = event.transform;
        x.range([margin.left, width - margin.right].map(d => t.applyX(d)));
        y.range([height - margin.bottom, margin.top].map(d => t.applyY(d)));

        svg.select(".x-axis").call(d3.axisBottom(x).ticks(isSingleDate ? 1 : 6));
        svg.select(".y-axis").call(d3.axisLeft(y));
        svg.select(".line-path").attr("d", line);
        
        // Update tooltip on zoom (optional, handled by mousemove)
      });

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    // Reattach hover functionality
    svg.on("mousemove", function(event) {
      const [xCoord] = d3.pointer(event, this);
      const xValue = x.invert(xCoord);
      const bisectDate = d3.bisector(d => d.date).left;
      const idx = bisectDate(currentData, xValue, 1);
      const d0 = currentData[idx - 1];
      const d1 = currentData[idx] || d0;
      const d = xValue - (d0?.date || d1.date) > (d1.date - xValue) ? d1 : d0;

      if (d) {
        tooltip.style("display", null);
        tooltip.attr("transform", `translate(${x(d.date)}, ${y(d.Close)})`);
        tooltip.select("text").text(`$${d3.format(".2f")(d.Close)}`);
      } else {
        tooltip.style("display", "none");
      }
    })
    .on("mouseout", () => tooltip.style("display", "none"));

    // Reset zoom on double-click
    svg.on("dblclick", () => {
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    });
  }

  updateChart(defaultBrand);

  brandSelect.on("change", function () {
    updateChart(this.value);
  });
}

*/