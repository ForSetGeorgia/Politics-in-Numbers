//= require highcharts
//= require js_dialog
//= require highlight_form


$(document).ready(function (){
  function bar_chart (chart, resource, bg, sid) {
    // console.log(resource, chart)
    chart.highcharts({
      chart: {
        type: "bar",
        backgroundColor: bg//,
        // height: "100%",
        // width: w > 992 ? (view_content.width()-386)/2 : w - 12,
        // events: {
        //   load: function () {
        //     var tls = $(".highcharts-xaxis-labels text title"),
        //       p = tls.parent();
        //     p.attr("data-retitle", tls.text());
        //     tls.remove();
        //   }
        // }
      },
      exporting: {
        buttons: {
          contextButton: {
            enabled: false
          }
        }
      },
      title: {
        text: '<a href="' + gon.explore_url + '/' + sid + '">' + resource.title + '</a>',
        style: {
          color: "#5d675b",
          fontSize:"18px",
          fontFamily: "firasans_r",
          textShadow: "none"
        },
        useHTML: true
      },
      subtitle: {
        text: resource.subtitle,
        style: {
          color: "#5d675b",
          fontSize:"12px",
          fontFamily: "firasans_book",
          textShadow: "none"
        }
      },
      xAxis: {
        type: "category",
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          style: {
            color: "#5d675b",
            fontSize:"14px",
            fontFamily: "firasans_book",
            textShadow: "none"
          }
          // ,
          // formatter: function(a,b,c) {
          //   return this.value + "<title>hello</title>";
          // }
        }
      },
      yAxis: { visible: false },
      legend: { enabled: false },
      plotOptions: {
        bar: {
          color:"#ffffff",
          dataLabels: {
            enabled: true,
            padding: 6,
            style: {
              color: "#5d675b",
              fontSize:"14px",
              fontFamily: "firasans_r",
              textShadow: "none"
            }
          },
          pointInterval:1,
          pointWidth:17,
          pointPadding: 0,
          groupPadding: 0,
          borderWidth: 0,
          shadow: false
        }
      },
      series: [{ data: resource.series }],
      tooltip: {
        backgroundColor: "#DCE0DC",
        followPointer: true,
        shadow: false,
        borderWidth:0,
        style: {
          color: "#5D675B",
          fontSize:"14px",
          fontFamily: "firasans_r",
          textShadow: "none",
          fontWeight:"normal"
        },
        formatter: function () {
          return "<b>" + this.key + "</b>: " + Highcharts.numberFormat(this.y);
        }
      }
    });
  }

  function grouped_advanced_column_chart (chart, resource, bg, sid) {
    var cat_ln = resource.categories.length

    var title = resource.title
    if(title.length > 100) {
      title = title.slice(0,100) + ' ...'
    }

    var title =
    chart.highcharts({
      chart: {
        type: "column",
        backgroundColor: bg
      },
      exporting: {
        buttons: {
          contextButton: {
            enabled: false
          }
        }
      },
      title: {
        text: '<a href="' + gon.explore_url + '/' + sid + '" title="' + resource.title + '">' + title + '</a>',
        margin: 40,
        style: {
          fontFamily:"firasans_r",
          fontSize:"18px",
          color: "#5d675b"
        },
        useHTML: true
      },
      xAxis: {
        type: "category",
        categories: resource.categories,
        gridLineColor: "#5D675B",
        gridLineWidth:1,
        gridLineDashStyle: "Dash",
        lineWidth: 1,
        lineColor: "#5D675B",
        tickWidth: 1,
        tickColor: "#5D675B",
        tickInterval: cat_ln > 8 ? 2 : 1,
        labels: {
          style: {
            color: "#5d675b",
            fontSize:"14px",
            fontFamily: "firasans_book",
            textShadow: "none"
          },
          //useHTML: true,
          step:1,
          rotation: cat_ln > 8 ? 45 : 0
        }
      },
      yAxis: [
        {
          title: {
            enabled: true,
            text: gon.lari,
            style: {
              color: "#7F897D",
              fontSize:"12px",
              fontFamily: "firasans_r",
              textShadow: "none"
            }
          },
          gridLineColor: "#eef0ee",
          gridLineWidth:1,
          style: {
            color: "#5d675b",
            fontSize:"14px",
            fontFamily: "firasans_book",
            textShadow: "none"
          }
        },
        {
          linkedTo:0,
          title: {
            enabled: true,
            text: gon.lari,
            style: {
              color: "#7F897D",
              fontSize:"12px",
              fontFamily: "firasans_r",
              textShadow: "none"
            }
          },
          opposite: true,
          style: {
            color: "#7F897D",
            fontSize:"12px",
            fontFamily: "firasans_r",
            textShadow: "none"
          }
        }
      ],
      legend: {
        enabled: true,
        symbolWidth:10,
        symbolHeight:10,
        shadow: false,
        itemStyle: {
          color: "#5d675b",
          fontSize:"14px",
          fontFamily: "firasans_book",
          textShadow: "none",
          fontWeight:"normal"
        }
      },
      plotOptions: {
        column:{
          maxPointWidth: 40
        }
      },
      series: resource.series,
      tooltip: {
        backgroundColor: "#DCE0DC",
        followPointer: true,
        shadow: false,
        borderWidth:0,
        style: {
          color: "#5D675B",
          fontSize:"14px",
          fontFamily: "firasans_r",
          textShadow: "none",
          fontWeight:"normal"
        }
      }
    });
  }

  function build_chart () {
    // chart.addClass("loader");
    var data = gon.highlights_data
    var chart
    if(data.length) {
      data.forEach(function (d) {
        chart = $('.highlight-item[data-id="' + d.sid + d.tp + '"] .chart')
        if(d.is_donation) {
          if(d.tp === "a" || d.tp === "b") {
            bar_chart(chart, d.chart["c" + d.tp], (d.tp === "a" ? "#EBE187" : "#B8E8AD"), d.sid);
          }
        }
        else {
          if(d.tp === "a") {
            grouped_advanced_column_chart(chart, d.chart.ca, "#fff", d.sid);
          }
        }
      })

    }
    // chart.removeClass("loader");
  }

  function init_highchart () {
    Highcharts.setOptions({
      lang: {
        numericSymbols: gon.numericSymbols,
        thousandsSep: ","
      },
      colors: [ "#D36135", "#DDCD37", "#5B85AA", "#F78E69", "#A69888", "#88D877", "#5D675B", "#A07F9F", "#549941", "#35617C", "#694966", "#B9C4B7"],
      credits: {
        enabled: false
      }
    });
    (function(H) { // for highchart to recognize maxPointWidth property
        var each = H.each;
        H.wrap(H.seriesTypes.column.prototype, "drawPoints", function(proceed) {
            var series = this;
            if(series.data.length > 0 ){
                var width = series.barW > series.options.maxPointWidth ? series.options.maxPointWidth : series.barW;
                each(this.data, function(point) {
                    point.shapeArgs.x += (point.shapeArgs.width - width) / 2;
                    point.shapeArgs.width = width;
                });
            }
            proceed.call(this);
        })
    })(Highcharts);
  }

  (function init () {
    init_highchart();


    $(document).on("click", "[data-dialog]", function () {
      js_dialog.open('highlights', { hid: $(this).attr("data-id") });
    });

    build_chart();
  })();
});

