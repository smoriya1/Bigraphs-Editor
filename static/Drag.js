interact('.draggable')
  .draggable({
    max: Infinity,

    onmove: function(event) {
      var target = event.target,
        x = (parseFloat(target.getAttribute('data-x'))||0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y'))||0) + event.dy;
      target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      target.setAttribute('data-x',x);
      target.setAttribute('data-y',y);
    },
    onend: function (event) {
      var textEl = event.target.querySelector('p');
    }
  })
  .restrict({
    drag: "parent",
    endOnly: true,
    elementRect: {top: 0, left: 0, bottom: 1, right: 1}
  })
  .snap({mode: 'path', paths: [function(x,y) {
    var dropzoneRect = interact.getElementRect(document.getElementbyId('dropzone'));
    if(x >= dropzoneRect.left && x <= dropzoneRect.right && y >= dropzoneRect.top &&
    y <= dropzoneRect.bottom) {
      return {
        x: dropzoneRect.left + dropzoneRect.width/2,
        y: dropzoneRect.left + dropzoneRect.height/2,
        range: Infinity
      }
    }
    return {x:x, y:y};
  }],
  range: Infinity,
  elementOrigin: {x:0.5,y:0.5},
  endOnly: true
});
