(function () {
  'use strict';

  angular
    .module('app', [
      'imgAnnotator'
    ])
    .controller('AppCtrl', function() {
    	var self = this;

    	self.imgSrc = 'exam/bg.jpg';

    	return self;
    });
})();
