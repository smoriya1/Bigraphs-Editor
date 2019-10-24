interact('.draggable')
  .draggable({
    onmove:dragMoveListener,
  })
  .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
  })
  .on('resizemove', resizeListener)

interact('.dropoff')
  .draggable({
    onmove:dragMoveListener,
  })
  .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
  })
  .on('resizemove', resizeListener)
  .dropzone({
    accept: '.draggable',
    overlap: 1,
    ondropactivate: function (event) {
      event.target.classList.add('dragging');
    },
    ondropdeactivate: function (event) {
      event.target.classList.remove('dragging');
      event.target.classList.remove('cannot-drop');
      event.target.classList.remove('drop-target');
    },
    ondragenter: function (event) {
      event.target.classList.add('drop-target');
      event.relatedTarget.classList.add('can-drop');
    },
    ondragleave: function (event) {
      event.relatedTarget.classList.remove('can-drop');
      event.target.classList.add('cannnot-drop');
      event.target.classList.remove('drop-target');
    }
  })

function dragMoveListener (event) {
  var target = event.target;
  var x = target.getAttribute('data-x');
  var y = target.getAttribute('data-y');
  var initX = parseFloat(x)||0;
  var initY = parseFloat(y)||0;
  var deltaX = event.dx;
  var deltaY = event.dy;
  var newX = initX + deltaX;
  var newY = initY + deltaY;
  target.style.transform = `translate(${newX}px, ${newY}px)`;
  target.setAttribute('data-x', newX);
  target.setAttribute('data-y', newY);
}

function resizeListener (event) {
  var target = event.target
  var x = (parseFloat(target.getAttribute('data-x')) || 0);
  var y = (parseFloat(target.getAttribute('data-y')) || 0);
  target.style.width = event.rect.width + 'px';
  target.style.height = event.rect.height + 'px';
  x += event.deltaRect.left;
  y += event.deltaRect.top;
  target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

$(document).ready(function() {
  var dict = {};
  dict["sq"] = '<div id="bsq" class="draggable"></div>';
  dict["dsq"] = '<div id="bdsq" class="dropoff"></div>';
  dict["dov"] = '<div id="bdov" class="dropoff"></div>';
  $('.btn').click(function() {
    var id = $(this).attr('id');
    $("body").append(dict[id]);
  });
});
