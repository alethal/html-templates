document.addEventListener("DOMContentLoaded", function(event) {
  var gridzyElement = document.querySelector('.gridzy'), gridzyInstance, changedHandler;
  if (gridzyElement && gridzyElement.gridzy) {
    gridzyInstance = gridzyElement.gridzy;
    changedHandler = gridzyInstance.getOption('onOptionsChanged');

    function update() {
      var filter = decodeURIComponent((location.hash).replace(/^#/, '').replace(/\&.*$/, '') || '');
      if (filter && filter !== gridzyInstance.getOption('filter')) {
        gridzyInstance.setOptions({
          filter: filter
        });
      }
    }
    window.addEventListener('hashchange', update);
    update();

    gridzyInstance.setOptions({
      onOptionsChanged: function(gridzy) {
        var filter = gridzy.getOption('filter');
        var hash = '#' + filter && filter !== '*' ? encodeURIComponent(filter) + (location.hash).replace(/^[^&]*(&.*)?$/, '$1') : '';
        if (location.hash !== hash) {
          location.hash = hash;
        }
        changedHandler(gridzy);
      }
    });
  }
});
