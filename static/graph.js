function init() {
    if (window.goSamples) goSamples();
    var GO = go.GraphObject.make;
    myDiagram =
      GO(go.Diagram, "myDiagramDiv",
        {
          "undoManager.isEnabled": true,
          mouseDrop: function(e) { finishDrop(e, null); },
          ExternalObjectsDropped: addEntryFromPalette
        });

    function nodeStyle() {
      return [
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        {
          locationSpot: go.Spot.Center,
        }
      ];
    }

    function textStyle() {
      return {
        font: "bold 11pt Helvetica, Arial, sans-serif",
        stroke: "whitesmoke"
      };
    }

    function finishDrop(e, grp) {
        var ok = (grp !== null ? grp.addMembers(grp.diagram.selection, true)
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

    myDiagram.groupTemplateMap.add("dashedBox",
      GO(go.Group, "Table", nodeStyle(),
        { resizable: true,
          background: "transparent",
          resizeObjectName: "dBox",
          computesBoundsAfterDrag: true,
          mouseDrop: finishDrop,
          handlesDragDropForMembers: true,
          memberAdded: updateDict,
          memberRemoved: deleteDict,
          mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
          mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
        },
        new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
        GO(go.Panel, "Auto",
          GO(go.Shape, "Rectangle",
            { name:"dBox", width: 80, height: 80, fill: null, strokeDashArray: [5,3]}
          ),
        ),
      ));

    myDiagram.groupTemplateMap.add("box",
      GO(go.Group, "Table", nodeStyle(),
        { resizable: true,
          background: "transparent",
          resizeObjectName: "dRect",
          mouseDrop: finishDrop,
          memberAdded: updateDict,
          memberRemoved: deleteDict,
          mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
          mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
          linkValidation: function(fromnode, fromport, tonode, toport) {
            return fromnode.linksConnected.count + tonode.linksConnected.count < fromnode.data.maxLinks;
          }
        },
        new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
        GO(go.Panel, "Auto",
          GO(go.Shape, "Rectangle",
            {name:"dRect", width: 80, height: 80, fill: null, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"}
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
            return fromnode.linksConnected.count + tonode.linksConnected.count < fromnode.data.maxLinks;
          }
        },
        GO(go.Panel, "Auto",
          GO(go.Shape, "Rectangle",
            { name:"b", width: 80, height: 80, fill: "#d3d3d3", strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer" },
            new go.Binding("fill", "fill")
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
          memberAdded: updateDict,
          memberRemoved: deleteDict,
          mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
          mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
          linkValidation: function(fromnode, fromport, tonode, toport) {
            return fromnode.linksConnected.count + tonode.linksConnected.count < fromnode.data.maxLinks;
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
          return fromnode.linksConnected.count + tonode.linksConnected.count < fromnode.data.maxLinks;
        }
      },
        GO(go.Panel, "Auto",
          GO(go.Shape, "ellipse",
            {name: "fOv", width: 80, height: 80, fill: "#d3d3d3", strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"},
          new go.Binding("fill", "fill")
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

    myDiagram.groupTemplateMap.add("hex",
      GO(go.Group, "Table", nodeStyle(),
        { resizable: true,
          background: "transparent",
          resizeObjectName: "hx",
          mouseDrop: finishDrop,
          memberAdded: updateDict,
          memberRemoved: deleteDict,
          mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
          mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
          linkValidation: function(fromnode, fromport, tonode, toport) {
            return fromnode.linksConnected.count + tonode.linksConnected.count < fromnode.data.maxLinks;
          }
        },
        new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
        GO(go.Panel, "Auto",
          GO(go.Shape, "Hexagon",
            {name: "hx", width: 80, height: 80, fill: null, strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"}
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

    myDiagram.nodeTemplateMap.add("filledHex",
      GO(go.Node, "Table", nodeStyle(),
      { resizable: true,
        resizeObjectName: "fHx",
        mouseDrop: function(e, nod) { finishDrop(e, nod.containingGroup); },
        linkValidation: function(fromnode, fromport, tonode, toport) {
          return fromnode.linksConnected.count + tonode.linksConnected.count < fromnode.data.maxLinks;
        }
      },
        GO(go.Panel, "Auto",
          GO(go.Shape, "Hexagon",
            {name: "fHx", width: 80, height: 80, fill: "#d3d3d3", strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"},
          new go.Binding("fill", "fill")
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
          selectable: false,
          avoidable: false,
          layerName: "Foreground"
        },
        GO("Shape", "Ellipse",
          { width: 5, height: 5, stroke: null, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer" }
        )
      ));

    myDiagram.nodeTemplateMap.add("id",
      GO(go.Node, "Table", nodeStyle(),
        {
          resizable: true,
          resizeObjectName: "id"
        },
        GO(go.Panel, "Auto",
          GO(go.Shape, "roundedRectangle",
            { name: "id", fill: "#A9A9A9", width: 80, height: 80, strokeDashArray: [5,3]})
          ),
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
        GO(go.Shape,
          { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
        GO(go.Shape,
          { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
          new go.Binding("stroke", "isSelected", function(sel) { return sel ? "dodgerblue" : "green"; }).ofObject()),
      );

    myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

    var tree = [];

    function updateDict(group, part) {
      envLst = [];
      myDiagram.findTreeRoots().each(function(node){
        envLst.push(node.key)
      });
      console.log(envLst)
      for (var i = 0; i<envLst.length; i++){
        var n = findObjectById(tree, envLst[i]);
        if (n.parent != "root") {
          deleteDuplicate(tree, envLst[i]);
          tree.push(n);
        }
      }
      var cpy = findObjectById(tree, part.key);
      var temp = findObjectById(tree, group.key);
      if (cpy){
        deleteDuplicate(tree, part.key);
        temp.children.push(cpy);
      }
      else{
        temp.children.push({
          key: part.key,
          parent: group.key,
          children: []
        });
      }
      console.log(tree);
    }

    function deleteDict(group, part){

    }

    function findNode(){
      myDiagram.nodes.each(function(n) {
        console.log("nodes: ",n.data);
      });
    }

    function deleteDuplicate(obj, key){
      for (var x in obj){
        if (obj[x].key == key){
          if (x > -1) {
            obj.splice(x, 1);
            return null;
          }
        }
        if(obj[x].children){
           for(var i=0;i<obj[x].children.length;i++)
               deleteDuplicate(obj[x].children, key);
        }
      }
    }

    myDiagram.addDiagramListener("SelectionDeleted",
      function(e) {
        e.subject.each(function(node) {
          deleteDuplicate(tree, node.nb.key);
        });
        console.log(tree);
      });

/*
function addEntryFromPalette(e) {
            // e.subject is a go.Set of the dropped Parts
            e.subject.each(function(p) {
              if (p instanceof go.Node) console.log(p.key);
            })

        }
*/


    function addEntryFromPalette(e) {
      if (!(e.subject.cf.key.part.containingGroup)){
        tree.push({
          key: e.subject.cf.key.nb.key,
          parent: "root",
          children: []
        });
        console.log(tree);
      }
    }

    function findObjectById(obj, k) {
      for (var x in obj) {
          if (obj[x].key == k) {
            return obj[x];
          }
          else if (obj[x].children.length){
            for (var x2 in obj[x].children){
               result = findObjectById(obj[x].children,k);
               if (result){
                 return result;
               }
            }
          }
      }
    }

    myPalette =
      GO(go.Palette, "myPaletteDiv",
        {
          nodeTemplateMap: myDiagram.nodeTemplateMap,
          groupTemplateMap: myDiagram.groupTemplateMap,
          model: new go.GraphLinksModel([
            { key: "env", category: "dashedBox", isGroup: true },
            { key: "id", category: "id" },
            { key: "ext", category: "external" },
            { key: "gOval", category: "oval", text: "gOval", isGroup: true, maxLinks: Infinity },
            { key: "oval", category: "filledOval", text: "oval", fill: "#d3d3d3", maxLinks: Infinity },
            { key: "gBox", category: "box", text: "gBox", isGroup: true, maxLinks: Infinity },
            { key: "box", category: "filledBox" , text: "box", fill: "#d3d3d3", maxLinks: Infinity },
            { key: "gHex", category: "hex", text: "gHex", isGroup: true, maxLinks: Infinity },
            { key: "hex", category: "filledHex", text: "hex", fill: "#d3d3d3", maxLinks: Infinity }
          ])
        });

    $(function() {
        $("#draggablePanel").draggable({ handle: "#infoDraggable" });
        var inspector = new Inspector('Info', myDiagram,
          {
            properties: {
              key: { readOnly: true, show: Inspector.showIfPresent },
              "category": { readOnly: true, show: Inspector.showIfPresent },
              "isGroup": { readOnly: true, show: Inspector.showIfPresent },
              "fill": { show: Inspector.showIfPresent, type: 'color' },
              maxLinks: { type: "number", show: Inspector.showIfNode }
            }
          });
      });
  }
