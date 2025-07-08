export function renderFilters(data) {
  const uniqueBrands = [...new Set(data.map(d => d.Brand_Name))];

  const filterContainer = d3.select("#filters");
  filterContainer.html(""); // Clear any existing filters

  filterContainer.append("label")
    .attr("for", "brandFilter")
    .style("font-weight", "bold")
    .text("Select Brand: ");

  const select = filterContainer.append("select")
    .attr("id", "brandFilter")
    .style("padding", "5px")
    .style("font-size", "14px");

  select.selectAll("option")
    .data(["All", ...uniqueBrands])
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // Dispatch custom event on change
  select.on("change", function () {
    const selected = this.value;
    window.dispatchEvent(new CustomEvent("brandChanged", { detail: selected }));
  });
}
