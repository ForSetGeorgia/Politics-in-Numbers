//= require twitter/bootstrap/tab
var global_filter_callback = function (sid, partial) {
  console.log(sid, partial)
  var h, ca, cb
  if (partial === 'finance') {
    h = js.cache[js.cache[sid]].ca.highlight
    ca = h !== null
    console.log(ca, h)
    $('.pane[data-type="finance"] [data-dialog="highlight;a"]')
      .attr('title', ca ? gon.labels.update_or_remove_highlight : gon.labels.highlight)
      .attr('data-id', sid+'a').toggleClass('highlighted', ca).toggleClass('onhome', ca && h.home)

  } else if (partial === 'donation') {

    h = js.cache[js.cache[sid]].ca.highlight
    ca = h !== null
    console.log(ca, h)
    $('.pane[data-type="donation"] [data-dialog="highlight;a"]')
      .attr('title', ca ? gon.labels.update_or_remove_highlight : gon.labels.highlight)
      .attr('data-id', sid+'a').toggleClass('highlighted', ca).toggleClass('onhome', ca && h.home)

    h = js.cache[js.cache[sid]].cb.highlight
    cb = h !== null
    console.log(cb, h)
    $('.pane[data-type="donation"] [data-dialog="highlight;b"]')
      .attr('title', cb ? gon.labels.update_or_remove_highlight : gon.labels.highlight)
      .attr('data-id', sid+'b').toggleClass('highlighted', cb).toggleClass('onhome', cb && h.home)

  }
}

js_dialog.callbacks.highlight = {
  open: function (option) {
    var cont = $('dialog [data-type="highlight"]')
    var hlts = js.cache[js.cache[js.sid]]['c' + option.chart_type].highlight
    // console.log(hlts)
    cont.find('button[data-type]').attr('data-chart', option.chart_type)
    var present = hlts !== null
    gon.locales.forEach(function (d) {
      cont.find('textarea[name="description_translations[' + d + ']"]').val(present ? hlts.description[d] : null)
    })
    cont.find('input[type="checkbox"][name="home"]').prop('checked', present ? hlts.home : false)
    cont.find('button[data-type="unhighlight"]').toggle(present)
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
      var home = dialog.find('input[type="checkbox"][name="home"]').prop('checked')
      $.ajax({
        url: gon.highlight_url,
        type: 'POST',
        dataType: "json",
        data: {
          highlight: {
            base_id: js.sid + chart_type,
            description_translations: descriptions,
            home: home
          }
        },
        success: function (data) {
          console.log(data)
          var success = data.success
          flash(data.message, success ? 'success' : 'danger')
          if(success) {
            js.cache[js.cache[js.sid]]["c" + chart_type].highlight = {
              description: descriptions,
              home: home
            }
          }
          $('.highlight[data-id="' + js.sid + chart_type + '"]')
            .attr('title', success ? gon.labels.update_or_remove_highlight : gon.labels.highlight)
            .toggleClass('highlighted', success).toggleClass('onhome', success && home)
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
          $('.highlight[data-id="' + js.sid + chart_type + '"]')
            .attr('title', success ? gon.labels.highlight : gon.labels.update_or_remove_highlight)
            .toggleClass('highlighted', !success).removeClass('onhome')
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
    })[0]
    console.log(hlts)
    var present = hlts !== null
    cont.find('button[data-type]').attr('data-hid', hid)
    gon.locales.forEach(function (d) {
      cont.find('textarea[name="description_translations[' + d + ']"]').val(present ? hlts.description[d] : null)
    })
    cont.find('button[data-type="unhighlight"]').toggle(present)


    cont.find('input[type="checkbox"][name="home"]').prop('checked', present ? hlts.home : false)

    cont.find('button[data-type="unhighlight"]').toggle(present)
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
      var home = dialog.find('input[type="checkbox"][name="home"]').prop('checked')


      $.ajax({
        url: gon.highlight_url,
        type: 'POST',
        dataType: "json",
        data: {
          highlight: {
            base_id: hid,
            description_translations: descriptions,
            home: home
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
            var tmp = gon.highlights_data.filter(function(f) {
                  return f.sid === sid && f.tp === chart_type
                })[0]

            tmp.home = home
            tmp.description = descriptions
            $('.highlight-item[data-id="' + hid + '"] .description span').text(descriptions[gon.locale])
          }
          $('.highlight[data-id="' + hid + '"]')
            .attr('title', success ? gon.labels.update_or_remove_highlight : gon.labels.highlight)
            .toggleClass('highlighted', success).toggleClass('onhome', success && home)
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
          var tmp = gon.highlights_data.filter(function(f) {
            return f.sid === sid && f.tp === chart_type
          })[0]
          tmp.home = false
          tmp.description = null

          $('.highlight[data-id="' + hid + '"]')
            .attr('title', success ? gon.labels.highlight : gon.labels.update_or_remove_highlight)
            .toggleClass('highlighted', !success).removeClass('onhome')
        },
        complete: function () {
          js_dialog.close();
        }
      });
    });
  }
}






