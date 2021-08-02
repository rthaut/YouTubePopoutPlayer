document.addEventListener("DOMContentLoaded", () => {
    /* global M */
    // M.AutoInit();

    // M.Autocomplete.init(document.querySelectorAll(".autocomplete"));
    // M.Carousel.init(document.querySelectorAll(".carousel"));
    // M.Chips.init(document.querySelectorAll(".chips"));
    // M.Collapsible.init(document.querySelectorAll(".collapsible"));
    // M.Datepicker.init(document.querySelectorAll(".datepicker"));
    M.Dropdown.init(document.querySelectorAll(".dropdown-trigger"));
    M.FloatingActionButton.init(document.querySelectorAll(".fixed-action-btn"), {
        hoverEnabled: false,
    });
    M.Materialbox.init(document.querySelectorAll(".materialboxed"));
    M.Modal.init(document.querySelectorAll(".modal"));
    // M.Parallax.init(document.querySelectorAll(".parallax"));
    // M.Pushpin.init(document.querySelectorAll(".pushpin"));
    M.ScrollSpy.init(document.querySelectorAll(".scrollspy"));
    // M.FormSelect.init(document.querySelectorAll("select"));
    M.Sidenav.init(document.querySelectorAll(".sidenav"));
    // M.Slider.init(document.querySelectorAll('.slider'));
    // M.Tabs.init(document.querySelectorAll(".tabs"));
    // M.TapTarget.init(document.querySelectorAll(".tap-target"));
    // M.Timepicker.init(document.querySelectorAll(".timepicker"));
    M.Tooltip.init(document.querySelectorAll(".tooltipped"));
});
