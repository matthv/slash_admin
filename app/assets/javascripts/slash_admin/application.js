//= require js-routes
//= require i18n
//= require i18n/translations
//= require jquery3
//= require jquery_ujs
//= require popper
//= require bootstrap
//= require selectize
//= require moment
//= require moment/fr
//= require bootstrap-material-datetimepicker
//= require jquery.tagsinput-revisited.min
//= require Chart.min
//= require highcharts
//= require chartkick
//= require bootstrap-datepicker
//= require sweetalert
//= require cocoon
//= require toastr
//= require codemirror/codemirror
//= require codemirror/lint/lint
//= require codemirror/lint/jsonlint
//= require codemirror/lint/json-lint
//= require codemirror/mode/javascript
//= require jquery.nestable
//= require jquery.minicolors
//= require turbolinks
//= require slash_admin/custom
//= require_tree .

$(document).on("turbolinks:load", init);

function init() {
  Turbolinks.clearCache();

  $('.page-sidebar a[href$="#"]').on('click', function(e) {
    e.preventDefault()
  });

  $(".tags").tagsInput({
    placeholder: I18n.t('slash_admin.view.add_tag'),
    delimiter: [",", ";", " "]
  });

  // Scroll to top
  var offset = 250;
  $(window).scroll(function() {
    if ($(this).scrollTop() > offset) {
      $(".scroll-to-top").fadeIn("slow");
    } else {
      $(".scroll-to-top").fadeOut("slow");
    }
  });

  $(".scroll-to-top").click(function(event) {
    $("html, body").animate({ scrollTop: 0 }, 300);
  });

  // Automatic hide alert
  window.setTimeout(function() {
    $(".alert").fadeTo(500, 0).slideUp(500, function() {
      $(this).remove();
    });
  }, 1500);

  // clearForm
  $.fn.clearForm = function() {
    return this.each(function() {
      var type = this.type,
        tag = this.tagName.toLowerCase();
      if (tag === "form") return $(":input", this).clearForm();
      if (type === "text" || type === "password" || tag === "textarea")
        this.value = "";
      else if (type === "checkbox" || type === "radio") this.checked = false;
      else if (tag === "select") this.selectedIndex = -1;
    });
  };

  // CounterUp plugin
  $("[data-counter='counterup']").each(function() {
    var $this = $(this),
      countTo = $this.attr("data-value");
    $({ countNum: $this.text() }).animate(
      {
        countNum: countTo
      },
      {
        duration: 1500,
        easing: "linear",
        step: function() {
          $this.text(Math.floor(this.countNum));
        },
        complete: function() {
          $this.text(this.countNum);
        }
      }
    );
  });

  // MENU
  $(".sub-menu").has(".active").parent().addClass("active");

  // BULK ACTIONS
  $(".toggle-all").on("change", function() {
    var checked = this.checked;
    $('.table-data-list tbody input[type="checkbox"]').each(function(
      index,
      item
    ) {
      $(item).prop("checked", checked);
    });
  });

  $('.table-data-list input[type="checkbox"]').on("change", function() {
    var length = $('.table-data-list tbody input[type="checkbox"]:checked')
      .length;
    $(".batch-current-selected").html(length);
  });

  // Delete button protection sweetalert
  $(".single-delete").on("click", function(e) {
    e.preventDefault();
    var target = $(this).attr("href");
    var current = window.location.href;

    swal(
      {
        title: I18n.t('slash_admin.view.confirm'),
        text: I18n.t('slash_admin.view.no_back'),
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        cancelButtonClass: "btn-primary",
        confirmButtonText: I18n.t('slash_admin.view.yes_delete'),
        cancelButtonText: I18n.t('slash_admin.view.cancel'),
        closeOnConfirm: false
      },
      function() {
        $.ajax({
          url: target,
          method: "DELETE"
        }).done(function() {
          window.location.href = current;
        });
      }
    );
  });

  // Batch action
  $(".batch-action").on("click", function(e) {
    e.preventDefault();
    var target = $(this).data("action");
    var message = $(this).data("message");
    var current = window.location.href;
    var ids = [];

    $('.table-data-list tbody input[type="checkbox"]:checked').each(function(
      index,
      checkbox
    ) {
      ids.push($(this).val());
    });

    if (ids.length > 0) {
      swal(
        {
          title: I18n.t('slash_admin.view.confirm'),
          text: message,
          type: "warning",
          showCancelButton: true,
          confirmButtonClass: "btn-danger",
          cancelButtonClass: "btn-primary",
          confirmButtonText: I18n.t('slash_admin.view.yes_delete'),
          cancelButtonText: I18n.t('slash_admin.view.cancel'),
          closeOnConfirm: false
        },
        function() {
          $.ajax({
            url: target,
            method: "post",
            data: {
              ids: ids
            }
          }).done(function() {
            window.location.href = current;
          });
        }
      );
    }
  });

  $(".selectize-single").selectize({
    allowEmptyOption: true
  });

  $(".selectize-multiple").selectize({
    allowEmptyOption: true,
    persist: false,
    plugins: {
      remove_button: {}
    }
  });

  $(".selectize-model-single").selectize({
    allowEmptyOption: true,
    valueField: "id",
    labelField: "name",
    searchField: "name",
    create: false,
    load: function(query, callback) {
      if (!query.length) return callback();
      var model = $(this)[0].$input[0].getAttribute("data-model");
      var fields = $(this)[0].$input[0].getAttribute("data-fields");
      $.ajax({
        url: Routes.slash_admin_remote_selectize_path({
          format: "json"
        }),
        dataType: "json",
        data: {
          model_class: model,
          q: query,
          fields: fields.split(" ")
        },
        error: function() {
          callback();
        },
        success: function(res) {
          callback(res);
        }
      });
    },
    render: {
      option: function(item, escape) {
        return "<div>" + escape(item.name) + "</div>";
      }
    }
  });

  $(".selectize-model-multiple").selectize({
    allowEmptyOption: true,
    persist: false,
    plugins: {
      remove_button: {}
    },
    valueField: "id",
    labelField: "name",
    searchField: "name",
    create: false,
    load: function(query, callback) {
      if (!query.length) return callback();
      var model = $(this)[0].$input[0].getAttribute("data-model");
      var fields = $(this)[0].$input[0].getAttribute("data-fields");
      $.ajax({
        url: Routes.slash_admin_remote_selectize_path({
          format: "json"
        }),
        dataType: "json",
        data: {
          model_class: model,
          q: query,
          fields: fields.split(" ")
        },
        error: function() {
          callback();
        },
        success: function(res) {
          callback(res);
        }
      });
    },
    render: {
      option: function(item, escape) {
        return "<div>" + escape(item.name) + "</div>";
      }
    }
  });

  $(".bootstrap-datepicker").datepicker({
    language: I18n.currentLocale(),
    format: "yyyy-mm-dd"
  });

  $(".bootstrap-material-date").bootstrapMaterialDatePicker({
    lang: I18n.currentLocale(),
    weekStart: 1,
    cancelText: I18n.t("slash_admin.view.cancel"),
    time: false,
    clearButton: true,
    clearText: I18n.t("slash_admin.view.erase"),
    format: "YYYY-MM-DD"
  });

  $(".bootstrap-material-datetime").bootstrapMaterialDatePicker({
    lang: I18n.currentLocale(),
    weekStart: 1,
    cancelText: I18n.t("slash_admin.view.cancel"),
    clearButton: true,
    clearText: I18n.t("slash_admin.view.erase"),
    format: "YYYY-MM-DD HH:mm:ss"
  });

  $(".colorpicker").minicolors();

  $("#reset-filters").on("click", function(e) {
    e.preventDefault();

    $("input[name*='filters']").val("");
    $("select[name*='filters'] option:first").prop("selected", true);

    $("#filters").trigger("submit");
  });

  // Handle Both form
  function handleFiltersAndLocation() {
    var url = window.location.href.split("?")[0];

    var filtersParams = $("#filters").serialize();
    var paginationParams = $(".admin-pagination").first().serialize();
    var orderParams = $("#order").serialize();

    parameters = "";
    $.each([filtersParams, paginationParams, orderParams], function(
      index,
      params
    ) {
      if (index !== 0) {
        parameters += "&" + params;
      } else {
        parameters += params;
      }
    });

    window.location.href = url + "?" + parameters;
  }

  // Handle create belongs to
  $("#create-belongs-to-form")
    .on("ajax:success", function(e, data, status, xhr) {
      $("#create-belongs-to-form").text("Done.");
    })
    .on("ajax:error", function(e, xhr, status, error) {
      $("#create-belongs-to-form").text("Failed.");
    });
}
