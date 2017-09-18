/* global $ js gon */
/*eslint no-console: "error"*/
var js_dialog = (function () {

  var obj = undefined,
    $dialog = $("dialog"),
    state = 0,
    prev_originator = undefined,
    dynamic_sid,
    static_sid,
    binded = {},
    fn = function () {}
    callback = function() {},
    close_callback = function () {};


  function resize () {
    var sec = $dialog.find("section.active").first();
    sec.css({ top: $(window).height()/2 - sec.height()/2, left: $(window).width()/2 - sec.width()/2 });
  }
  function bind () {
    $dialog.find("> .bg").click(function () {
      obj.close();
    });
    $(document).keydown(function ( event ) {
      if (!event) {event = window.event;} // for IE compatible
      var keycode = event.keyCode || event.which; // also for cross-browser compatible
      if(keycode === 27 && state === 1) { // 27:ESC
        obj.close();
      }
    });
    $(".dialog-button").click(function () { obj.close(); });
    $(window).on("resize.dialog", function () { resize(); });
  }

  obj = {
    open: function open (type, options) {
      console.log(type, options)
      dynamic_sid = options.sid
      callback = this.callbacks[type].open

      close_callback = this.callbacks[type].hasOwnProperty('close') ? this.callbacks[type].close : fn

      if(!binded.hasOwnProperty(type) && this.callbacks[type].hasOwnProperty('bind')) {
        this.callbacks[type].bind(options)
        binded[type] = true
      }

      var sec = $dialog.find("section[data-type='" + type + "']");

      $dialog.find("section.active").removeClass("active");
      sec.addClass("active");
      callback(options);
      $dialog.addClass("active");
      resize();
      state = 1;

    },
    close: function close () {
      close_callback();
      $dialog.find("section.active").removeClass("active");
      $dialog.removeClass("active");
      state = 0;
    },
    callbacks: {
      embed: {
        open: function (options) {
          var chart_type
          if(typeof options !== 'undefined' && options.hasOwnProperty('chart_type')) {
            chart_type = options.chart_type;
          }
          if(typeof chart_type === "undefined") {
            chart_type = prev_originator;
          }
          var dialog = $('dialog [data-type="embed"]')

          var textarea = dialog.find("textarea"),
            sel = dialog.find(".iframe-sizes option:selected"),
            type = 'dynamic', //dialog.find(".embed-type .toggle-group").attr("data-toggle"),
            tmp_w, tmp_h;
          if (sel.val() === "custom") {
            tmp_w = dialog.find(".iframe-width").val();
            tmp_h = dialog.find(".iframe-height").val();
          }
          else {
            var tmp = sel.val().split("x");
            tmp_w = tmp[0];
            tmp_h = tmp[1];
          }

          var uri = textarea.attr("data-iframe-link").replace("_type_", type).replace("_id_", type === "dynamic" ? dynamic_sid : static_sid);
          textarea.text("<iframe src='" + uri + "?c=" + chart_type + "' width='"+tmp_w+"px' height='" + tmp_h + "px' frameborder='0'></iframe>");

          prev_originator = chart_type;
        },
        close: function () {
          // $("dialog [data-type='embed'] .embed-type .toggle-group .toggle[data-toggle='dynamic']").trigger("click");
        },
        bind: function (options) {
          var dialog = $('dialog [data-type="embed"]')
              // embed dialog
          dialog.find(".iframe-sizes").change(function () {
            if(this.value === "custom") {
              dialog.find(".iframe-custom").fadeIn();
            }
            else {
              dialog.find(".iframe-custom").fadeOut();
            }
            callback();
          });
          dialog.find(".iframe-custom input").change(function () {
            callback();
          });

          // dialog.find(".embed-type .toggle-group .toggle").click(function () {
          //   var t = $(this), tp = t.attr("data-toggle");
          //   t.parent().attr("data-toggle", tp);
          //   if(tp === "static") {
          //     if(typeof js.sid !== "undefined") {
          //       var tmp = js.esid[js.is_donation ? "d" : "f"];
          //       if(typeof tmp !== "undefined") {
          //         sid = tmp;
          //         callback();
          //       }
          //       else {
          //         // console.log("remote embed static id");
          //         $.ajax({
          //           url: gon.embed_path.replace("_id_", js.sid),
          //           dataType: "json",
          //           success: function (data) {
          //             if(data.hasOwnProperty("sid")) {
          //               sid = data.sid;
          //               js.esid[js.is_donation ? "d" : "f"] = sid;
          //               callback();
          //             }
          //           }
          //         });
          //       }
          //     }
          //     else {
          //       console.log("Explore page before embeding.");
          //     }
          //   }
          //   else {
          //     callback();
          //   }
          // });
        }
      },
      share: {
        open: function (option) {
          // console.log("share_callback", option);
          var dialog = $('dialog [data-type="share"]')
          var uri = gon.share_url.replace("_id_", dynamic_sid).replace("_chart_", option.chart_type)

          var lnk = dialog.find(".facebook a")
          lnk.attr("href", lnk.attr("data-href").replace("_url_", uri));

          lnk = dialog.find(".twitter a");
          lnk.attr("href", lnk.attr("data-href").replace("_url_", uri).replace("_text_", option.title));

          lnk = dialog.find(".more .addthis_inline_share_toolbox");
          lnk.attr("data-url", uri);
          lnk.attr("data-title", option.title);
          lnk.attr("data-description", gon.share_desc);
        }
      }
    }
  };

  bind()

  return obj;
})();
