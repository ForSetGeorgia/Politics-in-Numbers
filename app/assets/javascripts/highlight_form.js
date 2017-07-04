//= require twitter/bootstrap/tab
var global_filter_callback = function (sid, partial) {
  // console.log(sid, partial)
  if (partial === 'finance') {
    var ca = js.cache[js.cache[sid]].ca.highlight !== null

    $('.pane[data-type="finance"] [data-dialog="highlight;a"]')
      .attr('title', ca ? gon.labels.update_or_unhighlight : gon.labels.highlight)
      .attr('data-id', sid+'a').toggleClass('highlighted', ca)

  } else if (partial === 'donation') {

    var ca = js.cache[js.cache[sid]].ca.highlight !== null
    var cb = js.cache[js.cache[sid]].cb.highlight !== null

    $('.pane[data-type="donation"] [data-dialog="highlight;a"]')
      .attr('title', ca ? gon.labels.update_or_unhighlight : gon.labels.highlight)
      .attr('data-id', sid+'a').toggleClass('highlighted', ca)

    $('.pane[data-type="donation"] [data-dialog="highlight;b"]')
      .attr('title', cb ? gon.labels.update_or_unhighlight : gon.labels.highlight)
      .attr('data-id', sid+'b').toggleClass('highlighted', cb)

  }
}

js_dialog.callbacks.highlight = {
  open: function (option) {
    var cont = $('dialog [data-type="highlight"]')
    var hlts = js.cache[js.cache[js.sid]]['c' + option.chart_type].highlight
    var unhighlight = cont.find('button[data-type="unhighlight"]')
    cont.find('button[data-type]').attr('data-chart', option.chart_type)
    var present = hlts !== null
    gon.locales.forEach(function (d) {
      cont.find('textarea[name="description_translations[' + d + ']"]').val(present ? hlts[d] : null)
    })
    unhighlight.toggle(present)
  },
  bind: function () {
    var dialog = $('dialog [data-type="highlight"]')

    dialog.find(".button button[data-type='save']").click(function () {
      // console.log('click unhighlight')
      var chart_type = $(this).attr('data-chart')
      var descriptions = {}
      gon.locales.forEach(function (d) {
        descriptions[d] = dialog.find('textarea[name="description_translations[' + d + ']"]').val()
      })
      $.ajax({
        url: gon.highlight_url,
        type: 'POST',
        dataType: "json",
        data: {
          highlight: {
            base_id: js.sid + chart_type,
            description_translations: descriptions
          }
        },
        success: function (data) {
          // console.log(data)
          var success = data.success
          flash(data.message, success ? 'success' : 'danger')
          if(success) {
            js.cache[js.cache[js.sid]]["c" + chart_type].highlight = descriptions
          }
          $('.highlight[data-id="' + js.sid + chart_type + '"]')
            .attr('title', success ? gon.labels.update_or_unhighlight : gon.labels.highlight)
            .toggleClass('highlighted', success)
        },
        complete: function () {
          js_dialog.close();
        }
      });
    });

    dialog.find(".button button[data-type='unhighlight']").click(function () {
      var chart_type = $(this).attr('data-chart')
      $.ajax({
        url: gon.highlight_url + '/' + js.sid + chart_type,
        type: 'DELETE',
        dataType: "json",
        success: function (data) {
          var success = data.success
          flash(data.message, success ? 'success' : 'danger')

          // console.log('destroy', data)
          // console.log(js.sid, chart_type, js.cache[js.cache[js.sid]]["c" + chart_type])
          js.cache[js.cache[js.sid]]["c" + chart_type].highlight = null
          $('.highlight[data-id="' + js.sid + chart_type + '"]').attr('title', success ? gon.labels.highlight : gon.labels.update_or_unhighlight).toggleClass('highlighted', !success)
        },
        complete: function () {
          js_dialog.close();
        }
      });
    });
  }
}
js_dialog.callbacks.highlights = {
  open: function (option) {
    var cont = $('dialog [data-type="highlights"]')
    var hid = option.hid
    var sid = hid.slice(0, -1);
    var tp = hid.slice(hid.length-1, hid.length);
    var hlts = gon.highlights_data.filter(function(f) {
      return f.sid === sid && f.tp === tp
    })[0].description
    var unhighlight = cont.find('button[data-type="unhighlight"]')
    var present = hlts !== null
    cont.find('button[data-type]').attr('data-hid', hid)
    gon.locales.forEach(function (d) {
      cont.find('textarea[name="description_translations[' + d + ']"]').val(present ? hlts[d] : null)
    })
    unhighlight.toggle(present)
  },
  bind: function () {
    var dialog = $('dialog [data-type="highlights"]')
    dialog.find(".button button[data-type='save']").click(function () {

      var hid = $(this).attr('data-hid')
      var sid = hid.slice(0, -1);
      var chart_type = hid.slice(hid.length-1, hid.length);

      var descriptions = {}
      gon.locales.forEach(function (d) {
        descriptions[d] = dialog.find('textarea[name="description_translations[' + d + ']"]').val()
      })
      $.ajax({
        url: gon.highlight_url,
        type: 'POST',
        dataType: "json",
        data: {
          highlight: {
            base_id: hid,
            description_translations: descriptions
          }
        },
        success: function (data) {
          // console.log(data)
          var success = data.success
          flash(data.message, success ? 'success' : 'danger')
          if(success) {
            // console.log( gon.highlights_data.filter(function(f) {
            //       return f.sid === sid && f.tp === chart_type
            //     })[0])
            gon.highlights_data.filter(function(f) {
                  return f.sid === sid && f.tp === chart_type
                })[0].description = descriptions

          }
          $('.highlight[data-id="' + hid + '"]')
            .attr('title', success ? gon.labels.update_or_unhighlight : gon.labels.highlight)
            .toggleClass('highlighted', success)
        },
        complete: function () {
          js_dialog.close();
        }
      });
    });

    dialog.find(".button button[data-type='unhighlight']").click(function () {
      var hid = $(this).attr('data-hid')
      var sid = hid.slice(0, -1);
      var chart_type = hid.slice(hid.length-1, hid.length);
      // console.log(hid, sid, chart_type)
      $.ajax({
        url: gon.highlight_url + '/' + hid,
        type: 'DELETE',
        dataType: "json",
        success: function (data) {
          var success = data.success
          flash(data.message, success ? 'success' : 'danger')
          // console.log(data, gon.highlights_data)
          gon.highlights_data.filter(function(f) {
                return f.sid === sid && f.tp === chart_type
              })[0].description = null


          $('.highlight[data-id="' + hid + '"]')
            .attr('title', success ? gon.labels.highlight : gon.labels.update_or_unhighlight)
            .toggleClass('highlighted', !success)
        },
        complete: function () {
          js_dialog.close();
        }
      });
    });
  }
}
