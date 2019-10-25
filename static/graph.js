function init() {
    if (window.goSamples) goSamples();
    var $ = go.GraphObject.make;
    myDiagram =
      $(go.Diagram, "myDiagramDiv",
        {
          "undoManager.isEnabled": true
        });

    function nodeStyle() {
      return [
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        {
          locationSpot: go.Spot.Center
        }
      ];
    }

    function makePort(name, align, spot, output, input) {
      var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
      return $(go.Shape,
        {
          fill: "transparent",
          strokeWidth: 0,
          width: horizontal ? NaN : 4,
          height: !horizontal ? NaN : 4,
          alignment: align,
          stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
          portId: name,
          fromSpot: spot,
          fromLinkable: output,
          toSpot: spot,
          toLinkable: input,
          cursor: "pointer",
          mouseEnter: function(e, port) {
            if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
          },
          mouseLeave: function(e, port) {
            port.fill = "transparent";
          }
        });
    }

    function textStyle() {
      return {
        font: "bold 11pt Helvetica, Arial, sans-serif",
        stroke: "whitesmoke"
      }
    }

    myDiagram.nodeTemplateMap.add("dashedBox",
      $(go.Node, "Table", nodeStyle(),
        { resizable: true, resizeObjectName: "dRect" },
        $(go.Panel, "Auto",
          $(go.Shape, "Rectangle",
            {name:"dRect", width: 80, height: 80, fill: "transparent", strokeDashArray: [5,3]},
            new go.Binding("figure", "figure")),
            $(go.TextBlock,
            {
              alignment: go.Spot.TopLeft,
              alignmentFocus: new go.Spot(0, 0, -4, -4),
              font: "Bold 10pt Sans-Serif",
              editable: true
            },
          new go.Binding("text").makeTwoWay())
        ),
      ));

      myDiagram.nodeTemplateMap.add("voidBox",
        $(go.Node, "Table", nodeStyle(),
          { resizable: true, resizeObjectName: "dRect" },
          $(go.Panel, "Auto",
            $(go.Shape, "Rectangle",
              {name:"dRect", width: 80, height: 80, fill: "transparent"},
              new go.Binding("figure", "figure")),
              $(go.TextBlock,
              {
                alignment: go.Spot.TopLeft,
                alignmentFocus: new go.Spot(0, 0, -4, -4),
                font: "Bold 10pt Sans-Serif",
                editable: true
              },
            new go.Binding("text").makeTwoWay())
          ),
        ));

    myDiagram.nodeTemplateMap.add("box",
      $(go.Node, "Table", nodeStyle(),
        { resizable: true, resizeObjectName: "rect" },
        $(go.Panel, "Auto",
          $(go.Shape, "Rectangle",
            { name:"rect", width: 80, height: 80, fill: "#d3d3d3", strokeWidth: 1 },
            new go.Binding("figure", "figure")),
            $(go.TextBlock,
            {
              alignment: go.Spot.TopLeft,
              alignmentFocus: new go.Spot(0, 0, -4, -4),
              font: "Bold 10pt Sans-Serif",
              editable: true
            },
          new go.Binding("text").makeTwoWay())
      ),
      makePort("T", go.Spot.Top, go.Spot.Top, false, true),
      makePort("L", go.Spot.Left, go.Spot.Left, true, true),
      makePort("R", go.Spot.Right, go.Spot.Right, true, true),
      makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
    ));

    myDiagram.nodeTemplateMap.add("oval",
      $(go.Node, "Table", nodeStyle(),
        { resizable: true, resizeObjectName: "ov" },
        $(go.Panel, "Auto",
          $(go.Shape, "Circle",
            {name: "ov", width: 80, height: 80, fill: "transparent", strokeWidth: 1}),
        ),
          $(go.TextBlock,
          {
            alignment: go.Spot.TopLeft,
            alignmentFocus: new go.Spot(0, 0, -4, -4),
            font: "Bold 10pt Sans-Serif",
            editable: true
          },
          new go.Binding("text").makeTwoWay())
      ));

      myDiagram.nodeTemplateMap.add("filledOval",
        $(go.Node, "Table", nodeStyle(),
          { resizable: true, resizeObjectName: "ov" },
          $(go.Panel, "Auto",
            $(go.Shape, "Circle",
              {name: "ov", width: 80, height: 80, fill: "#d3d3d3", strokeWidth: 1}),
          ),
            $(go.TextBlock,
            {
              alignment: go.Spot.TopLeft,
              alignmentFocus: new go.Spot(0, 0, -4, -4),
              font: "Bold 10pt Sans-Serif",
              editable: true
            },
            new go.Binding("text").makeTwoWay())
        ));

    myDiagram.linkTemplate =
      $(go.Link,
        {
          curve: go.Link.Bezier,
          reshapable: true,
          mouseEnter: function(e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
          mouseLeave: function(e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; },
          selectionAdorned: false
        },
        new go.Binding("points").makeTwoWay(),
        $(go.Shape,
          { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
        $(go.Shape,
          { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
          new go.Binding("stroke", "isSelected", function(sel) { return sel ? "dodgerblue" : "green"; }).ofObject()),
      );

    myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

    myPalette =
      $(go.Palette, "myPaletteDiv",
        {
          nodeTemplateMap: myDiagram.nodeTemplateMap,
          model: new go.GraphLinksModel([
            { category: "oval", text: "oval"},
            { category: "filledOval", text: "filledOval"},
            { category: "dashedBox", text: "dashedBox"},
            { category: "voidBox", text: "box"},
            { category: "box" , text: "filledBox"}
          ])
        });
  }
