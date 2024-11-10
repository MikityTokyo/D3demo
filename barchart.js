// ------------------------------------------------------------------
//	棒グラフを書く処理　by teltel
// ------------------------------------------------------------------

function load_bar_chart (selector)
{
    var file_json="assets/data1.json";
    var selectedValue = "data1";
    var maxdomain = 470000;

    console.log(selector);

  //他のプルダウンは下に戻す
    switch (selector){
      case 1:
        selectedValue = document.getElementById('dataSelect1').value;
        document.getElementById('dataSelect1').style.backgroundColor = 'lightblue';
        document.getElementById('dataSelect2').style.backgroundColor = 'white';
        document.getElementById('dataSelect3').style.backgroundColor = 'white';
        document.getElementById("dataSelect2").value = "data2";
        document.getElementById("dataSelect3").value = "data3";
        maxdomain = 470000;
        break;
      case 2:
        selectedValue = document.getElementById('dataSelect2').value;
        document.getElementById('dataSelect1').style.backgroundColor = 'white';
        document.getElementById('dataSelect2').style.backgroundColor = 'lightblue';
        document.getElementById('dataSelect3').style.backgroundColor = 'white';
        document.getElementById("dataSelect1").value = "data1";
        document.getElementById("dataSelect3").value = "data3";
        maxdomain = 470000;
        break;
      case 3:
        selectedValue = document.getElementById('dataSelect3').value;
        document.getElementById('dataSelect1').style.backgroundColor = 'white';
        document.getElementById('dataSelect2').style.backgroundColor = 'white';
        document.getElementById('dataSelect3').style.backgroundColor = 'lightblue';
        document.getElementById("dataSelect1").value = "data1";
        document.getElementById("dataSelect2").value = "data2";
        maxdomain = 240000;
        break;
      default:
    }

    file_json = "assets/" + selectedValue + ".json";
    console.log(file_json);

    jQuery.getJSON(file_json,function (data_org)
	{
        write_bar_chart(data_org,maxdomain);
	});
}

// ------------------------------------------------------------------
function write_bar_chart (data_org,maxdomain)
{

// 既存のSVG要素を削除
d3.select("#ChartArea").select("svg").remove();

//上位15位まで表示
const data = data_org.slice(-15);

// set the dimensions and margins of the graph
const margin = {top: 20, right: 20, bottom: 30, left: 40};
const width = Math.min(450, window.innerWidth - 60) - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// set the ranges
const y = d3.scaleBand()
          .range([height, 0])
          .padding(0.1);

const x = d3.scaleLinear()
          .range([0, width]);
          
// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#ChartArea").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  // format the data
  data.forEach(function(d) {
    d.emptyhouse = +d.emptyhouse;
  });

  // Scale the range of the data in the domains
  x.domain([0, maxdomain]); //固定
  y.domain(data.map(function(d) { return d.locationName; }));

  // グラデーションの定義
  var gradient = svg.append("defs")
  .append("linearGradient")
  .attr("id", "barGradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")//水平方向のグラデーション
  .attr("y2", "0%"); 

   // グラデーションの色と位置を設定
   gradient.append("stop")
   .attr("offset", "0%")
   .attr("stop-color", "steelblue");  // 開始色
   gradient.append("stop")
   .attr("offset", "100%")
   .attr("stop-color", "lightblue");  // 終了色

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
  .data(data)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", 0)  // xの位置（グラフの左端に設定）
  .attr("y", function(d) { return y(d.locationName); })  // yの位置
  .attr("width", 0)  // 初期の幅を0に設定
  .attr("height", y.bandwidth())  // 最終的な高さを設定
  .attr("fill", "url(#barGradient)")  // グラデーションを適用
  .transition()  // アニメーションを開始
  .duration(500)  // 500ミリ秒かけて変化
  .attr("width", function(d) { return x(d.emptyhouse); })  // 最終的な幅を設定
  .on("end", function(d, i) {
    // 各バーのアニメーションが終わったらラベルを追加
    if (i === data.length - 1) {
      // 全てのバーのアニメーションが終了したらラベルを表示する
svg.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", function(d) { return x(d.emptyhouse) + 5; }) 
        .attr("y", function(d) { return y(d.locationName) + y.bandwidth() / 2; }) 
        .attr("dy", ".35em") 
        .text(function(d) { return d3.format(",.0f")(d.emptyhouse); })
        .attr("text-anchor", function(d) {
            // ラベルの幅を取得
            const labelWidth = this.getComputedTextLength(); 
            // バーの幅を取得
            const barWidth = x(d.emptyhouse); 
            
            // ラベルがチャートの幅を超える場合、右寄せにする
            if (labelWidth + barWidth + 10 > width) { 
                return "end";
            } else {
                return "start";
            }
        })
        .attr("dx", function(d) {
            // ラベルの位置を微調整
            const labelWidth = this.getComputedTextLength();
            const barWidth = x(d.emptyhouse); 
            
            // 右寄せの場合、少し左にずらす
            if (labelWidth + barWidth + 10 > width) {
                return -5; 
            } else {
                // 左寄せの場合、少し右にずらす
                return 5;  
            }
        });

    }
  });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(5));

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));
}