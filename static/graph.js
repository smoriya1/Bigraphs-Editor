function init() {
    if (window.goSamples) goSamples();
    var GO = go.GraphObject.make;
    myDiagram =
      GO(go.Diagram, "myDiagramDiv",
        {
          "undoManager.isEnabled": true,
          mouseDrop: function(e) { finishDrop(e, null); },
          ExternalObjectsDropped: addEntryFromPalette,
          "LinkDrawn": linkCheck,
          "LinkRelinked": linkCheck
        });

    function nodeStyle() {
      return [
        new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify),
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

    function context(type) {
      var cntx = GO("ContextMenu");
      var panel =
        GO(go.Panel, "Auto",
          GO(go.Shape, "Rectangle",
            {fill: "#FFFFFF", strokeWidth: 1},
          ));
      if (type == "env") {
        panel.add(
          GO(go.TextBlock, "Entity Type: environment",
            {font: "Bold 10pt Sans-Serif", margin: 5 }
          ));
        cntx.add(panel);
        return cntx;
      }
      else if (type == "atomic") {
        panel.add(
          GO(go.TextBlock, "Entity Type: atomic",
            {font: "Bold 10pt Sans-Serif", margin: 5 }
          ));
        cntx.add(panel);
        return cntx;
      }
      else if (type == "nonatomic"){
        panel.add(
          GO(go.TextBlock, "Entity Type: non-atomic",
            {font: "Bold 10pt Sans-Serif", margin: 5 }
          ));
        cntx.add(panel);
        return cntx;
      }
      else if (type == "ext") {
        panel.add(
          GO(go.TextBlock, "Entity Type: name",
            {font: "Bold 10pt Sans-Serif", margin: 5 }
          ));
        cntx.add(panel);
        return cntx;
      }
      else if (type == "id") {
        panel.add(
          GO(go.TextBlock, "Entity Type: identity",
            {font: "Bold 10pt Sans-Serif", margin: 5 }
          ));
        cntx.add(panel);
        return cntx;
      }
    }

    function enter(e, obj) {
      var shape = obj.findObject("drag");
      shape.fill = "#6DAB80";
      shape.strokeWidth = 1;
      shape.stroke = "#A6E6A1";
    };

    function leave(e, obj) {
        var shape = obj.findObject("drag");
        shape.fill = "transparent";
        shape.strokeWidth = 0;
    };

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

    function linkCheck(e) {
      var link = e.subject;
      if (typeof link.data.to == "number" && typeof link.data.from == "number") {
        alert("Error, inavlid operation");
        myDiagram.remove(link);
      }
      else if (typeof link.data.to == "number") {
        var edgeLinks = myDiagram.findPartForKey(link.data.from).findLinksOutOf();
        var error = false;
        edgeLinks.each(function(n) {
          if (n.data.labelKeys == link.data.to) {
            alert("Error, inavlid operation");
            error = true;
            return null;
          }
        });
        if (error){
          myDiagram.remove(link);
        }
      }
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
          {insertAt: -1},
          GO(go.Shape, "Rectangle",
            { name:"dBox", fill: null, fromLinkable: false, toLinkable: false, strokeDashArray: [5,3]},
            new go.Binding("width").makeTwoWay(),
            new go.Binding("height").makeTwoWay()
          ),
        ),
        {
          contextMenu: context("env")
        }
      ));

    myDiagram.groupTemplateMap.add("box",
      GO(go.Group, "Table", nodeStyle(),
        { resizable: true,
          resizeObjectName: "dRect",
          mouseDrop: finishDrop,
          mouseEnter: enter,
          mouseLeave: leave,
          memberAdded: updateDict,
          memberRemoved: deleteDict,
          mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
          mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
          linkValidation: validation
        },
        new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
        GO(go.Panel, "Auto",
          GO(go.Shape, "Rectangle",
            {name:"dRect", fill: null, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"},
            new go.Binding("width").makeTwoWay(),
            new go.Binding("height").makeTwoWay()
            ),
          GO(go.Shape, "Rectangle",
            { name: "drag", alignment: go.Spot.TopLeft, width: 10, height: 10, strokeWidth: 0, fill: "transparent", fromLinkable: false, toLinkable: false}),
            GO(go.TextBlock,
            {
              alignment: go.Spot.TopLeft,
              alignmentFocus: new go.Spot(0, 0, -4, -4),
              font: "Bold 10pt Sans-Serif"
            },
              new go.Binding("text").makeTwoWay()),
        ),
        {
          contextMenu: context("nonatomic")
        }
      ));

    myDiagram.nodeTemplateMap.add("filledBox",
      GO(go.Node, nodeStyle(), "Viewbox",
        { resizable: true,
          resizeObjectName: "b",
          mouseDrop: function(e, nod) { finishDrop(e, nod.containingGroup); },
          mouseEnter: enter,
          mouseLeave: leave,
          linkValidation: validation
        },
        GO(go.Panel, "Auto",
          GO(go.Shape, "Rectangle",
            { name:"b", strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer" },
            new go.Binding("fill", "fill"),
            new go.Binding("width").makeTwoWay(),
            new go.Binding("height").makeTwoWay()
            ),
          GO(go.Shape, "Rectangle",
            { name: "drag", alignment: go.Spot.TopLeft, width: 10, height: 10, strokeWidth: 0, fill: "transparent", fromLinkable: false, toLinkable: false}),
            GO(go.TextBlock,
              {
                alignment: go.Spot.TopLeft,
                alignmentFocus: new go.Spot(0, 0, -4, -4),
                font: "Bold 10pt Sans-Serif",
                editable: true
              },
              new go.Binding("text").makeTwoWay()),
        ),
        {
          contextMenu: context("atomic")
        }
      ));

    myDiagram.groupTemplateMap.add("oval",
      GO(go.Group, "Table", nodeStyle(),
        { resizable: true,
          background: "transparent",
          resizeObjectName: "ov",
          mouseEnter: enter,
          mouseLeave: leave,
          mouseDrop: finishDrop,
          memberAdded: updateDict,
          memberRemoved: deleteDict,
          mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
          mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
          linkValidation: validation
        },
        new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
        GO(go.Panel, "Auto",
          GO(go.Shape, "ellipse",
            {name: "ov", fill: null, strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"},
            new go.Binding("width").makeTwoWay(),
            new go.Binding("height").makeTwoWay()
            ),
          GO(go.Shape, "Rectangle",
            { name: "drag", alignment: go.Spot.TopLeft, width: 10, height: 10, strokeWidth: 0, fill: "transparent", fromLinkable: false, toLinkable: false}),
          GO(go.TextBlock,
          {
            alignment: go.Spot.TopLeft,
            alignmentFocus: new go.Spot(0, 0, -4, -4),
            font: "Bold 10pt Sans-Serif"
          },
          new go.Binding("text").makeTwoWay())
        ),
        {
          contextMenu: context("nonatomic")
        }
      ));

    myDiagram.nodeTemplateMap.add("filledOval",
      GO(go.Node, "Table", nodeStyle(),
      { resizable: true,
        resizeObjectName: "fOv",
        mouseEnter: enter,
        mouseLeave: leave,
        mouseDrop: function(e, nod) { finishDrop(e, nod.containingGroup); },
        linkValidation: validation
      },
        GO(go.Panel, "Auto",
          GO(go.Shape, "ellipse",
            {name: "fOv", strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"},
          new go.Binding("fill", "fill"),
          new go.Binding("width").makeTwoWay(),
          new go.Binding("height").makeTwoWay()
          ),
          GO(go.Shape, "Rectangle",
            { name: "drag", alignment: go.Spot.TopLeft, width: 10, height: 10, strokeWidth: 0, fill: "transparent", fromLinkable: false, toLinkable: false}),
          GO(go.TextBlock,
            {
              alignment: go.Spot.TopLeft,
              alignmentFocus: new go.Spot(0, 0, -4, -4),
              font: "Bold 10pt Sans-Serif"
            },
          new go.Binding("text").makeTwoWay())
        ),
        {
          contextMenu: context("atomic")
        }
      ));

    myDiagram.groupTemplateMap.add("hex",
      GO(go.Group, "Table", nodeStyle(),
        { resizable: true,
          background: "transparent",
          resizeObjectName: "hx",
          mouseEnter: enter,
          mouseLeave: leave,
          mouseDrop: finishDrop,
          memberAdded: updateDict,
          memberRemoved: deleteDict,
          mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
          mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
          linkValidation: validation
        },
        new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
        GO(go.Panel, "Auto",
          GO(go.Shape, "Hexagon",
            {name: "hx", fill: null, strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"},
            new go.Binding("width").makeTwoWay(),
            new go.Binding("height").makeTwoWay()
            ),
        GO(go.Shape, "Rectangle",
          { name: "drag", alignment: go.Spot.TopLeft, width: 10, height: 10, strokeWidth: 0, fill: "transparent", fromLinkable: false, toLinkable: false}),
          GO(go.TextBlock,
          {
            alignment: go.Spot.TopLeft,
            alignmentFocus: new go.Spot(0, 0, -4, -4),
            font: "Bold 10pt Sans-Serif"
          },
          new go.Binding("text").makeTwoWay())
        ),
        {
          contextMenu: context("nonatomic")
        }
      ));


    myDiagram.nodeTemplateMap.add("filledHex",
      GO(go.Node, "Table", nodeStyle(),
      { resizable: true,
        mouseEnter: enter,
        mouseLeave: leave,
        resizeObjectName: "fHx",
        mouseDrop: function(e, nod) { finishDrop(e, nod.containingGroup); },
        linkValidation: validation
      },
        GO(go.Panel, "Auto",
          GO(go.Shape, "Hexagon",
            {name: "fHx", strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"},
          new go.Binding("fill", "fill"),
          new go.Binding("width").makeTwoWay(),
          new go.Binding("height").makeTwoWay()
          ),
          GO(go.Shape, "Rectangle",
            { name: "drag", alignment: go.Spot.TopLeft, width: 10, height: 10, strokeWidth: 0, fill: "transparent", fromLinkable: false, toLinkable: false}),
          GO(go.TextBlock,
            {
              alignment: go.Spot.TopLeft,
              alignmentFocus: new go.Spot(0, 0, -4, -4),
              font: "Bold 10pt Sans-Serif"
            },
            new go.Binding("text").makeTwoWay())
        ),
        {
          contextMenu: context("atomic")
        }
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
            font: "Bold 10pt Sans-Serif"
          },
          new go.Binding("text").makeTwoWay())
        ),
        {
          contextMenu: context("ext")
        }
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
            { name: "id", fill: "#A9A9A9", strokeDashArray: [5,3]},
            new go.Binding("width").makeTwoWay(),
            new go.Binding("height").makeTwoWay()
          )
          ),
          {
            contextMenu: context("id")
          }
        ));

/*
    myDiagram.linkTemplateMap.add("multiLinks",
      GO("Link",
        { relinkableFrom: true, relinkableTo: true },
      GO("Shape", { stroke: "#2D9945", strokeWidth: 2 })
      ));
      */

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
        GO(go.TextBlock,
          {
            segmentOffset: new go.Point(0, -10),
            segmentOrientation: go.Link.OrientUpright,
            font: "Bold 10pt Sans-Serif"
          },
          new go.Binding("text","label").makeTwoWay())
      );

    myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

    var tree = [];
    var toDiagram = [];
    var externalNames = [];
    loadedJson = false;

    function convertToImg() {
      var res = myDiagram.makeImageData({
        scale: 1,
        background: "white"
      });
      return res;
    }

    function convertToSVG() {
      var res = myDiagram.makeSvg({
        scale: 1,
        background: "white"
      });
      return res;
    }

    function validation (fromnode, fromport, tonode, toport) {
      return fromnode.linksConnected.count + tonode.linksConnected.count < fromnode.data.maxLinks;
    }

    function updateDict(group, part) {
      //console.log("updated: "+loadedJson + " : "+ part.key);
      if (!part.key || typeof part.key == "number" || ~part.key.indexOf("env") != 0 || ~part.key.indexOf("ext") != 0) {
        //console.log(tree);
        return null;
      }
      if (loadedJson) {
        return null;
      }
      var cpy;
      var index = toDiagram.indexOf(part.key);
      if (index >= 0) {
        for (x in tree) {
          if (tree[x].key == part.key) {
            cpy = findObjectById(tree, part.key);
            tree.splice(x, 1);
            toDiagram.splice(index, 1);
            break;
          }
        }
      }
      var temp = findObjectById(tree, group.key);
      if (cpy){
        deleteDuplicate(tree, part.key);
        temp.children.push(cpy);
      }
      else{
        temp.children.push({
          key: part.key,
          type: findType(part.key),
          children: []
        });
      }
      //console.log(tree);
    }

    function deleteDict(group, part) {
      if (!part.key || typeof part.key == "number" || ~part.key.indexOf("env") != 0 || ~part.key.indexOf("ext") != 0) {
        //console.log("null");
        return null;
      }
      toDiagram.push(part.key);
      var cpy = findObjectById(tree, part.key);
      deleteDuplicate(tree, part.key);
      tree.push(cpy);
      //console.log(toDiagram);
      //console.log(tree);
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
          if (!node.data.key || typeof node.data.key  == "number") {
            return null;
          }
          else if (~node.data.key.indexOf("ext") != 0) {
            var index = externalNames.indexOf(node.data.key);
            externalNames.splice(index, 1);
          }
          else {
            deleteDuplicate(tree, node.data.key);
          }
          if (!node.data.key.containingGroup) {
            toDiagram.splice(toDiagram.indexOf(node.data.key), 1);
          }
        });
      });

    function addEntryFromPalette(e) {
      if (loadedJson) {
        //loadedJson = false;
        return null;
      }
      e.subject.each(function(p) {
        //console.log(p.containingGroup);
        if (!(p.containingGroup) && ~p.key.indexOf("ext") == 0) {
          tree.push({
            key: p.key,
            type: findType(p.key),
            children: []
          });
          toDiagram.push(p.key);
        }
        else if (~p.key.indexOf("ext") != 0) {
          externalNames.push(p.key);
        }
      })
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

    function findType(key) {
      if (~key.indexOf("env") != 0) {
        return "env";
      }
      else if (~key.indexOf("id") != 0) {
        return "id";
      }
      else {
        return "node";
      }
    }

    var resString = [];
    var linkNames = [];
    var validLinks = true;

    function generate() {
      var res;
      var nullExt = [];

      for (var x in tree) {
        if (tree[x].type != "env" && tree[x].type != "ext") {
          resString = [];
          linkNames = [];
          return "Error, entities not included in environment node";
        }
      }
      str(tree);
      if (validLinks) {
        for (var i in externalNames) {
          var label = myDiagram.findPartForKey(externalNames[i]).data.text;
          //console.log(externalNames[i]);
          var links = myDiagram.findPartForKey(externalNames[i]).findLinksConnected();
          if (links.count == 0) {
            nullExt.push(label);
          }
          else {
            error = false;
            links.each(function(n) {
              if (n.data.label !== label) {
                error = true;
                return null;
              }
            });
            if (error) {
              resString = [];
              linkNames = [];
              return "Error, external name and link name doesn't match";
            }
          }
          var index = linkNames.indexOf(label);
          if (index != -1) {
            linkNames.splice(index,1);
          }
        }
        var temp = [];
        var temp2 = [];
        for (var j = 0; j < linkNames.length; j++) {
          temp.push("/"+linkNames[j]);
        }
        for (var k = 0; k < nullExt.length; k++) {
          temp2.push("||{"+nullExt[k]+"}");
        }
        temp = temp.join("");
        resString = resString.join("");
        temp2 = temp2.join("");
        res = temp.concat(resString);
        res = res.concat(temp2);
      }
      resString = [];
      linkNames = [];
      if (!validLinks) {
        validLinks = true;
        return "Error, link label is missing";
      }
      return res;
    }

    function str(obj) {
      for (var x in obj) {
        if (obj[x].type != "env") {
          if (obj[x].type == "id") {
            resString.push(obj[x].type);
          }
          else {
            resString.push(myDiagram.findPartForKey(obj[x].key).data.text);
            var links = myDiagram.findPartForKey(obj[x].key).findLinksConnected();
            if (links.count > 0) {
              var counter = 0;
              resString.push("{");
              links.each(function(n) {
                if (n.data.label == undefined) {
                  //console.log("Error, link label is missing");
                  validLinks = false;
                }
                else {
                  var index = ~linkNames.indexOf(n.data.label);
                  if (index == 0) {
                    linkNames.push(n.data.label);
                  }
                  if (counter == links.count-1) {
                    resString.push(n.data.label);
                  }
                  else {
                    resString.push(n.data.label + ",");
                  }
                }
                counter++;
              });
              resString.push("}");
            }
            resString.push(".");
          }
        }
        if (obj[x].children.length == 0 && obj.length-1 != x) {
          if (obj[x].type == "id") {
            resString.push("|");
          }
          else {
            resString.push("1|");
          }
        }
        else if (obj[x].children.length == 0 && obj.length-1 == x) {
          if (obj[x].type != "id") {
            resString.push("1");
          }
        }
        else {
          resString.push("(");
          str(obj[x].children);
          if (obj.length-1 != x) {
            resString.push(")|");
          }
          else {
            resString.push(")");
          }
        }
        if (obj[x].type == "env" && obj.length-1 != x) {
          resString.push("|");
        }
      }
    }

    myPalette =
      GO(go.Palette, "myPaletteDiv",
        {
          layout: GO(go.GridLayout, { alignment: go.GridLayout.Location }),
          nodeTemplateMap: myDiagram.nodeTemplateMap,
          groupTemplateMap: myDiagram.groupTemplateMap,
          model: new go.GraphLinksModel([
            { key: "env", category: "dashedBox", width: 80, height: 80, isGroup: true },
            { key: "id", category: "id", width: 80, height: 80 },
            { key: "ext", category: "external", text: "name" },
            { key: "gOval", category: "oval", text: "gOval", width: 80, height: 80, isGroup: true, maxLinks: Infinity },
            { key: "oval", category: "filledOval", text: "oval", width: 80, height: 80, fill: "#d3d3d3", maxLinks: Infinity },
            { key: "gBox", category: "box", text: "gBox", width: 80, height: 80, isGroup: true, maxLinks: Infinity },
            { key: "box", category: "filledBox" , text: "box", width: 80, height: 80, fill: "#d3d3d3", maxLinks: Infinity },
            { key: "gHex", category: "hex", text: "gHex", width: 80, height: 80, isGroup: true, maxLinks: Infinity },
            { key: "hex", category: "filledHex", text: "hex", width: 80, height: 80, fill: "#d3d3d3", maxLinks: Infinity }
          ])
        });

    function checkValidKeyNames(diagram,tree,ext) {
      var bool = false;
      //console.log(diagram.nodeDataArray);
      for (var x in diagram.nodeDataArray) {
        //console.log(diagram.nodeDataArray[x].key);
        if (diagram.nodeDataArray[x].category == "LinkLabel") {
          continue;
        }
        if (diagram.nodeDataArray[x].category == "external") {
          if (ext.includes(diagram.nodeDataArray[x].key)) {
            continue;
          }
          else {
            bool = true;
            break;
          }
        }
        var result = findObjectById(tree,diagram.nodeDataArray[x].key);
        if (!result) {
          bool = true;
          break;
        }
      }

      if (bool) {
        //console.log("Error");
        return true;
      }
      else {
        //console.log("OK");
        return false;
      }
    }

    function checkModelDuplicates(k) {
      model = myPalette.model.nodeDataArray;
      for (var x in model) {
        if(model[x].key == k) {
          return true;
        }
      }
      return false;
    }

    $(function() {
        $("#draggablePanel").draggable({ handle: "#infoDraggable" });
        var inspector = new Inspector('Info', myDiagram,
          {
            properties: {
              key: { readOnly: true, show: Inspector.showIfPresent },
              "category": { readOnly: true, show: Inspector.showIfPresent },
              "isGroup": { readOnly: true, show: Inspector.showIfPresent },
              "text": { show: Inspector.showIfPresent },
              "label": { show: Inspector.showIfLink },
              "fill": { show: Inspector.showIfPresent, type: 'color' },
              "labelKeys": { readOnly: true, show: Inspector.showIfPresent },
              "from": { readOnly: true, show: Inspector.showIfPresent },
              "to": { readOnly: true, show: Inspector.showIfPresent },
              width: { type: "number", show: Inspector.showIfPresent },
              height: { type: "number", show: Inspector.showIfPresent },
              maxLinks: { type: "number", show: Inspector.showIfPresent },
              location: { readOnly: true, show: Inspector.showIfPresent },
              group: { readOnly: true, show: Inspector.showIfPresent }
            }
          });

          $(document).ready(function(){
            $('#startupWrapper').dialog('open');
          });

          $('#startupWrapper').dialog({
            modal: true,
            autoOpen: false,
            title: 'Diagram Name',
            buttons: [
              {
                text: "Submit",
                click: function() {
                  {
                    if($("#diagramName").val() == ""){
                        alert("Error, please fill the name field.");
                    }
                    else {
                      var text = $("#diagramName").val();
                      $("#txtbox").val(text);
                      $(this).closest('#startupWrapper').dialog('close');
                    }
                  }
              }
            }]
          });

          $('div#startupWrapper').on('dialogclose', function(event) {
              $("#diagramName").val("");
          });

          $('#newDiagramWrapper').dialog({
            modal: true,
            autoOpen: false,
            title: 'New Diagram',
            buttons: [
              {
                text: "Submit",
                click: function() {
                  {
                    myDiagram.div = null;
                    tree = [];
                    toDiagram = [];
                    externalNames = [];
                    location.reload();
                  }
              }
            }]
          });

          $('#formulaWrapper').dialog({
            modal: true,
            autoOpen: false,
            title: 'Generated Formula'
          });

          $('#svgWrapper').dialog({
            modal: true,
            autoOpen: false,
            title: 'Upload custom SVG',
            buttons: [
              {
                text: "Import",
                click: function() {
                  var radioValue = $("input[name='choice']:checked").val();
                  name = $("#name").val();
                  if (!name) {
                    alert("Error, please specify a name for the custom SVG node");
                    return null;
                  }
                  else {
                    if (checkModelDuplicates(name)) {
                      alert("Error, duplicate node name exists, please specify another name");
                      return null;
                    }
                  }
                  //var svgElem = $('#myFile').prop('files');

                  //var test = svgElem[0].getBBox();
                  /*
                  var size = 0;
                  var svgSize = document.getElementById('myFile').getBoundingClientRect();
                  if (svgSize.width > svgSize.height) {
                    size = svgSize.height/8;
                  }
                  else {
                    size = svgSize.width/8;
                  }
                  console.log(svgSize);
                  console.log(svgSize.height);
                  console.log(svgSize.width);
                  console.log(size);
                  */

                  var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.svg)$/;
                  if (regex.test($("#myFile").val().toLowerCase())) {
                      if (typeof (FileReader) != "undefined") {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                          var xmlDoc = $.parseXML(e.target.result);
                          var customPanel = new go.Panel();

                          var paths = xmlDoc.getElementsByTagName("path");
                          //var gs = xmlDoc.getElementsByTagName("g");
                          //console.log(gs);
                          //console.log("__________________paths: "+paths);
                          for (var i = 0; i < paths.length; i++) {
                            var path = paths[i];
                          //  var g = gs[i+1];
                            //console.log(g);
                            //console.log("path: "+paths[i]);
                            //console.log("g: "+g[i]);
                            var path = paths[i];
                            var shape = new go.Shape();

                            var stroke = path.getAttribute("stroke");
                            //var strokeG = g.getAttribute("stroke");
                            //console.log("stroke: "+strokeG);
                            //console.log("stroke: "+stroke);
                            if (typeof stroke === "string" && stroke !== "none") {
                              //console.log("stroke: "+stroke);
                              shape.stroke = stroke;
                            }
                            else {
                              shape.stroke = null;
                            }
                            //else if (typeof strokeG === "string" && strokeG !== "none") {
                            //  console.log("stroke: "+strokeG);
                            //  shape.stroke = strokeG;
                            //}


                            var strokewidth = parseFloat(path.getAttribute("stroke-width"));
                            //var strokewidthG = parseFloat(g.getAttribute("stroke-width"));
                            //console.log("stroke wideth: "+strokewidth);
                            if (!isNaN(strokewidth)) shape.strokeWidth = strokewidth;
                            /*
                            if (!isNaN(strokewidth)) {
                              console.log(strokewidth);
                              shape.strokeWidth = strokewidth;
                            }
                            else if (!isNaN(strokewidthG)) {
                              console.log(strokewidthG);
                              shape.strokeWidth = strokewidthG;
                            }
                            */

                            var fill = path.getAttribute("fill");
                            //var fillG = g.getAttribute("fill");
                            //console.log("fill: "+fill);
                            if (typeof fill === "string") {
                              shape.fill = (fill === "none") ? null : fill;
                            }


                            /*
                            else if (typeof fillG === "string") {
                              console.log(fillG);
                              shape.fill = (fillG === "none") ? null : fill;
                            }
                            */

                            var data = path.getAttribute("d");
                            //console.log("d: "+data );
                            if (typeof data === "string") shape.geometry = go.Geometry.parse(data, true);

                            customPanel.add(shape);
                          }

                          var box =  new go.Shape();
                          box.width = 50;
                          box.height = 50;
                          box.strokeWidth = 0;
                          box.fill = "transparent";
                          box.fromLinkable = false;
                          box.toLinkable = false;
                          box.name = "drag";
                          customPanel.add(box);

                          if (radioValue == "atomic") {
                            var customNode = new go.Node(go.Panel.Viewbox);

                            customNode.locationSpot = go.Spot.Center;
                            customNode.resizable = true;
                            customNode.resizeObjectName = "custom";
                            customNode.mouseDrop = function(e, nod) { finishDrop(e, nod.containingGroup); };
                            customNode.portId = "";
                            customNode.fromLinkable = true;
                            customNode.toLinkable = true;
                            customNode.linkValidation = validation;
                            customNode.cursor = "pointer";
                            customNode.mouseEnter = enter;
                            customNode.mouseLeave = leave;
                            customNode.bind(new go.Binding("width").makeTwoWay(), new go.Binding("height").makeTwoWay());
                            customNode.bind(new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify));
                            customNode.add(customPanel);

                            myDiagram.nodeTemplateMap.add(name, customNode);
                            myPalette.model.addNodeData({ key: name, category: name, text: "custom", width: 80, height: 80, maxLinks: Infinity });
                          }
                          else {
                            var customGroup = new go.Group(go.Panel.Viewbox);

                            customGroup.locationSpot = go.Spot.Center;
                            customGroup.resizable = true;
                            customGroup.resizeObjectName = "custom";
                            customGroup.background = "transparent",
                            customGroup.mouseDrop = finishDrop;
                            customGroup.portId = "";
                            customGroup.fromLinkable = true;
                            customGroup.toLinkable = true;
                            customGroup.linkValidation = validation;
                            customGroup.mouseEnter = enter;
                            customGroup.mouseLeave = leave;
                            customGroup.memberAdded = updateDict;
                            customGroup.memberRemoved = deleteDict;
                            customGroup.mouseDragEnter = function(e, grp, prev) { highlightGroup(e, grp, true); };
                            customGroup.mouseDragLeave = function(e, grp, next) { highlightGroup(e, grp, false); };
                            customGroup.bind(new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject());
                            customGroup.bind(new go.Binding("width").makeTwoWay(), new go.Binding("height").makeTwoWay());
                            customGroup.bind(new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify));
                            customGroup.add(customPanel);

                            myDiagram.groupTemplateMap.add(name, customGroup);
                            myPalette.model.addNodeData({ key: name, category: name, text: "custom", width: 80, height: 80, isGroup: true, maxLinks: Infinity });
                          }
                        }
                        reader.readAsText($("#myFile")[0].files[0]);
                        alert("Successfully added an SVG element to the palette");
                        $(this).closest('#svgWrapper').dialog('close');
                      } else {
                          alert("Error, this browser does not support HTML5");
                      }
                  } else {
                      alert("Error, please upload a valid SVG file");
                  }
                }
              }
            ]
          });

          $('div#svgWrapper').on('dialogclose', function(event) {
              $('#myFile').val("");
              $('#name').val("");
          });

          $('#jsonWrapper').dialog({
            modal: true,
            autoOpen: false,
            title: 'Upload JSON file',
            buttons: [
              {
                text: "Import",
                click: function() {
                  {
                    //var jsonElem = $('#myJSON').prop('files');
                    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.json)$/;
                    if (regex.test($("#myJSON").val().toLowerCase())) {
                        if (typeof (FileReader) != "undefined") {
                          var reader = new FileReader();
                          reader.onload = function (e) {
                            var rawDoc = e.target.result;
                            loadedJson = true;
                            try {
                              var res = JSON.parse(rawDoc);
                              if (res.length != 3) {
                                throw err;
                              }
                              var check = checkValidKeyNames(JSON.parse(res[0]),res[1],res[2]);
                              if (check) {
                                throw err;
                              }
                              myDiagram.model = go.Model.fromJson(res[0]);
                            }
                            catch (err) {
                              alert("Error, invalid JSON file");
                              loadedJson = false;
                              return null;
                            }
                            loadedJson = false;

                            tree = [];
                            externalNames = [];
                            toDiagram = [];
                            tree = res[1];
                            externalNames = res[2];
                            for (var x in tree) {
                              toDiagram.push(tree[x].key);
                            }
                          }
                          reader.readAsText($("#myJSON")[0].files[0]);
                        } else {
                            alert("This browser does not support HTML5.");
                        }
                    } else {
                        alert("Please upload a valid JSON file.");
                    }
                  }
                }
              }
            ]
          });

          $('div#jsonWrapper').on('dialogclose', function(event) {
              $('#myJSON').val("");
          });

          $('#helpWrapper').dialog({
            'height': "auto",
            'width' : "800px",
            modal: true,
            autoOpen: false,
            title: 'Help'
          });

          $( "#btn1, #btn2, #btn3, #btn4, #btn5, #btn6, #btn7, #btn8, #btn9" ).button();

          $( "#btn1" ).click(function () {
            $('#newDiagramWrapper').dialog('open');
          });

          $( "#btn2" ).click(function () {
            var text = $("#txtbox").val();
            $("#result").html("");
            var res = generate();
            if (~res.indexOf("Error") != 0) {
              $( "#result" ).append('<span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>' + "<p>" + res + "</p>");
            }
            else {
              $( "#result" ).append("<p>" + text + " = " + res + "</p>");
            }
            $('#formulaWrapper').dialog('open');
            return false;
          });

          $( "#btn3" ).click(function () {
            var text = $("#txtbox").val();
            var link = document.createElement('a');
            link.href = convertToImg();
            link.download = text + '.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });

          $( "#btn4" ).click(function () {
            var text = $("#txtbox").val();
            var svgData = convertToSVG().outerHTML;
            var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
            var svgUrl = URL.createObjectURL(svgBlob);
            var link = document.createElement("a");
            link.href = svgUrl;
            link.download = text + '.svg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });

          $( "#btn5" ).click(function () {
            if (myDiagram.nodes.count == 0) {
              alert("Error, diagram is empty");
            }
            else {
              var text = $("#txtbox").val();
              //var jsn = myDiagram.model.toJson();
              var mainJson = JSON.stringify([myDiagram.model.toJson(), tree, externalNames]);
              var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(mainJson);
              var downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", text+".json");
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }
          });

          $( "#btn6" ).click(function () {
            var txt;
              if (confirm("This action will clear the diagram, continue?")) {
                  $('#jsonWrapper').dialog('open');
              }
          });

          $( "#btn7" ).click(function () {
            $("input[name='choice'][value='atomic']").prop('checked', true);
            $('#svgWrapper').dialog('open');
          });

          $( "#btn8" ).click(function () {
            /*
            model = myPalette.model.nodeDataArray;
            for (var x in model) {
              console.log(model[x].key);
            }
            console.log(myPalette.model.nodeDataArray);
            */
            /*
            myDiagram.commit(function(d) {
              d.nodes.each(function(node) {
                console.log("-----------------------");
                console.log("NODE: "+node.data.key);
                var links = node.findLinksConnected();
                links.each(function(n) {
                  console.log("from: "+n.data.from);
                  console.log("to: "+n.data.to);
                  console.log("label: "+n.data.label);
                });

              });
            });
            */
            //console.log(tree);
            //console.log(toDiagram);
          });

          $( "#btn9" ).click(function () {
            $('#helpWrapper').dialog('open');
          });

      });
  }
