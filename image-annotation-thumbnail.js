(function () {
    'use strict';

    angular
        .module('imgAnnotator')
        .directive('imageAnnotationThumbnail', directive);

    function directive() {
        return {
            restrict: 'E',
            scope: {
                path: '=',
                originalImage: '@',
                outputSrc: '='
            },
           // template: '<div> <pre>OUTPUT SRC: {{outputSrc}}</pre> <pre>PATH: {{path}}</pre> <pre>ORIGINAL IMAGE: {{originalImage}}</pre> <img id="backgroundImage" />aa<img id="newImage"/>nnn </div>',
            link: function (scope) {
                scope.thumbnail = scope.originalImage;
                scope.init = function () {

                    var annotatedImage = new Image();
                    annotatedImage = document.getElementById("canvasId").toDataURL("image/png");
                   // var imageTarget = document.getElementById('newImage');
                   // imageTarget.src = annotatedImage;

                    var backgroundImage = getBase64Image(document.getElementById("imageId"));
                   // var backgroundImage = document.getElementById('backgroundImage');
                    //backgroundImage.src = base64;

                    function getBase64Image(img) {
                        var canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0);
                        var dataURL = canvas.toDataURL("image/png");
                        return dataURL;
                    }

                    function mergeTwoImages() {
                        var c = document.createElement("canvas");  
                       // c= document.getElementById("myCanvas");
                        var ctx = c.getContext("2d");
                        var imageObj1 = new Image();
                        var imageObj2 = new Image();
                        imageObj1.src = backgroundImage ;
                        imageObj1.onload = function () {
                            c.height = imageObj1.height;
                            c.width = imageObj1.width;
                            ctx.drawImage(imageObj1, 0, 0);
                            imageObj2.src = annotatedImage;
                            imageObj2.onload = function () {
                                ctx.drawImage(imageObj2, 0, 0);
                                var img = c.toDataURL("image/png");
                                scope.outputSrc = img;
                                scope.$parent.$parent.outputSrc = img;
                                scope.$parent.$parent.$digest();
                                scope.$digest();
                            }
                        };
                    }

                        mergeTwoImages();

                }

                scope.init();
            }
        }
    }
})();