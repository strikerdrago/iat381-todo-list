'use strict';

angular.module('todoListAngularApp')
  .factory('EditInfo', function () {
    var balls = [];

    return {
      all: function() {
        return balls;
      },
      get: function(ballsId) {
        // Simple index lookup
        return balls[ballsId];
      },
      // genres: function() {
      //   return genres;
      // },
      // searchTerm: function() {
      //   return searchTerm;
      // },
      // suggestedMovie: function() {
      //   return suggestedMovie;
      // },
      // setSuggestedMovie: function(newSuggestedMovie) {
      //   suggestedMovie = newSuggestedMovie;
      // },
      // filters: function() {
      //   return filters;
      // }
    }
});
