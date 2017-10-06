(function() {
  'use strict';

  angular
    .module('imgAnnotator', [])
    .directive('imgAnnotator', imgAnnotator)
    .directive('imgAnnotatorImg', imgAnnotatorImg)
    .directive('imgAnnotatorCanvas', imgAnnotatorCanvas);

  imgAnnotator.$inject = [];
  imgAnnotatorImg.$inject = [];
  imgAnnotatorCanvas.$inject = [];

  function imgAnnotator() {
    function link(scope, element, attrs) {

      scope.drawingMode = null;
      console.log(scope, 'imgAnnotator');

    }

    return {
      restrict: 'E',
      link: link,
      scope: {
        imgSrc: '='
      },
      templateUrl: 'imgAnnotator.html'
    };
  }

  function imgAnnotatorImg() {
    return {
      link: function(scope, element, attrs) {
        var img = element[0];

        element.imageMarkup({
          color: 'black',
          width: 4,
          opacity: .5
        });

        scope.strokeChange = strokeChange;


        scope.strokeOptions = [{
          name: 'Normal',
          value: 4
        }, {
          name: 'Thick',
          value: 15
        }, {
          name: 'Very Thick',
          value: 25
        }, {
          name: 'Thin',
          value: 2
        }, {
          name: 'Very Thin',
          value: .5
        }]


        scope.textOptions = [{
          name: 'Black',
          value: '#000000'
        }, {
          name: 'Red',
          value: '#FF0000'
        }]

        scope.textChange = textChange;
        scope.text = null;

        scope.strokeProperty = {
          width: 4
        };

        scope.textProperty = {
          fontSize: 18,
          fillColor: 'black',
          content: 'click'
        };

        scope.text = {
          fontSize: 18,
          fillColor: 'black',
          content: 'click'
        }

        var defaults = {
          color: 'red',
          width: 4,
          opacity: .5,
        };
        var settings = $.extend({}, defaults || {});

        element.bind('load', function() {
          //element.init();
          init();
          scope.$emit('canvas:resolution', {
            height: img.height,
            width: img.width
          });
          //scope.setPenColor = element.setPenColor;
        });

        scope.rect_a = {};
        scope.rect_a.size = 16;
        scope.rect_a.strokeColor = "red";

        scope.showPropertyTools = false;
        console.log(scope.showPropertyTools);

        function strokeChange() {
          // scope.text.fontSize = scope.text.fontSize;
          //  scope.text.fillColor = scope.text.fillColor;
          //  scope.text.content = scope.text.content;
          scope.rect_a.size = scope.rect_a.size;
          scope.rect_a.strokeColor = scope.rect_a.strokeColor;
          //  paper.view.draw();
          console.log(scope.rect_a.size);
        }



        function textChange() {
          scope.text.fillColor = scope.textProperty.fillColor;
          paper.view.draw();
        }



        function init() {
          var self = element;
          var path;
          var position;
          var contextPoint;
          var contextSelectedItemId;
          var selectedItem;
          var mouseDownPoint;
          var movedItemPoint;
          var text;


          $(self).each(function(eachIndex, eachItem) {
            self.paths = [];

            var img = eachItem;




            // Get a reference to the canvas object
            //var canvas = $('#myCanvas')[0];
            /*var canvas = $('<canvas>')
              .attr({
                width: $(img).width(),
                height: $(img).height(),
                'img-annotator-canvas': ''
              })
              .addClass('image-markup-canvas')
              .css({
                position: 'absolute',
                top: '0px',
                left: '0px'
              });

            $(img).after(canvas);

            $(img).data('paths', []);

            // Create an empty project and a view for the canvas:
            paper.setup(canvas[0]);

            paper.projects[eachIndex].activate();
            //$(canvas).mouseenter(function () {
            //    paper.projects[eachIndex].activate();
            //});*/

            // Create a simple drawing tool:
            var tool = new paper.Tool();



            tool.onMouseMove = function(event) {
              switch (event.event.button) {
                case 0:
                  switch (scope.drawingMode) {
                    case 'erase':
                      contextPoint = event.point;
                      contextSelectedItemId = selectedItem ? selectedItem.data.id : '';
                      break;

                  }
                  break;
              }
              if (!selectedItem) {
                console.log("test mouse move");
              }

              if (!$('.context-menu-list').is(':visible')) {
                position = event.point;
                paper.project.activeLayer.selected = false;
                self.setPenColor(settings.color);
                if (event.item) {
                  event.item.selected = true;
                  selectedItem = event.item;

                  self.setCursorHandOpen();
                } else {
                  selectedItem = null;
                }
              }

              //console.log(event.point);

            }



            tool.onMouseDown = function(event) {

              var firstClick = true;
              scope.showPropertyWindow = false;
              scope.showStrokePropertyWindow = false;
              scope.$apply();

              switch (event.event.button) {
                // leftclick
                case 0:
                  // If we produced a path before, deselect it:
                  if (path) {
                    path.selected = false;
                  }

                  switch (scope.drawingMode) {
                    case 'pen':
                      path = new paper.Path();
                      path.data.id = generateUUID();
                      path.strokeColor = settings.color;
                      path.strokeWidth = scope.strokeProperty.width;
                      path.opacity = settings.opacity;
                      scope.selectPath = path.data.id;
                      scope.showStrokePropertyWindow = true;


                      break;

                    case 'erase':
                      //selectedItem = event.item;


                      var strPathArray = new Array();
                      $(paper.project.activeLayer.children).each(function(index, item) {
                        if (contextSelectedItemId) {
                          if (contextSelectedItemId.length == 0 || item.data.id == contextSelectedItemId) {
                            var strPath = item.exportJSON({
                              asString: true
                            });
                            strPathArray.push(strPath);
                          }
                        }

                      });

                      CommandManager.execute({
                        execute: function() {
                          $(paper.project.activeLayer.children).each(function(index, item) {
                            if (contextSelectedItemId) {
                              if (contextSelectedItemId.length == 0 || item.data.id == contextSelectedItemId) {
                                item.remove();
                              }
                            } else {
                              if (item.data.uid == scope.selectTextid)
                                item.remove();
                            }
                          });
                        },
                        unexecute: function() {
                          $(strPathArray).each(function(index, strPath) {
                            path = new paper.Path();
                            path.importJSON(strPath);
                          });
                        }
                      });



                      break;


                    case 'rectangle':


                      if (!selectedItem) {
                        //console.log("add if not selected add new shape");  
                        var mouseX = event.point.x;
                        var mouseY = event.point.y;

                        var hitOptions = {
                          segments: true,
                          stroke: true,
                          fill: true,
                          tolerance: 1
                        };

                        var rect_a = new paper.Path.Rectangle({
                          size: 100,
                          data: {
                            id: generateUUID()
                          },
                          fillColor: 'rgba(255,255,255,0)',
                          strokeColor: 'rgba(255, 0, 0,0.4)',
                          strokeWidth: 6,
                          center: [mouseX, mouseY]
                        });

                        rect_a.strokeWidth = scope.rect_a.size;
                        rect_a.strokeColor = scope.rect_a.strokeColor;

                        shapesResizer(rect_a, "rectangle");

                      } else {
                        //console.log("if selected do nothing");
                        return;
                      }

                      break;

                    case 'circle':

                      if (!selectedItem) {
                        //console.log("add if not selected add new shape");
                        var mouseX = event.point.x;
                        var mouseY = event.point.y;

                        var circle = new paper.Path.Circle({
                          radius: 5,
                          data: {
                            id: generateUUID()
                          },
                          fillColor: 'rgba(255,255,255,0.1)',
                          strokeColor: 'rgba(255, 0, 0,0.4)',
                          strokeWidth: 5,
                          center: [mouseX, mouseY]
                        });

                        circle.scale(10);

                        shapesResizer(circle, "circle");

                      } else {
                        //console.log("if selected do nothing");
                        return;
                      }
                      break;
                    case 'text':
                      contextPoint = event.point;
                      scope.showPropertyWindow = true;


                      var uid = generateUUID();
                      var pos = contextPoint;
                      CommandManager.execute({
                        execute: function() {
                          var text = new paper.PointText(pos);
                          text.content = 'click me to edit';
                          text.fillColor = scope.textProperty.fillColor;
                          text.fontSize = 18;
                          text.fontFamily = 'Arial';
                          text.data.uid = uid;
                          text.opacity = 1;




                          text.onMouseDown = function(event) {
                            scope.selectTextid = uid;
                            scope.$apply();
                          }



                          text.onClick = function(event) {

                            scope.showStrokePropertyWindow = false;
                            scope.showPropertyWindow = true;
                            scope.$apply();
                            scope.textProperty.fillColor = text.fillColor;
                            scope.text = text;
                            scope.$apply();
                            console.info('clicked me niggas?');
                          }
                        },
                        unexecute: function() {
                          $(paper.project.activeLayer.children).each(function(index, item) {
                            if (item.data && item.data.uid) {
                              if (item.data.uid == uid) {
                                item.remove();
                              }
                            }
                          });
                        }
                      });


                      scope.drawingMode = null;
                      scope.$apply();


                      // booog
                      // scope.drawingMode = 'move';
                      // scope.$apply();



                      break;
                  }

                  break;
                  // rightclick
                case 2:
                  break;
              }
            }

            tool.onMouseDrag = function(event) {
              switch (event.event.button) {
                // leftclick
                case 0:
                  // Every drag event, add a point to the path at the current
                  // position of the mouse:

                  switch (scope.drawingMode) {
                    case 'pen':
                      if (selectedItem) {
                        if (!mouseDownPoint)
                          self.setCursorHandClose();


                      } else if (path)
                        path.add(event.point);
                      break;
                    case 'move':
                      if (selectedItem) {
                        if (!movedItemPoint)
                          movedItemPoint = selectedItem.position;
                        self.setCursorHandClose();
                        selectedItem.position = new paper.Point(
                          selectedItem.position.x + event.delta.x,
                          selectedItem.position.y + event.delta.y);
                      }
                  }


                  break;
                  // rightclick
                case 2:
                  break;
              }
            }

            tool.onMouseUp = function(event) {
              switch (event.event.button) {
                // leftclick
                case 0:

                  switch (scope.drawingMode) {
                    case 'pen':

                      if (selectedItem) {
                        if (mouseDownPoint) {
                          var selectedItemId = selectedItem.id;
                          var draggingStartPoint = {
                            x: mouseDownPoint.x,
                            y: mouseDownPoint.y
                          };
                          CommandManager.execute({
                            execute: function() {
                              //item was already moved, so do nothing
                            },
                            unexecute: function() {
                              $(paper.project.activeLayer.children).each(function(index, item) {
                                if (item.id == selectedItemId) {
                                  if (item.segments) {
                                    var middlePoint = new paper.Point(
                                      ((item.segments[item.segments.length - 1].point.x) - item.segments[0].point.x) / 2,
                                      ((item.segments[item.segments.length - 1].point.y) - item.segments[0].point.y) / 2
                                    );
                                    item.position =
                                      new paper.Point(draggingStartPoint.x, draggingStartPoint.y);
                                  } else {
                                    item.position = draggingStartPoint;
                                  }
                                  return false;
                                }
                              });
                            }
                          });
                          mouseDownPoint = null;
                        }
                      } else {
                        // When the mouse is released, simplify it:
                        path.simplify();
                        path.remove();
                        var strPath = path.exportJSON({
                          asString: true
                        });
                        var uid = generateUUID();
                        CommandManager.execute({
                          execute: function() {
                            path = new paper.Path();
                            path.importJSON(strPath);
                            path.data.uid = uid;
                          },
                          unexecute: function() {
                            $(paper.project.activeLayer.children).each(function(index, item) {
                              if (item.data && item.data.uid) {
                                if (item.data.uid == uid) {
                                  item.remove();
                                }
                              }
                            });
                          }
                        });
                      }

                      break;

                  }

                  break;
                  // rightclick
                case 2:
                  contextPoint = event.point;
                  contextSelectedItemId = selectedItem ? selectedItem.data.id : '';
                  break;
              }
            }

            // tool.onKeyUp = function(event) {
            //   if (selectedItem) {
            //     // When a key is released, set the content of the text item:
            //     if (selectedItem.content) {
            //       if (event.key == 'backspace')
            //         selectedItem.content = selectedItem.content.slice(0, -1);
            //       else {
            //         selectedItem.content = selectedItem.content.replace('<some text>', '');
            //         if (event.key == 'space')
            //           selectedItem.content += ' ';
            //         else if (event.key.length == 1)
            //           selectedItem.content += event.key;
            //       }
            //     }
            //   }
            // }

            // Draw the view now:
            //paper.view.draw();
          });

          function shapesResizer(shape, shapeToolsName) {
            //console.log("test shape resizer");
            var hitOptions = {
              segments: true,
              stroke: true,
              fill: true,
              tolerance: 1
            };

            var segment, path, hitType;
            var clickPos = null;
            var movePath = false;
            var minHeight = 10;
            var minWidth = 10;

            // mouse events

            shape.onMouseDown = function(event) {
              segment = path = null;
              var hitResult = paper.project.hitTest(event.point, hitOptions);
              if (!hitResult)
                return;

              hitType = hitResult.type;

              if (event.modifiers.shift) {
                if (hitResult.type == 'segment') {
                  hitResult.segment.remove();
                };
                return;
              }

              if (hitResult) {
                path = hitResult.item;
                if (hitResult.type == 'segment') {
                  segment = hitResult.segment;

                }
              }

              movePath = hitResult.type == 'fill';
              if (movePath) {
                paper.project.activeLayer.addChild(hitResult.item);
              }

              clickPos = checkHitPosition(event);
            }

            shape.onMouseMove = function(event) {
              changeCursor(event);
              paper.project.activeLayer.selected = false;
              if (event.item)
                event.item.selected = true;
            }

            shape.onMouseDrag = function(event) {
              if (hitType == "stroke" || hitType == "segment") {
                if (scope.drawingMode == shapeToolsName) {
                  resizeRectangle(path, event);
                }
              } else {
                movedItemPoint = selectedItem.position;
                /* dont remove this code we can use this 
                   add this code if want to move selected shapes */
                // self.setCursorHandClose();
                //selectedItem.position = new paper.Point(
                //selectedItem.position.x + event.delta.x,
                //selectedItem.position.y + event.delta.y);

              }
            }


            // target points/path positions to resize -> SE = resize both bottom and left corner

            function resizeRectangle(path, event) {
              switch (clickPos) {
                case "SE":
                  resizeBottom(path, event);
                  resizeRight(path, event);
                  break;
                case "NE":
                  resizeTop(path, event);
                  resizeRight(path, event);
                  break;
                case "SW":
                  resizeBottom(path, event);
                  resizeLeft(path, event);
                  break;
                case "NW":
                  resizeTop(path, event);
                  resizeLeft(path, event);
                  break;
                case "S":
                  resizeBottom(path, event);
                  break;
                case "N":
                  resizeTop(path, event);
                  break;
                case "E":
                  resizeRight(path, event);
                  break;
                case "W":
                  resizeLeft(path, event);
                  break;
              }
            }

            // resize functions top , bottom , left , right

            function resizeTop(path, event) {

              if ((path.bounds.height + event.delta.y) < minHeight) {
                path.bounds.top -= minHeight;
                //dont erase
                //                        var adj = Math.min(event.delta.y, path.bounds.height-minHeight);
                //                        path.bounds.top  += adj;
              } else {
                path.bounds.top += event.delta.y;
              }

            }

            function resizeBottom(path, event) {

              if ((path.bounds.height + event.delta.y) < minHeight) {
                path.bounds.bottom += minHeight;
              } else {
                path.bounds.bottom += event.delta.y;
              }

            }

            function resizeLeft(path, event) {

              if ((path.bounds.width + event.delta.x) < minWidth) {
                path.bounds.left -= minWidth;
              } else {
                path.bounds.left += event.delta.x;
              }
            }

            function resizeRight(path, event) {

              if ((path.bounds.width + event.delta.x) < minWidth) {
                path.bounds.right += minWidth;
              } else {
                path.bounds.right += event.delta.x;
              }
            }

            // check path and points positions

            function checkHitPosition(event) {
              var hitResult = paper.project.hitTest(event.point, hitOptions);
              var clickPosition = null;

              if (hitResult) {
                if (hitResult.type == 'stroke' || hitResult.type == 'segment') {
                  var bounds = hitResult.item.bounds;
                  var point = hitResult.point;

                  if (bounds.top == point.y) {
                    clickPosition = "N";
                  }

                  if (bounds.bottom == point.y) {
                    clickPosition = "S";
                  }

                  if (bounds.left == point.x) {
                    clickPosition = "W";
                  }

                  if (bounds.right == point.x) {
                    clickPosition = "E";
                  }

                  if (bounds.top == point.y && bounds.left == point.x) {
                    clickPosition = "NW";
                  }

                  if (bounds.top == point.y && bounds.right == point.x) {
                    clickPosition = "NE";
                  }

                  if (bounds.bottom == point.y && bounds.left == point.x) {
                    clickPosition = "SW";
                  }

                  if (bounds.bottom == point.y && bounds.right == point.x) {
                    clickPosition = "SE";
                  }
                } else {
                  clickPosition = "C";
                }
              }
              return clickPosition;
            };

            // cursor styles if points or path selected 

            function changeCursor(event) {
              var hitPosition = checkHitPosition(event);
              if (hitPosition == null) {
                document.body.style.cursor = "auto";
              } else {
                if (hitPosition == "C") {
                  document.body.style.cursor = "all-scroll";
                } else {
                  if (scope.drawingMode == shapeToolsName) {
                    document.body.style.cursor = hitPosition + "-resize";
                  }
                }
              }
            }
          }
        }

        scope.setPenColor = function(color) {
          scope.drawingMode = 'pen';
          element.setOptions({
            color: color
          });
          $('.image-markup-canvas').css('cursor', "url(img/" + color + "-pen.png) 14 50, auto");
          this.showStrokePropertyWindow = true;
          this.showPropertyWindow = false;
        }

        element.setOptions = function(options) {
          settings = $.extend(settings, options);
        };

        scope.undo = function() {
          CommandManager.undo();
          paper.view.draw();
        };

        scope.redo = function() {
          CommandManager.redo();
          paper.view.draw();
        };

        scope.textAnno = function() {
          scope.drawingMode = 'text';
          this.showPropertyWindow = true;



        };

        scope.rectangle = function() {
          CommandManager.undo();
          paper.view.draw();
          console.log("test");
          scope.drawingMode = 'rectangle';
          if (scope.drawingMode) {
            scope.showPropertyTools = true;
          } else {
            scope.showPropertyTools = false;
          }

        }

        scope.circle = function() {
          scope.drawingMode = 'circle';
        }

        scope.erase = function() {
          scope.drawingMode = 'erase';
        }

        scope.moveAnno = function() {
          scope.drawingMode = 'move'
        }

        scope.exportToJSON = function () {
          scope.annotationPath = paper.project.exportJSON();
         // console.log(scope.annotationPath);
        }



      }
    }
  }

  function imgAnnotatorCanvas() {
    function link(scope, element) {
      var canvas = element[0];
      init();


      function init() {
        eventListener();
      }


      function eventListener() {
        scope.$on('canvas:resolution', function(evt, args) {
          canvas.height = args.height;
          canvas.width = args.width;

          element.css({
            height: args.height,
            width: args.width
          });

          paper.setup(canvas);
          paper.projects[0].activate();

          paper.view.draw();
        });

        scope.$watch(function() {
          return scope.drawingMode;
        }, function() {
          console.info(scope.drawingMode);
        });
      }
    }

    return {
      restrict: 'A',
      link: link
    }
  }
})();