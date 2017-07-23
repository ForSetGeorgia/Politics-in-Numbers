  function bar_chart(elem, resource, bg, width) {
    // console.log("chart", elem, resource);
    console.log(width)
    var ln = 0;
    resource.series.forEach(function (d) { ln += Math.round(d[0].length/15)+1; });
    js.share[elem] = encodeURI(resource.orig_title + "( " + resource.subtitle + " )" + " | " + gon.app_name_long);
    // console.log(view_content, w > 992 ? Math.floor((view_content.width()-386)/2) : w - 12)
    $(elem).highcharts({
      chart: {
          type: 'bar',
          backgroundColor: bg,
          height: 60*(Math.round(resource.title.length/40)+1) + ln*24,
          width: width
          // width: w > 992 ? Math.floor((view_content.width()-386)/2) : w - 12//,
          // events: {
          //   load: function () {
          //     var tls = $(this.container).find(".highcharts-xaxis-labels text title");
          //     tls.each(function (tl) {
          //       tl = $(tl);
          //       tl.parent().attr("data-retitle", tl.text());
          //       tl.remove();
          //     });
          //   }
          // }
      },
      exporting: {
        buttons: {
          contextButton: {
            enabled: false
          }
        },
        scale: 1//,
        // url: ""
      },
      title: {
        text: resource.title,
        style: {
          color: "#5d675b",
          fontSize:"18px",
          fontFamily: "firasans_r",
          textShadow: 'none'
        },
        useHTML: true
      },
      subtitle: {
        text: resource.subtitle,
        style: {
          color: "#5d675b",
          fontSize:"12px",
          fontFamily: "firasans_book",
          textShadow: 'none'
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
            textShadow: 'none',
            textOverflow: "none"
          },
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
            },
            formatter: function () {
              var tmp = Highcharts.numberFormat(this.y);
              if(tmp.indexOf(decPoint) !== -1) {
                tmp = tmp.trimr("0").trimr(decPoint);
              }
              return tmp == "0" ? gon.na : tmp;
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
          var tmp = Highcharts.numberFormat(this.y);
          if(tmp.indexOf(decPoint) !== -1) {
            tmp = tmp.trimr("0").trimr(decPoint);
          }
          return "<b>" + this.key + "</b>: " + (tmp == "0" ? gon.na : tmp);
        }
      }
    });
  }
  function grouped_advanced_column_chart (elem, resource, bg, width) {
    // console.log("fca", resource);
    var cat_max_len = 0,
      groupedOptions = [],
      groupedOptionsRotation = 0;
    if(resource.categories.length && resource.categories[0].hasOwnProperty("categories") && resource.categories[0].categories.length > 1) {
      resource.categories[0].categories.forEach(function (d, i) {
        resource.categories[0].categories[i] = " " + d;
        if(cat_max_len < d.length) {
          cat_max_len = d.length;
        }
      });
      groupedOptions = [{ rotation: 0 }, { rotation: -90 }];
      groupedOptionsRotation = -90;
    }
    js.share[elem] = encodeURI(resource.orig_title + " | " + gon.app_name_long);
    $(elem).highcharts({
      chart: {
          type: 'column',
          backgroundColor: bg,
          height: 400 + cat_max_len*9,
          width: width
          // width: view_content.width()-28 // w > 992 ? Math.floor((view_content.width()-28)/2) :
      },
      exporting: {
        buttons: {
          contextButton: {
            enabled: false
          }
        },
        scale: 1
      },
      title: {
        text: resource.title,
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

        labels: {
          groupedOptions: groupedOptions,
          style: {
            color: "#5d675b",
            fontSize:"14px",
            fontFamily: "firasans_book",
            textShadow: 'none'
          },
          format: "⁣ {value}", // there is an invisible character infront of actual space https://unicode-table.com/en/2063/, to have space infront of text for rotated labels
          //useHTML: true,
          step:1,
          rotation:groupedOptionsRotation
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
            textShadow: 'none'
          }
        },
        opposite: true,
        style: {
          color: "#7F897D",
          fontSize:"12px",
          fontFamily: "firasans_r",
          textShadow: 'none'
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
            textShadow: 'none',
            fontWeight:'normal'
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
          textShadow: 'none',
          fontWeight:'normal'
        }
      }
    });
  }
  function init_highchart () {
    Highcharts.setOptions({
      lang: {
        numericSymbols: gon.numericSymbols,
        thousandsSep: ","
      },
      colors: [ "#D36135", "#DDCD37", "#5B85AA", "#F78E69", "#A69888", "#88D877", "#5D675B", "#A07F9F", "#549941", "#35617C", "#694966", "#B9C4B7"],
      credits: {
        enabled: true,
        href: gon.root_url,
        // position: undefined
        // style: undefined
        text: gon.app_name
      }
    });
    decPoint = Highcharts.getOptions().lang.decimalPoint;
    (function(H) { // for highchart to recognize maxPointWidth property
        var each = H.each;
        H.wrap(H.seriesTypes.column.prototype, 'drawPoints', function(proceed) {
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
