function init() {
    if (window.goSamples) goSamples();
    var GO = go.GraphObject.make;
    myDiagram =
      GO(go.Diagram, "myDiagramDiv",
        {
          "undoManager.isEnabled": true,
          mouseDrop: function(e) { finishDrop(e, null); }
        });

    function nodeStyle() {
      return [
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        {
          locationSpot: go.Spot.Center
        }
      ];
    }

    function textStyle() {
      return {
        font: "bold 11pt Helvetica, Arial, sans-serif",
        stroke: "whitesmoke"
      }
    }

    function finishDrop(e, grp) {
        var ok = (grp !== null
          ? grp.addMembers(grp.diagram.selection, true)
          : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
        if (!ok) e.diagram.currentTool.doCancel();
      }

    function highlightGroup(e, grp, show) {
        if (!grp) return;
        e.handled = true;
        if (show) {
          var tool = grp.diagram.toolManager.draggingTool;
          var map = tool.draggedParts || tool.copiedParts;
          if (grp.canAddMembers(map.toKeySet())) {
            grp.isHighlighted = true;
            return;
          }
        }
        grp.isHighlighted = false;
      }

    var maxLinks = 3;

    myDiagram.groupTemplateMap.add("dashedBox",
      GO(go.Group, "Table", nodeStyle(),
        { resizable: true,
          background: "transparent",
          resizeObjectName: "dBox",
          computesBoundsAfterDrag: true,
          mouseDrop: finishDrop,
          handlesDragDropForMembers: true,
          mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
          mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
        },
        new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
        GO(go.Panel, "Auto",
          GO(go.Shape, "Rectangle",
            { name:"dBox", width: 80, height: 80, fill: null, strokeDashArray: [5,3]},
            new go.Binding("figure", "figure")
          ),
          GO(go.TextBlock,
          {
            alignment: go.Spot.TopLeft,
            alignmentFocus: new go.Spot(0, 0, -4, -4),
            font: "Bold 10pt Sans-Serif",
            editable: true
          },
            new go.Binding("text").makeTwoWay()),
        ),
      ));

    myDiagram.groupTemplateMap.add("box",
      GO(go.Group, "Table", nodeStyle(),
        { resizable: true,
          background: "transparent",
          resizeObjectName: "dRect",
          mouseDrop: finishDrop,
          mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
          mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
          linkValidation: function(fromnode, fromport, tonode, toport) {
            return fromnode.linksConnected.count + tonode.linksConnected.count < maxLinks;
          }
        },
        new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
        GO(go.Panel, "Auto",
          GO(go.Shape, "Rectangle",
            {name:"dRect", width: 80, height: 80, fill: null, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"},
            new go.Binding("figure", "figure"),
            ),
            GO(go.TextBlock,
            {
              alignment: go.Spot.TopLeft,
              alignmentFocus: new go.Spot(0, 0, -4, -4),
              font: "Bold 10pt Sans-Serif",
              editable: true
            },
              new go.Binding("text").makeTwoWay()),
        ),
      ));

    myDiagram.nodeTemplateMap.add("filledBox",
      GO(go.Node, "Table", nodeStyle(),
        { resizable: true,
          resizeObjectName: "b",
          mouseDrop: function(e, nod) { finishDrop(e, nod.containingGroup); },
          linkValidation: function(fromnode, fromport, tonode, toport) {
            return fromnode.linksConnected.count + tonode.linksConnected.count < maxLinks;
          }
        },
        GO(go.Panel, "Auto",
          GO(go.Shape, "Rectangle",
            { name:"b", width: 80, height: 80, fill: "#d3d3d3", strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"},
            new go.Binding("figure", "figure"),
            new go.Binding("fill", "fill"),
            ),
            GO(go.TextBlock,
            {
              alignment: go.Spot.TopLeft,
              alignmentFocus: new go.Spot(0, 0, -4, -4),
              font: "Bold 10pt Sans-Serif",
              editable: true
            },
          new go.Binding("text").makeTwoWay()),
        ),
    ));

    myDiagram.groupTemplateMap.add("oval",
      GO(go.Group, "Table", nodeStyle(),
        { resizable: true,
          background: "transparent",
          resizeObjectName: "ov",
          mouseDrop: finishDrop,
          mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
          mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
          linkValidation: function(fromnode, fromport, tonode, toport) {
            return fromnode.linksConnected.count + tonode.linksConnected.count < maxLinks;
          }
        },
        new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
        GO(go.Panel, "Auto",
          GO(go.Shape, "ellipse",
            {name: "ov", width: 80, height: 80, fill: null, strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"},
            ),
          GO(go.TextBlock,
          {
            alignment: go.Spot.TopLeft,
            alignmentFocus: new go.Spot(0, 0, -4, -4),
            font: "Bold 10pt Sans-Serif",
            editable: true
          },
          new go.Binding("text").makeTwoWay())
        ),
      ));

    myDiagram.nodeTemplateMap.add("filledOval",
      GO(go.Node, "Table", nodeStyle(),
      { resizable: true,
        resizeObjectName: "fOv",
        mouseDrop: function(e, nod) { finishDrop(e, nod.containingGroup); },
        linkValidation: function(fromnode, fromport, tonode, toport) {
          return fromnode.linksConnected.count + tonode.linksConnected.count < maxLinks;
        }
      },
        GO(go.Panel, "Auto",
          GO(go.Shape, "ellipse",
            {name: "fOv", width: 80, height: 80, fill: "#d3d3d3", strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"},
          new go.Binding("fill", "fill"),
          ),
          GO(go.TextBlock,
          {
            alignment: go.Spot.TopLeft,
            alignmentFocus: new go.Spot(0, 0, -4, -4),
            font: "Bold 10pt Sans-Serif",
            editable: true
          },
          new go.Binding("text").makeTwoWay())
        ),
      ));

      myDiagram.nodeTemplateMap.add("external",
        GO(go.Node, "Table", nodeStyle(),
          GO(go.Panel, "Auto",
            GO(go.Shape, "square",
              {fill: "transparent", strokeWidth: 0, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"}),
            GO(go.TextBlock,
              "ext",
            {
              alignment: go.Spot.Center,
              font: "Bold 10pt Sans-Serif",
              editable: true
            },
            new go.Binding("text").makeTwoWay())
          ),
        ));

      myDiagram.nodeTemplateMap.add("LinkLabel",
        GO("Node",
          {
            selectable: false, avoidable: false,
            layerName: "Foreground"
          },
          GO("Shape", "Ellipse",
            {
              width: 5, height: 5, stroke: null,
              portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"
            })
        ));

    myDiagram.linkTemplateMap.add("multiLinks",
      GO("Link",
        { relinkableFrom: true, relinkableTo: true },
        GO("Shape", { stroke: "#2D9945", strokeWidth: 2 })
      ));

    myDiagram.model =
        GO(go.GraphLinksModel,
          { linkLabelKeysProperty: "labelKeys" });

    myDiagram.toolManager.linkingTool.archetypeLabelNodeData = { category: "LinkLabel" };

    myDiagram.linkTemplate =
      GO(go.Link,
        {
          curve: go.Link.Bezier,
          reshapable: true,
          mouseEnter: function(e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
          mouseLeave: function(e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; },
          selectionAdorned: false
        },
        new go.Binding("points").makeTwoWay(),
        GO(go.Shape,
          { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
        GO(go.Shape,
          { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
          new go.Binding("stroke", "isSelected", function(sel) { return sel ? "dodgerblue" : "green"; }).ofObject()),
      );

    myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

    myPalette =
      GO(go.Palette, "myPaletteDiv",
        {
          nodeTemplateMap: myDiagram.nodeTemplateMap,
          groupTemplateMap: myDiagram.groupTemplateMap,
          model: new go.GraphLinksModel([
            { key: "env", category: "dashedBox", text:"env", isGroup: true },
            { key: "ext", category: "external" },
            { key: "groupNode", category: "oval", text: "gNode", isGroup: true },
            { key: "node", category: "filledOval", text: "node", fill: "#d3d3d3" },
            { key: "groupNode", category: "box", text: "gNode", isGroup: true },
            { key: "node", category: "filledBox" , text: "node", fill: "#d3d3d3"}
          ])
        });

    $(function() {
        $("#draggablePanel").draggable({ handle: "#infoDraggable" });
        var inspector = new Inspector('Info', myDiagram,
          {
            properties: {
              "key": { readOnly: true, show: Inspector.showIfPresent },
              "fill": { show: Inspector.showIfPresent, type: 'color' }
            }
          });
      });
  }
