/* global $ gon Highcharts*/
/* @flow */
//= require jquery-ui/datepicker
//= require jquery-ui/tooltip
//= require moment
//= require explore_global
//= require js_dialog
//= require highcharts_charts

$(document).ready(function (){
  // console.log("explore ready");
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
    view_content = $(".result"),
    view_not_found = $(".not-found"),
    loader = {
      el: $(".view-loader"),
      _type: "circle",
      set: function () {
        this.el.attr("data-type", this._type);
        this.type();
      },
      start: function () {
        this.set();
        this.el.fadeIn();
      },
      stop: function () { this.el.fadeOut(); },
      retype: function (tp) {
        this.type(tp);
        this.set();
        return this;
      },
      show: function () {
        this.set();
        this.el.show();
      },
      hide: function () { this.el.hide(); },
      type: function (tp) { this._type = (typeof tp === "undefined" || ["circle", "message", "empty"].indexOf(tp) === -1) ? "circle" : tp; return this; }
    },
    autocomplete = {
      push: function (autocomplete_id, key, value) {
        // console.log(autocomplete_id, key,value);
        this.clear(autocomplete_id)
        if(!this.hasOwnProperty(autocomplete_id)) {
          this[autocomplete_id] = {};
        }
        if(!this[autocomplete_id].hasOwnProperty(key)) {
          $("[data-autocomplete-view='" + autocomplete_id + "']").append(li_without_close(key, value));
          this[autocomplete_id][key] = value;
        }
      },
      clear: function (autocomplete_id) {
        if(this.hasOwnProperty(autocomplete_id)) {
          $("[data-autocomplete-view='" + autocomplete_id + "'] li").remove();
          $("[data-autocomplete-id='" + autocomplete_id + "'] .dropdown li .item").removeClass("selected");
          delete this[autocomplete_id];
        }
      },
      has: function (autocomplete_id, key) {
        return this.hasOwnProperty(autocomplete_id) && this[autocomplete_id].hasOwnProperty(key);
      },
      onchange: debounce(function (event) {
        var t = $(this), v = t.val(), p = t.parent(), ul = p.find("ul"), autocomplete_id = p.attr("data-autocomplete-id");
        if(event.type === "keyup" && event.keyCode === 40 && typeof global_keyup_down_callback === "undefined") {
          global_keyup_up_callback = function () {
            var tmp = ul.find("li.focus").removeClass("focus").prev();
            if(!tmp.length) { tmp = ul.find("li:last"); }
            tmp.addClass("focus").focus();
          };
          global_keyup_down_callback = function () {
            var tmp = ul.find("li.focus").removeClass("focus").next();
            if(!tmp.length) { tmp = ul.find("li:first"); }
            tmp.addClass("focus").focus();
          };
          global_keyup_down_callback();
        }
        else {
          if(t.data("previous") !== v) {
            t.data("previous", v);

            if(p.is("[data-local]")) {
              if(v.length >= 3) {
                ul.find("li .item[data-id]").parent().hide();
                var regex = new RegExp(".*" + v + ".*", "i"),
                  local = p.attr("data-local"),
                  multilevel = finance.categories.indexOf(local) !== -1,
                  list = multilevel ? gon.category_lists[local] : gon[local + "_list"], to_show = [];
                if(multilevel) {
                  list.forEach(function (d) {
                    if(d[1].match(regex) !== null) {
                      to_show.push(d[0]);
                      if(d[2] !== -1) {
                        var d2 = d[2];
                        while(d2 !== -1) {
                          to_show.push(d2);
                          d2 = list.filter(function (ll) { return ll[0] === d2; })[0][2];
                        }
                      }
                      to_show.forEach(function (ts) {
                        ul.find("li .item[data-id='" + ts + "']").parent().show();
                      });
                    }
                  });
                }
                else {
                  list.forEach(function (d) {
                    if((d[1] + (d.length === 3 ? d[2] : "")).match(regex) !== null) {
                      to_show.push(d[0]);
                    }
                  });
                  to_show.forEach(function (ts) {
                    ul.find("li .item[data-id='" + ts + "']").parent().show();
                  });
                }
              }
              else {
                ul.find("li .item[data-id]").parent().show();
              }
            }
          }
          else {
            ul.addClass("active");
          }
        }
        event.stopPropagation();
      }, 250),
      // search_tree: function () {}
      bind: function() {
        // $(".autocomplete[data-source]").each(function() {
        //   var t = $(this), source = t.attr("data-source"), html = "";
        //   if(gon.hasOwnProperty(source) && Array.isArray(gon[source])) {
        //     gon[source].forEach(function(d) {
        //       html += "<li><div class=\"item\" data-id=" + d[0] + ">" + d[1] + "</div></li>";
        //     });
        //     t.find(".dropdown").html(html);
        //   }
        // });
        $(".autocomplete input").on("change paste keyup", this.onchange);
        $(".autocomplete input").on("click", function () {
          var p = $(this).parent(), p_id = p.attr("data-autocomplete-id");
          p.addClass("active");
          if(typeof global_click_callback === "function") {
            global_click_callback(this);
          }
          global_click_callback = function (target) {
            target = $(target);
            var target_parent = target.hasClass(".autocomplete") ? target : target.closest(".autocomplete");
            if(!(target_parent.length && target_parent.attr("data-autocomplete-id") == p_id)) {
              p.removeClass("active").find("li.focus").removeClass("focus");
              global_click_callback = undefined;
              global_keyup_up_callback = undefined;
              global_keyup_down_callback = undefined;
            }
          };
          event.stopPropagation();
        });

        $(document).on("click keypress", ".autocomplete .dropdown li .item", function(event) {
          // console.log("click keypress autocomplete name");
          if(event.type === "keypress" && event.keyCode !== 13) { return; }
          var t = $(this), dropdown = t.closest(".dropdown"), p = dropdown.parent(), is_selected = t.hasClass("selected");

          t.toggleClass("selected");
          var autocomplete_id = p.attr("data-autocomplete-id");
          if(is_selected) {
             //console.log("is selected");
            // autocomplete.pop(autocomplete_id, t.attr("data-id"));
          }
          else {
            //console.log("is not selected");
            // console.log(autocomplete_id, t.attr("data-id"), t.text());
            var extra = t.attr("data-extra");
            extra = typeof extra  !== "undefined" ? " (" + extra + ")": "";
            autocomplete.push(autocomplete_id, t.attr("data-id"), t.text() + extra);
          }
          // console.log(autocomplete);
          event.stopPropagation();
        });
        $(document).on("click keypress", ".autocomplete .dropdown li .tree-toggle", function(event) {
          if(event.type === "keypress" && event.keyCode !== 13) { return; }
          $(this).parent().toggleClass("expanded");
          event.stopPropagation();
        });


        // $(document).on("click", "[data-type='autocomplete'] .list li .close", function(event) {
        //   var t = $(this).parent(), list = t.parent(), autocomplete_id = list.attr("data-autocomplete-view");
        //   $("[data-autocomplete-id='" + autocomplete_id + "'] .dropdown li[data-id='" + t.attr("data-id") + "'] .item").toggleClass("selected");
        //   autocomplete.pop(autocomplete_id, t.attr("data-id"));
        //   event.stopPropagation();
        // });
      }
    },
    filter = {
      types: {
        party: "autocomplete",
        period: "period_mix"
      },
      categories: ["income", "expenses", "reform_expenses", "property_assets", "financial_assets", "debts" ],
      elem: {
        party: $("#filter_party"),
        period: $("#filter_period")
      },
      data: {},
      get: function() {
        var t = this, tp, tmp, tmp_v, tmp_d, lnk;
        t.data = { };
        // console.log(autocomplete, "before", t.data);
        Object.keys(this.elem).forEach(function(el){
          var is_elem = [].indexOf(el) === -1;
          ([t.elem[el]]).forEach(function(elem, elem_i){
            tmp = $(elem);
            tmp_v = [];
            tp = tmp.attr("data-type");
            if(tp === "autocomplete") {
              lnk = tmp.attr("data-autocomplete-view");
              if(autocomplete.hasOwnProperty(lnk)) {
                tmp_v = Object.keys(autocomplete[lnk])[0];
              }

              if(tmp_v.length) {
                t.data[el] = tmp_v;
              }
              else {
                delete t.data[el];
              }
            }
            else if(tp === "period_mix") {
              tmp_d = tmp.find("li[data-id]");
              if(tmp_d.length) {
                tmp_d.each(function(){ tmp_v.push(this.dataset.id); });
                t.data[el] = tmp_v;
              }
            }
            else {
              console.log("Type is not specified", t.elem[el]);
            }
          });
        });
        return t.data;
      },
      set_by_params: function() {
        var t = this, tmp, tp, v, p, el;
        // console.log("set_by_url finance", gon.params);
        if(gon.params) {
          Object.keys(gon.params).forEach(function(k) {
            // if(k == "filter" || !t.types.hasOwnProperty(k)) return;
              el = t.elem[k];
              tp = t.types[k];
              v = gon.params[k];

            if(tp === "autocomplete") {
              p = el.parent();
              var fld = p.attr("data-field")
              autocomplete.push(p.find(".autocomplete[data-autocomplete-id]").attr("data-autocomplete-id"), v, gon[fld + "_list"].filter(function(d) { return d[0] == v; })[0][1])
            }
            else if(tp === "period_mix") {
              p = el.parent();
              var group = p.find(".input-group .input-checkbox-group"),
                group_list = group.find("li input[value='" + v[0] + "']").parent().parent();
                group_type = group_list.attr("data-type");

              p.find(".input-group .input-radio-group input[value='" + group_type + "']").prop("checked", true);
              group.find("ul").addClass("hidden");
              v.forEach(function(d){
                group.find("li input[value='" + d + "']").prop("checked", true);
                el.append(li(d, gon.period_list.filter(function(f){ return f[0] == d; })[0][1]));
              });
              group_list.removeClass("hidden");
            }
          });
        }
      },
      reset: function() {
        $(".filter-inputs .filter-input").each(function(i,d) {
          var t = $(this);
            field = t.attr("data-field"),
            type = t.attr("data-type");
            list = t.find(".list");

            if(type === "autocomplete") {
              var tmp = t.find(".autocomplete[data-autocomplete-id]");
              autocomplete.clear(tmp.attr("data-autocomplete-id"));
              tmp.find("input").val(null).trigger("change");
              if(typeof global_click_callback === "function") { global_click_callback(); }
            }
            else if(type === "period_mix") {
              t.find(".input-group .input-radio-group input:first-of-type").prop("checked", true);
              var group = t.find(".input-group .input-checkbox-group");
              group.find("input[type='checkbox']:checked").prop("checked", false);
              group.find("ul[data-type='annual']").removeClass("hidden");
              group.find("ul[data-type='campaign']").addClass("hidden");
            }
            list.empty();
        });
      },
      id: function() {
        var t = this, tmp = [], p;
        Object.keys(t.data).sort().forEach(function (k) {
          p = t.data[k];
          p = Array.isArray(p) ? p.sort() : [p];
          tmp.push(k + "=" + p.join(","));
        });
        return CryptoJS.MD5(tmp.join("&")).toString();
      },
      url: function () {
        var t = this, period = ''
        if (t.data.hasOwnProperty('period')) {
          period = '?'
          t.data.period.forEach(function (per) {
            period += 'period[]=' + per
          })
        }
        window.history.pushState(current_id, null, gon.path.replace('_id_', t.data.party) + '' + period);
      }
    };

// -----------------------------------------------------------------

  function create_list_item(list, text, vbool) {
    list.html(vbool ? "<span>" + text + "<i class='close' title='" + gon.filter_item_close + "'></i></span>" : "").toggleClass("hidden", !vbool);
  }
  function li(id, text) {
    return "<li data-id='"+id+"'>"+text+"<i class='close' title='" + gon.filter_item_close + "'></i></li>";
  }
  function li_without_close(id, text) {
    return "<li data-id='"+id+"'>"+text+"</li>";
  }
  function resize() {
    w = $(window).width();
    h = $(window).height();
  }
  function bind() {

    $filter.find(".filter-toggle").click(function (){  // 'Filter' label button used in small screens
      $filter.toggleClass("active");
      loader.type("empty").show();

      event.stopPropagation();
    });
    $filter.find(".filter-header .close").click(function (){
      loader.hide();
      $filter.toggleClass("active");
    });
    $filter.find(".filter-input .toggle, .filter-input input").on("click change", function(){
      var t = $(this).closest(".filter-input"),
        field = t.attr("data-field"),
        type = t.attr("data-type"),
        html = "",
        list = t.find(".list"),
        tmp, tmp2,
        state = t.hasClass("expanded");

      if(state) {
        if(type === "period") {
          tmp = [];
          t.find(".input-group input[type='text'].datepicker").each(function(i, d){
            tmp2 = $(d).datepicker("getDate");
            tmp.push(tmp2 ? tmp2.format(gon.date_format) : null);
          });
          tmp = formatRange(tmp);
          create_list_item(list, tmp, tmp);
        }
      }

      if($(this).hasClass("toggle")) {
        t.toggleClass("expanded", !state);
      }
    });
    $filter.find(".filter-input button.clear").click(function () {
      var tmp = $(this).parent();
      autocomplete.clear(tmp.attr("data-autocomplete-id"));
      tmp.find("input").val(null).trigger("change");
    });
    $(window).on("resize", function(){
      resize();
      $filter.find(".filter-inputs").css("max-height", $(window).height() - $filter.find(".filter-toggle").offset().top);
    });
    resize();



    $(document).on("click", ".list > span .close, .list > li .close", function(event) {
      var t = $(this);
        p = t.closest(".filter-input"),
        field = p.attr("data-field"),
        type = p.attr("data-type"),
        li_span = t.parent();

      if(type === "period_mix") {
        p.find(".input-group .input-checkbox-group input[type='checkbox'][value='" + li_span.attr("data-id") + "']:checked").prop("checked", false);
      }

      if(type !== "autocomplete") {
        li_span.remove();
      }
      event.stopPropagation();
    });
    $("#reset").click(function(){
      clear_embed();
      filter.reset()
    });
    explore_button.click(function(){ clear_embed(); process(); });

    function clear_embed() {
      js.esid[js.is_donation ? "d" : "f"] = undefined;
    }
    $(".chart_download a").click(function(){
      var t = $(this),
        f_type = t.attr("data-type"),
        p = t.parent().parent(),
        c_type = p.attr("data-chart"),
        chart_id = p.closest('.actions').attr('data-chart-id')

      if(f_type === "print") {
        var chart = $(chart_id).highcharts()
        chart.print();
      }
      else {
        var is_donation = c_type[0] == 'd'
        var currentTmp = js.cache[current_id][is_donation ? 'donation' : 'finance']
        var tmp_sid
        if (is_donation) {
          tmp_sid = currentTmp.sid
        }
        else {
          tmp_sid = currentTmp.data[chart_id.replace('fc_', '')].sid
        }
        window.location.href = gon.chart_path + tmp_sid + "/" + c_type[1] + "/" + f_type;
      }
    });
    autocomplete.bind();

    $(document).on("click", ".filter-input[data-type='period_mix'] .input-radio-group input + label", function(event) {
      var t = $(this), tp = t.attr("data-type"), filter_input = t.closest(".filter-input"),
        group = filter_input.find(".input-checkbox-group"), list = filter_input.find("> ul.list");
      list.empty();

      group.find("ul[data-type]").addClass("hidden");
      group.find("ul[data-type='" + tp + "']").removeClass("hidden");
      group.find("ul[data-type='" + tp + "'] input:checked").each(function(i, d){
        var d = $(d), p = d.parent(), text = p.find("label").text(), id = d.val();
        list.append(li(id,text));
      });
    });
    $(document).on("click", ".filter-input[data-type='period_mix'] .input-checkbox-group input + label", function(event) {
      var t = $(this), p = t.parent(), input = p.find("input"), text = t.text(), id = input.val(),
        list = p.closest(".filter-input").find("> ul.list");
      if(input.is(":checked")) {
        list.find("li[data-id='" + id + "']").remove();
      }
      else {
        list.append(li(id,text));
      }

    });



    $(document).tooltip({
      content: function() { return $(this).attr("data-retitle"); },
      items: "text[data-retitle]",
      track: true
    });

    $(document).on("click", "[data-dialog]", function () {

      var t = $(this),
        pars = t.attr("data-dialog").split(";"), // ex: embed;a
        dialog_type = pars[0],
        options = { chart_type: pars[1] };

      if(dialog_type === "share") {
        options["title"] = js.share["#" + t.attr("data-share-title")];
      }

      js_dialog.open(pars[0], options);
    });
  }

  function process() {
    loader.start();
    console.log("process");
    var tmp, cacher_id, _id, _id, finance_id;//, obj;
    if(gon.gonned) {
      filter.set_by_params()
      filter.get()
      _id = filter.id()
      current_id = _id
      js.cache[_id] = { donation: gon.donation_data, finance: gon.finance_data }
      process_callback(js.cache[_id]);

      gon.gonned = false;
    } else {
      filter.get()
      _id = filter.id();
      if(!js.cache.hasOwnProperty(_id)) {
        $.ajax({
          url: gon.filter_path,
          dataType: 'json',
          data: filter.get(),
          success: function(data) {
            js.cache[_id] = data;
            current_id = _id
            filter.url();
            process_callback(js.cache[_id])
          }
        });
      }
      else {
        current_id = _id
        filter.url()
        process_callback(js.cache[_id])
      }
    }
  }
  function process_callback(data) {
    console.log("process_callback", data);
    view_not_found.addClass("hidden");
    var is_data_ok = typeof data !== "undefined";
    if(is_data_ok) {
      var dt = data.donation
      dt.ca.title = '<a href="/explore/' + dt.sid + '">' + dt.ca.title + '</a>'
      bar_chart('#dc_top', dt.ca, "#EBE187");
      dt.cb.title = '<a href="/explore/' + dt.sid + '">' + dt.cb.title + '</a>'
      bar_chart('#dc_last', dt.cb, "#B8E8AD");

      dt = data.finance
      filter.categories.forEach( function(cat) {
        var tmp = dt.data[cat]
        tmp['categories'] = dt.categories
        tmp.title = '<a href="/explore/' + tmp.sid + '">' + tmp.title + '</a>'
        grouped_advanced_column_chart("#fc_" + cat, tmp, "#fff");
      })
    }
    else {
      view_not_found.removeClass("hidden");
    }
    loader.stop();
  }



  // dev block
  // filter_extended.find(".filter-toggle").trigger("click");
  // filter_extended.find(".filter-input:nth-of-type(3) .toggle").trigger("click");
  (function init() {
    init_highchart();
    bind();
    // js.is_donation = gon.is_donation;
    process();
  })();
});
