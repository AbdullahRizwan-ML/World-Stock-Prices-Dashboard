# 🌍 World Stock Prices Dashboard

An interactive D3.js-powered dashboard to explore stock data of global brands by filtering and visualizing key metrics like price, volume, and industry distribution. Built for usability, clarity, and visual insight.

## 📁 Folder Structure

World-Stock-Prices-Dashboard/
├── data/
│ └── World-Stock-Prices-Dataset.csv
├── js/
│ ├── kpis.js
│ ├── filters.js
│ ├── lineChart.js
│ ├── barChart.js
│ ├── pieChart.js
│ ├── volumeChart.js
│ ├── countryDistribution.js
│ ├── candlestickChart.js
│ ├── industryComparisonChart.js
│ └── radarChart.js
├── style.css
└── index.html


## 🚀 How to Run the Application

1. Clone or download the project folder.

2. Ensure the folder structure remains the same.

3. Due to browser restrictions on reading local files, run the dashboard using a local server.
   For Python 3.x:

   cd World-Stock-Prices-Dashboard
   python -m http.server 8000

4. Open your browser and visit:
   
   http://localhost:8000

   The dashboard will load with interactive features enabled.

## 🧩 Features

* Brand filter dropdown for dynamic updates
* Interactive Charts:

  * 📈 Line Chart (Price over Time)
  * 🕯️ Candlestick Chart (OHLC view)
  * 🥧 Pie Chart (Industry Tag Share)
  * 📊 Volume Bar Chart (Top Brands)
  * 🌎 Country Distribution Chart
  * ⚖️ Industry Comparison Chart
* Tooltips and hover interactivity
* Clean modular code with separate JS files per chart

## 🛠️ Tech Stack

* HTML5 & CSS3
* JavaScript ES6+
* D3.js v7

## ✨ Design Goals

* Visual consistency using a custom teal color palette
* Modular and reusable code
* Effective use of marks and channels
* Responsive and intuitive interaction flow

