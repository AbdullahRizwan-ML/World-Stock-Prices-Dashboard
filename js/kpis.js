export function renderKPIs(data) {
  const totalVolume = d3.sum(data, d => +d.Volume);
  const avgClose = d3.mean(data, d => +d.Close);
  const uniqueBrands = new Set(data.map(d => d.Brand_Name)).size;

  const kpiContainer = d3.select("#kpis");

  const kpis = [
    { label: "Total Volume", value: totalVolume.toLocaleString() },
    { label: "Average Close Price", value: `$${avgClose.toFixed(2)}` },
    { label: "Total Brands", value: uniqueBrands }
  ];

  kpiContainer.selectAll(".kpi-box")
    .data(kpis)
    .join("div")
    .attr("class", "kpi-box")
    .html(d => `<h3>${d.label}</h3><p>${d.value}</p>`);
}
