/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

(function() {
  var BBBLogger = {};

  BBBLogger.error = function() {
      var message = "";
      for (var i = 1; i < arguments.length; i++) {
          message += arguments[i];
      }
      return Log.print(Log.l.error, message);
  };

  BBBLogger.warn = function() {
      var message = "";
      for (var i = 1; i < arguments.length; i++) {
          message += arguments[i];
      }
      return Log.print(Log.l.warn, message);
  };

  BBBLogger.info = function() {
      var message = "";
      for (var i = 1; i < arguments.length; i++) {
          message += arguments[i];
      }
      return Log.print(Log.l.info, message);
  };

  BBBLogger.debug = function() {};

  BBBLogger.level = function(level) {
    if (level == "debug") {
      BBBLogger.debug = function() {
          var message = "";
          for (var i = 1; i < arguments.length; i++) {
              message += arguments[i];
          }
          return Log.print(Log.l.trace, message);
      }();
    } else {
      BBBLogger.debug = function() {
        return function() {};
      }();
    }
  }

  BBBLogger.level("info");
  window.Logger = BBBLogger;
})();
