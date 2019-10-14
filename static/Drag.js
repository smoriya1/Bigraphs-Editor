interact('.draggable')
  .draggable({
    onmove: function(event) {
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
  })

  interact('.dropoff')
    .dropzone({
      accept: '.draggable',
      overlap: 1,
      ondropactivate: function (event) {
        event.target.classList.add('dragging')
      },
      ondropdeactivate: function (event) {
        event.target.classList.remove('dragging')
        event.target.classList.remove('cannot-drop')
        event.target.classList.remove('can-drop')
      },
      ondragenter: function (event) {
        event.target.classList.remove('cannot-drop')
        event.target.classList.add('can-drop')
      },
      ondragleave: function (event) {
        event.target.classList.remove('can-drop')
        event.target.classList.add('cannnot-drop')
      }
    })
