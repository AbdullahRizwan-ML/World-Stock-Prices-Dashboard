export function drawCandlestickChart(data, brand) {
  const container = d3.select("#candlestickChart");
  container.html(""); // Clear existing content

  // Chart title
  container.append("div")
    .style("text-align", "center")
    .style("margin-bottom", "10px")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("color", "#00bcd4")
    .text(`Candlestick Chart – ${brand} OHLC`);

  const filterDiv = container.append("div").style("margin-bottom", "10px");

  const parseDate = d3.timeParse("%Y-%m-%d");
  data.forEach(d => {
    d.parsedDate = parseDate(d.Date.split(" ")[0]);
    d.Open = +d.Open;
    d.High = +d.High;
    d.Low = +d.Low;
    d.Close = +d.Close;
  });

  const uniqueYears = [...new Set(data.map(d => d.parsedDate.getFullYear()))].sort();
  const allMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  filterDiv.append("label").text("Select Year: ").style("margin-right", "10px");
  const yearSelect = filterDiv.append("select").attr("id", "yearFilter");

  yearSelect.selectAll("option")
    .data(uniqueYears)
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  filterDiv.append("label").text("   Select Month: ").style("margin-right", "10px");
  const monthSelect = filterDiv.append("select").attr("id", "monthFilter");

  function updateMonthOptions(selectedYear) {
    const filteredDates = data.filter(d => d.parsedDate.getFullYear() === +selectedYear);
    const uniqueMonths = [...new Set(filteredDates.map(d => d.parsedDate.getMonth()))]
      .map(m => allMonths[m])
      .sort((a, b) => allMonths.indexOf(a) - allMonths.indexOf(b));
    monthSelect.selectAll("option")
      .data(uniqueMonths.length ? uniqueMonths : ["No Data"])
      .join("option")
      .attr("value", d => d)
      .text(d => d);
    monthSelect.property("value", uniqueMonths.length ? uniqueMonths[0] : "No Data");
  }

  const defaultYear = uniqueYears[0];
  updateMonthOptions(defaultYear);
  yearSelect.property("value", defaultYear);

  const margin = { top: 30, right: 80, bottom: 120, left: 80 };
  const width = 700 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom - 20;

  const svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("overflow", "visible")
    .append("g")
    .attr("transform", `translate(45, ${margin.top})`);

  const tooltip = container.append("div")
    .style("position", "absolute")
    .style("background", "#000")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  function updateChart(year, month) {
    const filteredData = data.filter(d => {
      if (!d.parsedDate) return false;
      const dataYear = d.parsedDate.getFullYear();
      const dataMonth = allMonths[d.parsedDate.getMonth()];
      return dataYear === +year && dataMonth === month;
    }).sort((a, b) => d3.ascending(a.parsedDate, b.parsedDate));

    svg.selectAll("*").remove();

    if (filteredData.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#e0e0e0")
        .style("font-size", "14px")
        .text("No data available for selected year and month");
      return;
    }

    const uniqueDates = [...new Set(filteredData.map(d => d.parsedDate))];

    const x = d3.scaleBand()
      .domain(filteredData.map(d => d.parsedDate))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([
        d3.min(filteredData, d => d.Low) || 0,
        d3.max(filteredData, d => d.High) || 100
      ])
      .nice()
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x)
        .tickValues(uniqueDates.length > 10 ? uniqueDates.filter((d, i) => i % Math.ceil(uniqueDates.length / 10) === 0) : uniqueDates)
        .tickFormat(d3.timeFormat("%d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "9px");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .style("fill", "#e0e0e0")
      .style("font-size", "12px")
      .text("Date");

    svg.append("g").call(d3.axisLeft(y));

    svg.append("text")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 30)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("fill", "#e0e0e0")
      .style("font-size", "12px")
      .text("Price");

    svg.selectAll("line.stem")
      .data(filteredData)
      .join("line")
      .attr("class", "stem")
      .attr("x1", d => x(d.parsedDate) + x.bandwidth() / 2)
      .attr("x2", d => x(d.parsedDate) + x.bandwidth() / 2)
      .attr("y1", d => y(d.High))
      .attr("y2", d => y(d.Low))
      .attr("stroke", "#999");

    svg.selectAll("rect.candle")
      .data(filteredData)
      .join("rect")
      .attr("class", "candle")
      .attr("x", d => x(d.parsedDate))
      .attr("y", d => y(Math.max(d.Open, d.Close)))
      .attr("width", x.bandwidth())
      .attr("height", d => Math.abs(y(d.Open) - y(d.Close)))
      .attr("fill", d => d.Close > d.Open ? "#00bcd4" : "#f44336")
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip.html(
            `<strong>${d3.timeFormat("%Y-%m-%d")(d.parsedDate)}</strong><br>
            Open: ${d.Open.toFixed(1)}<br>
            High: ${d.High.toFixed(1)}<br>
            Low: ${d.Low.toFixed(1)}<br>
            Close: ${d.Close.toFixed(1)}`
        );
        })

      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 40 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(150).style("opacity", 0);
      });
  }

  updateChart(defaultYear, monthSelect.property("value"));

  yearSelect.on("change", function () {
    updateMonthOptions(this.value);
    updateChart(this.value, monthSelect.property("value"));
  });

  monthSelect.on("change", function () {
    updateChart(yearSelect.property("value"), this.value);
  });
}
