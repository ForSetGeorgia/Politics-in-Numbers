/* global $ gon Highcharts*/
/* @flow */
//= require jquery-ui/datepicker
//= require jquery-ui/tooltip
//= require moment
//= require explore_global
//= require js_dialog
//= require highcharts_charts
//= require highcharts-exporting

$(document).ready(function (){
  if (typeof global_process_callback === 'undefined') {
    global_process_callback = function () {}
  }
  var
    w = 0,
    h = 0,
    current_id,
    decPoint = ".",
    $filter = $(".filter"),
    explore_button = $("#explore_button"),
    finance_toggle = $("#finance_toggle"),
    donation_toggle = $("#donation_toggle"),
    $party = $("#party"),
    view_content = $(".result"),
    view_not_found = $(".not-found"),
    loader = {
      el: $(".view-loader"),
      _type: "circle",
      set: function () {
        this.el.attr("data-type", this._type)
        this.type()
      },
      start: function () {
        this.set()
        this.el.fadeIn()
      },
      stop: function () { this.el.fadeOut() },
      retype: function (tp) {
        this.type(tp)
        this.set()
        return this
      },
      show: function () {
        this.set()
        this.el.show()
      },
      hide: function () { this.el.hide() },
      type: function (tp) { this._type = (typeof tp === "undefined" || ["circle", "message", "empty"].indexOf(tp) === -1) ? "circle" : tp; return this }
    },
    autocomplete = {
      push: function (autocomplete_id, key, value) {
        this.clear(autocomplete_id)
        if(!this.hasOwnProperty(autocomplete_id)) {
          this[autocomplete_id] = {}
        }
        if(!this[autocomplete_id].hasOwnProperty(key)) {
          $("[data-autocomplete-view='" + autocomplete_id + "']").append(li_without_close(key, value))
          this[autocomplete_id][key] = value
        }
      },
      clear: function (autocomplete_id) {
        if(this.hasOwnProperty(autocomplete_id)) {
          $("[data-autocomplete-view='" + autocomplete_id + "'] li").remove()
          $("[data-autocomplete-id='" + autocomplete_id + "'] .dropdown li .item").removeClass("selected")
          delete this[autocomplete_id]
        }
      },
      has: function (autocomplete_id, key) {
        return this.hasOwnProperty(autocomplete_id) && this[autocomplete_id].hasOwnProperty(key)
      },
      onchange: debounce(function (event) {
        var t = $(this), v = t.val(), p = t.parent(), ul = p.find("ul"), autocomplete_id = p.attr("data-autocomplete-id")
        if(event.type === "keyup" && event.keyCode === 40 && typeof global_keyup_down_callback === "undefined") {
          global_keyup_up_callback = function () {
            var tmp = ul.find("li.focus").removeClass("focus").prev()
            if(!tmp.length) { tmp = ul.find("li:last") }
            tmp.addClass("focus").focus()
          }
          global_keyup_down_callback = function () {
            var tmp = ul.find("li.focus").removeClass("focus").next()
            if(!tmp.length) { tmp = ul.find("li:first") }
            tmp.addClass("focus").focus()
          }
          global_keyup_down_callback()
        }
        else {
          if(t.data("previous") !== v) {
            t.data("previous", v)

            if(p.is("[data-local]")) {
              if(v.length >= 3) {
                ul.find("li .item[data-id]").parent().hide()
                var regex = new RegExp(".*" + v + ".*", "i"),
                  local = p.attr("data-local"),
                  multilevel = finance.categories.indexOf(local) !== -1,
                  list = multilevel ? gon.category_lists[local] : gon[local + "_list"], to_show = []
                if(multilevel) {
                  list.forEach(function (d) {
                    if(d[1].match(regex) !== null) {
                      to_show.push(d[0])
                      if(d[2] !== -1) {
                        var d2 = d[2]
                        while(d2 !== -1) {
                          to_show.push(d2)
                          d2 = list.filter(function (ll) { return ll[0] === d2 })[0][2]
                        }
                      }
                      to_show.forEach(function (ts) {
                        ul.find("li .item[data-id='" + ts + "']").parent().show()
                      })
                    }
                  })
                }
                else {
                  list.forEach(function (d) {
                    if((d[1] + (d.length === 3 ? d[2] : "")).match(regex) !== null) {
                      to_show.push(d[0])
                    }
                  })
                  to_show.forEach(function (ts) {
                    ul.find("li .item[data-id='" + ts + "']").parent().show()
                  })
                }
              }
              else {
                ul.find("li .item[data-id]").parent().show()
              }
            }
          }
          else {
            ul.addClass("active")
          }
        }
        event.stopPropagation()
      }, 250),
      // search_tree: function () {}
      bind: function() {
        // $(".autocomplete[data-source]").each(function() {
        //   var t = $(this), source = t.attr("data-source"), html = ""
        //   if(gon.hasOwnProperty(source) && Array.isArray(gon[source])) {
        //     gon[source].forEach(function(d) {
        //       html += "<li><div class=\"item\" data-id=" + d[0] + ">" + d[1] + "</div></li>"
        //     })
        //     t.find(".dropdown").html(html)
        //   }
        // })
        $(".autocomplete input").on("change paste keyup", this.onchange)
        $(".autocomplete input").on("click", function () {
          var p = $(this).parent(), p_id = p.attr("data-autocomplete-id")
          p.addClass("active")
          if(typeof global_click_callback === "function") {
            global_click_callback(this)
          }
          global_click_callback = function (target) {
            target = $(target)
            var target_parent = target.hasClass(".autocomplete") ? target : target.closest(".autocomplete")
            if(!(target_parent.length && target_parent.attr("data-autocomplete-id") == p_id)) {
              p.removeClass("active").find("li.focus").removeClass("focus")
              global_click_callback = undefined
              global_keyup_up_callback = undefined
              global_keyup_down_callback = undefined
            }
          }
          event.stopPropagation()
        })

        $(document).on("click keypress", ".autocomplete .dropdown li .item", function(event) {
          if(event.type === "keypress" && event.keyCode !== 13) { return }
          var t = $(this), dropdown = t.closest(".dropdown"), p = dropdown.parent(), is_selected = t.hasClass("selected")

          t.toggleClass("selected")
          var autocomplete_id = p.attr("data-autocomplete-id")
          if(is_selected) {
            // autocomplete.pop(autocomplete_id, t.attr("data-id"))
          }
          else {
            var extra = t.attr("data-extra")
            extra = typeof extra  !== "undefined" ? " (" + extra + ")": ""
            autocomplete.push(autocomplete_id, t.attr("data-id"), t.text() + extra)
          }
          event.stopPropagation()
        })
        $(document).on("click keypress", ".autocomplete .dropdown li .tree-toggle", function(event) {
          if(event.type === "keypress" && event.keyCode !== 13) { return }
          $(this).parent().toggleClass("expanded")
          event.stopPropagation()
        })
      }
    },
    filter = {

      types: {
        finance: {
          party: "autocomplete",
          period_mix: "period_mix"
        },
        donation: {
          party: "autocomplete",
          period: "period"
        }
      },
      categories: ["income", "expenses", "reform_expenses", "property_assets", "financial_assets", "debts" ],
      elem: {
        finance: {
          party: $("#filter_party"),
          period_mix: $("#filter_period_mix")
        },
        donation: {
          party: $("#filter_party"),
          period: {
            from: $("#filter_period_from"),
            to: $("#filter_period_to")
          }
        }
      },
      data: {
        finance: {},
        donation: {}
      },
      sid: {
        finance: undefined,
        donation: undefined
      },
      current_type: 'finance',
      current_party: undefined,
      get: function(type) {
        var t = this, tp, tmp, tmp_v, tmp_d, lnk,
          current_elem = t.elem[type],
          dt = t.data[type] = { filter: type }

        Object.keys(current_elem).forEach(function(el){
          var is_elem = ["period"].indexOf(el) === -1;
          (is_elem ? [current_elem[el]] : Object.keys(current_elem[el]).map(function (m){ return current_elem[el][m] }))
          .forEach(function(elem, elem_i){
            tmp = $(elem)
            tmp_v = []
            tp = tmp.attr("data-type")
            if(tp === "autocomplete") {
              lnk = tmp.attr("data-autocomplete-view")
              if(autocomplete.hasOwnProperty(lnk)) {
                tmp_v = Object.keys(autocomplete[lnk])[0]
              }

              if(tmp_v.length) {
                dt[el] = tmp_v
                t.current_party = tmp_v
              }
              else {
                delete dt[el]
              }
            }
            else if(tp === "period") {
              tmp_v = tmp.datepicker('getDate')
              tmp_d = dt.hasOwnProperty(el) ? dt[el] : [-1, -1]
              if(isDate(tmp_v)) {
                tmp_d[elem_i] =  Date.UTC(tmp_v.getFullYear(), tmp_v.getMonth(), tmp_v.getDate(), 0, 0, 0)
              }
              if(tmp_d.toString() === [-1, -1].toString()) {
                delete dt[el]
              }
              else {
                dt[el] = tmp_d
              }
            }
            else if(tp === "period_mix") {
              tmp_d = tmp.find("li[data-id]")
              if(tmp_d.length) {
                tmp_d.each(function(){ tmp_v.push(this.dataset.id) })
                dt['period'] = tmp_v
              }
            }
            else {
              console.log("Type is not specified", tp, t.elem[el])
            }
          })
        })
        return dt
      },
      set_by_params: function(type) {
        var t = this, tmp, tp, v, p, el,
          current_elem = t.elem[type],
          current_type = t.types[type];
        if(gon[type + '_params']) {
          Object.keys(gon[type + '_params']).forEach(function(k) {
            el = current_elem[k]
            tp = current_type[k]
            v = gon[type + '_params'][k]

            if(tp === "autocomplete") {
              p = el.parent()
              var fld = p.attr("data-field")
              autocomplete.push(p.find(".autocomplete[data-autocomplete-id]").attr("data-autocomplete-id"), v, gon[fld + "_list"].filter(function(d) { return d[0] == v })[0][1])
              t.current_party = v
            }
            else if(tp === "period") {
              v = [moment.utc(v[0]).format(gon.mdate_format), moment.utc(v[1]).format(gon.mdate_format)]
              el.from.datepicker('setDate', v[0])
              el.to.datepicker('setDate', v[1])
              tmp = formatRange(v)
              create_list_item(el.from.parent().parent().find(".list"), tmp, tmp)
            }
            else if(tp === "period_mix") {
              p = el.parent()
              var group = p.find(".input-group .input-checkbox-group"),
                group_list = group.find("li input[value='" + v[0] + "']").parent().parent()
                group_type = group_list.attr("data-type")

              p.find(".input-group .input-radio-group input[value='" + group_type + "']").prop("checked", true)
              group.find("ul").addClass("hidden")

              v.forEach(function(d){
                group.find("li input[value='" + d + "']").prop("checked", true)
                el.append(li(d, gon.period_list.filter(function(f){ return f[0] == d })[0][1]))
              })
              group_list.removeClass("hidden")
            }
          })
        }
      },
      reset: function(type) {
        $(".filter-inputs .filter-input").each(function(i,d) {
          var t = $(this)
            field = t.attr("data-field"),
            tp = t.attr("data-type")
            list = t.find(".list")
            if(tp === "autocomplete") {
              var tmp = t.find(".autocomplete[data-autocomplete-id]")
              autocomplete.clear(tmp.attr("data-autocomplete-id"))
              tmp.find("input").val(null).trigger("change")
              if(typeof global_click_callback === "function") { global_click_callback() }
            }
            else if(tp === "period" && type === 'donation') {
              t.find(".input-group input[type='text'].datepicker").datepicker('setDate', null)
            }
            else if(tp === "period_mix" && type === 'finance') {
              t.find(".input-group .input-radio-group input:first-of-type").prop("checked", true)
              var group = t.find(".input-group .input-checkbox-group")
              group.find("input[type='checkbox']:checked").prop("checked", false)
              group.find("ul[data-type='annual']").removeClass("hidden")
              group.find("ul[data-type='campaign']").addClass("hidden")
            }
            list.empty()
        })
      },
      id: function(type) {
        // TODO
        var t = this, tmp = [], p, except = ["period"],
        dt = t.data[type]
        Object.keys(dt).sort().forEach(function (k) {
          p = dt[k]
          p = Array.isArray(p) ? p.sort() : [p]
          tmp.push(k + "=" + p.join(","))
        })
        return CryptoJS.MD5(tmp.join("&")).toString()
      },
      url: function () {
        var t = this, sid = t.sid[t.current_type]
        window.history.pushState(sid, null, gon.path + "/" + sid)
      },
      set_type: function (type) {
        this.current_type = type
      },
      switch: function (type) {
        var t = this
        t.set_type(type)
        // switch type and get sid pass to url
        t.url()
      }
    }

// -----------------------------------------------------------------
  finance_toggle.click(function (event){
    filter.switch('finance')

    var p = finance_toggle.parent()
    donation_toggle.parent().removeClass("active")

    if(!p.hasClass("active")) {
      p.addClass("active")
      $party.attr("data-type", "finance")
    }
    event.stopPropagation()
  })

  donation_toggle.click(function (event){
    filter.switch('donation')

    var p = donation_toggle.parent()
    finance_toggle.parent().removeClass("active")

    if(!p.hasClass("active")) {
      p.addClass("active")
      $party.attr("data-type", "donation")
    }
    event.stopPropagation()
  })

  function create_list_item(list, text, vbool) {
    list.html(vbool ? "<span>" + text + "<i class='close' title='" + gon.filter_item_close + "'></i></span>" : "").toggleClass("hidden", !vbool)
  }
  function li(id, text) {
    return "<li data-id='"+id+"'>"+text+"<i class='close' title='" + gon.filter_item_close + "'></i></li>"
  }
  function li_without_close(id, text) {
    return "<li data-id='"+id+"'>"+text+"</li>"
  }
  function resize() {
    w = $(window).width()
    h = $(window).height()
  }
  function bind() {

    $filter.find(".filter-toggle").click(function (){  // 'Filter' label button used in small screens
      $filter.toggleClass("active")
      loader.type("empty").show()

      event.stopPropagation()
    })
    $filter.find(".filter-header .close").click(function (){
      loader.hide()
      $filter.toggleClass("active")
    })
    $filter.find(".filter-input .toggle, .filter-input input").on("click change", function(){
      var t = $(this).closest(".filter-input"),
        field = t.attr("data-field"),
        type = t.attr("data-type"),
        html = "",
        list = t.find(".list"),
        tmp, tmp2,
        state = t.hasClass("expanded")

      if(state) {
        if(type === "period") {
          tmp = []
          t.find(".input-group input[type='text'].datepicker").each(function(i, d){
            tmp2 = $(d).datepicker("getDate")
            tmp.push(tmp2 ? tmp2.format(gon.date_format) : null)
          })
          tmp = formatRange(tmp)
          create_list_item(list, tmp, tmp)
        }
      }

      if($(this).hasClass("toggle")) {
        t.toggleClass("expanded", !state)
      }
    })
    $(window).on("resize", function(){
      resize()
      $filter.find(".filter-inputs").css("max-height", $(window).height() - $filter.find(".filter-toggle").offset().top)
    })
    resize()

    var tmp_from = filter.elem.donation.period.from,
      tmp_to = filter.elem.donation.period.to

    tmp_from.datepicker({
      firstDay: 1,
      changeMonth: true,
      changeYear: true,
      dateFormat: gon.date_format,
      onClose: function( selectedDate ) {
        tmp_to.datepicker( "option", "minDate", selectedDate )
      }
    })
    tmp_to.datepicker({
      firstDay: 1,
      changeMonth: true,
      changeYear: true,
      dateFormat: gon.date_format,
      onClose: function( selectedDate ) {
        tmp_from.datepicker( "option", "maxDate", selectedDate )
      }
    })

    $("#filter_period_campaigns a").click(function(){
      var t = $(this), v = t.attr("data-value").split(";")
      tmp_from.datepicker('setDate', new Date(v[0]))
      tmp_to.datepicker('setDate', new Date(v[1]))
    })

    $(document).on("click", ".list > span .close, .list > li .close", function(event) {
      var t = $(this)
        p = t.closest(".filter-input"),
        field = p.attr("data-field"),
        type = p.attr("data-type"),
        li_span = t.parent()

      if(type === "period") {
        p.find(".input-group input[type='text'].datepicker").datepicker('setDate', null)
      }
      else if(type === "period_mix") {
        p.find(".input-group .input-checkbox-group input[type='checkbox'][value='" + li_span.attr("data-id") + "']:checked").prop("checked", false)
      }

      if(type !== "autocomplete") {
        li_span.remove()
      }
      event.stopPropagation()
    })
    $("#reset").click(function(){
      filter.reset(filter.current_type)
      filter.set_by_params(filter.current_type)
    })
    explore_button.click(function(){ process() })

    $(".chart_download a").click(function(){
      var t = $(this),
        f_type = t.attr("data-type"),
        p = t.parent().parent(),
        chart_id = p.closest('.chart-container').attr('data-chart-id'),
        chart_info = get_chart_info_by_id(chart_id)

      if(f_type === "print") {
        var chart = $('#' + chart_id).highcharts()
        chart.print()
      }
      else {
        var _id
        var is_donation = chart_info.type == 'd'
        var type = is_donation ? 'donation' : 'finance'
        var currentTmp = js.cache[filter.id(type)]
        var tmp_sid = is_donation ? currentTmp.sid : currentTmp.data[chart_info.category].sid

        window.location.href = gon.chart_path + tmp_sid + "/" + chart_info.inner_category + "/" + f_type
      }
    })
    autocomplete.bind()

    $(document).on("click", ".filter-input[data-type='period_mix'] .input-radio-group input + label", function(event) {
      var t = $(this), tp = t.attr("data-type"), filter_input = t.closest(".filter-input"),
        group = filter_input.find(".input-checkbox-group"), list = filter_input.find("> ul.list")
      list.empty()

      group.find("ul[data-type]").addClass("hidden")
      group.find("ul[data-type='" + tp + "']").removeClass("hidden")
      group.find("ul[data-type='" + tp + "'] input:checked").each(function(i, d){
        var d = $(d), p = d.parent(), text = p.find("label").text(), id = d.val()
        list.append(li(id,text))
      })
    })
    $(document).on("click", ".filter-input[data-type='period_mix'] .input-checkbox-group input + label", function(event) {
      var t = $(this), p = t.parent(), input = p.find("input"), text = t.text(), id = input.val(),
        list = p.closest(".filter-input").find("> ul.list")
      if(input.is(":checked")) {
        list.find("li[data-id='" + id + "']").remove()
      }
      else {
        list.append(li(id,text))
      }

    })



    $(document).tooltip({
      content: function() { return $(this).attr("data-retitle") },
      items: "text[data-retitle]",
      track: true
    })

    $(document).on("click", "[data-dialog]", function () {
      var t = $(this),
        dialog_type =  t.attr("data-dialog"), // ex: embed
        chart_id = t.closest('.chart-container').attr('data-chart-id'),
        chart_info = get_chart_info_by_id(chart_id)

      var options = {
        type: chart_info.type,
        chart_type: chart_info.inner_category,
        sid: get_current_sid_by_id(chart_id)
      }
      if(dialog_type === "share") {
        options["title"] = js.share['#' + chart_id]
      }

      js_dialog.open(dialog_type, options)
    })
  }
  function get_chart_info_by_id (id) {
    var parts = id.split('c_')
    return { type: parts[0], category: parts[1], inner_category: (parts[0] === 'd' ? (parts[1] === 'first' ? 'a' : 'b') : 'a') }
  }
  function get_current_sid_by_id(id) {
    var ch_info = get_chart_info_by_id(id)
    if(ch_info.type === 'd') {
      return js.cache[filter.id(filter.current_type)].sid
    } else {
      return js.cache[filter.id(filter.current_type)].data[ch_info.category].sid
    }
  }
  function process() {
    loader.start()
    var tmp, _id, objs = ['donation', 'finance']
    if(gon.gonned) {
      objs.forEach( function (obj) {
        filter.set_by_params(obj)
        filter.get(obj)
        _id = filter.id(obj)
        filter.sid[obj] = gon[obj + '_data'].psid
        process_callback(js.cache[_id] = gon[obj + '_data'], obj)
      })
      js.cache[gon.party.id] = gon.party
      filter.url()
      gon.gonned = false
    } else {
      var pars = {}, missing = [], _ids = {};

      objs.forEach( function (obj) {
        tmp = filter.get(obj)
        _id = filter.id(obj)
        _ids[obj] = _id
        pars[obj] = { required: true }
        if( tmp.hasOwnProperty('period')) {
          pars[obj]['period'] = tmp['period']
        }
        pars['party'] = tmp['party']

        if(!js.cache.hasOwnProperty(_id)) {
          missing.push(obj)
        }
      })
      if(missing.length !== 0) { //!js.cache.hasOwnProperty(_id)) {
        $.ajax({
          url: gon.filter_path,
          dataType: 'json',
          data: pars, //filter.get(filter.current_type),
          success: function(data) {
            objs.forEach(function (obj) {
              if(data.hasOwnProperty(obj)) {
                filter.sid[obj] = data[obj].psid
                process_callback(js.cache[_ids[obj]] = data[obj], obj)
              }
            })
            party_info_populate(js.cache[filter.current_party] = data.party)
            filter.url()
          }
        })
      }
      else {
        objs.forEach(function (obj) {
          tmp = js.cache[_ids[obj]]
          filter.sid[obj] = tmp.psid
          process_callback(tmp, obj)
        })
        party_info_populate(js.cache[filter.current_party])
        filter.url()
      }
    }
  }
  function process_callback(data, partial) {
    view_not_found.addClass("hidden")
    var is_data_ok = typeof data !== "undefined",
      dt
    if(is_data_ok) {
      var tmp_width = $('.result').width()
      if(tmp_width > 1024) {
        tmp_width = 1024
      }
      if(partial === "donation") {
        dt = data
        dt.ca.orig_title = dt.ca.title
        dt.ca.title = '<a href="/' + gon.locale + '/explore/' + dt.sid + '">' + dt.ca.title + '</a>'

        bar_chart('#dc_first', dt.ca, "#EBE187", tmp_width)
        dt.cb.orig_title = dt.cb.title
        dt.cb.title = '<a href="/' + gon.locale + '/explore/' + dt.sid + '">' + dt.cb.title + '</a>'
        bar_chart('#dc_second', dt.cb, "#B8E8AD", tmp_width)
      }
      else {
        dt = data
        filter.categories.forEach( function(cat) {
          var tmp = dt.data[cat]
          tmp['categories'] = dt.categories
          tmp.orig_title = tmp.title
          tmp.title = '<a href="/' + gon.locale + '/explore/' + tmp.sid + '">' + tmp.title + '</a>'
          grouped_advanced_column_chart("#fc_" + cat, tmp, "#fff", tmp_width)
        })
      }
    }
    else {
      view_not_found.removeClass("hidden")
    }
    loader.stop()
  }
  function party_info_populate (party) {
    if(typeof party === 'undefined') { return }
    var info = $('.info')
    info.find('.caption div').text(party.title)
    document.title = party.title + ' | ' + gon.app_name_long
    info.find('.leader span').text(party.hasOwnProperty('leader') ? party.leader : '')
    info.find('.range').text(party.range)
    info.find('.description').text(party.description)
    var stats_box = $('#donation .stats-box')
    stats_box.find('[data-stat="amount"] span').text(party.stats.donation[0])
    stats_box.find('[data-stat="count"] span').text(party.stats.donation[1])
    stats_box = $('#finance .stats-box')
    stats_box.find('[data-category="income"] span').text(party.stats.finance['income'])
    stats_box.find('[data-category="expenses"] span').text(party.stats.finance['expenses'])
    stats_box.find('[data-category="reform_expenses"] span').text(party.stats.finance['reform_expenses'])
    stats_box.find('[data-category="financial_assets"] span').text(party.stats.finance['financial_assets'])
    stats_box.find('[data-category="property_assets"] span').text(party.stats.finance['property_assets'])
    stats_box.find('[data-category="debts"] span').text(party.stats.finance['debts'])
  }

  (function init() {
    init_highchart()
    bind()
    filter.set_type(gon.type)
    process()
  })()
})
