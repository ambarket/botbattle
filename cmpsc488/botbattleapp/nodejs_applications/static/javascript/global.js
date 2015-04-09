GLOBAL = {};

GLOBAL.resetValueAttrributeById = function(id) {
  document.getElementById(id).value = "";
}

GLOBAL.appendArrayOfDivsToHtmlElementById = function(id, contentArray) {
  for (var i = 0; i < contentArray.length; i++) {
    GLOBAL.appendDivToHtmlElementById(id, contentArray[i]);
  }
}

GLOBAL.appendDivToHtmlElementById = function(id, content) {
  // Add debugging data to the page
  var element = document.getElementById(id);
  var html = [];
  html.push(element.innerHTML);
  html.push('<div>' + content + '</div>');
  element.innerHTML = html.join('');
  element.scrollTop = element.scrollHeight;
}

GLOBAL.getColoredMessageParagraphByType = function(type, message) {
  var htmlMessage = null;
  if (type === 'status') {
    htmlMessage = "<p style='color:green'>" + message + "</p>";
  } else if (type === 'warning') {
    htmlMessage = "<p style='color:#E65C00'>" + message + "</p>";
  } else if (type === 'error') {
    htmlMessage = "<p style='color:red'>" + message + "</p>";
  } else {
    htmlMessage = "<p>" + message + "</p>";
  }
  return htmlMessage;
}

GLOBAL.messageFlasher = new (function() {
  var nextMessage = null;
  var imRunning = false;

  this.flashHTML = function(message) {
    nextMessage = message;
    if (!imRunning) {
      imRunning = true;
      processNextMessage();
    }
  }

  this.flashMessage = function(type, message) {
    this.flashHTML(GLOBAL.getColoredMessageParagraphByType(type, message));
  }

  var processNextMessage = function() {
    thisMessage = nextMessage;
    nextMessage = null;
    if (!thisMessage) {
      $('.message').html("");
      imRunning = false;
    } else {
      $('.message').html(thisMessage);

      var timeDisplayed = 0;
      var displayInterval = setInterval(function() {
        if (!nextMessage) {
          if (timeDisplayed >= 3000) {
            clearInterval(displayInterval);
            processNextMessage();
          } else {
            timeDisplayed += 1000;
          }
          console.log(timeDisplayed);
        } else {
          clearInterval(displayInterval);
          processNextMessage();
        }
      }, 1000);
    }
  }
})();

GLOBAL.eventLog = new (function() {
  this.logMessage = function(type, message) {
    var htmlMessage = GLOBAL.getColoredMessageParagraphByType(type, message);
    GLOBAL.messageFlasher.flashHTML(htmlMessage);
    GLOBAL.appendDivToHtmlElementById('eventLog', htmlMessage);
  }

  this.clearLog = function(type, message) {
    var htmlMessage = GLOBAL.getColoredMessageParagraphByType(type, message);
    GLOBAL.messageFlasher.flashHTML(htmlMessage);
    GLOBAL.appendDivToHtmlElementById('eventLog', htmlMessage);
  }
  
  document.getElementById('clearLog').addEventListener('click', function() {
    $('#eventLog').html("");
  });
  
  document.getElementById('eventLogToggle').addEventListener('click', function() {
    if ($('#eventLogContainer').css('display') == 'none') {
     $('#eventLogContainer').show();
    }
    else {
      $('#eventLogContainer').hide();
    }
  });
})();

// ----------------------------------Error Handling------------------------------------
GLOBAL.handleExpiredID = function() {
  console.log("The record associated with your id has expired. Please upload new bots to continue.");
  GLOBAL.eventLog.logMessage('error',
      "The record associated with your id has expired. Please upload new bots to continue.");
}

GLOBAL.handleServerError = function(origin, response) {
  GLOBAL.eventLog.logMessage('error',
      "A server error occurred while processing your request, if this problem persists see your administrator.");
  console.log("Server error in", origin, "Response:", response);
}

GLOBAL.handleClientError = function(origin, err) {
  GLOBAL.eventLog.logMessage('error',
      "A client error occurred while processing your request, if this problem persists see your administrator.");
  console.log("Client error in", origin, "Error:", err);
}

GLOBAL.handleNonSuccessHttpStatus = function(origin, status, response) {
  GLOBAL.eventLog.logMessage('error', "HTTP Error", status,
      "received while processing your request, if this problem persists see your administrator.");
  console.log("HTTP Error", status, "in", origin, "Response:", response);
}

GLOBAL.handleUnexpectedResponse = function(origin, response) {
  GLOBAL.eventLog.logMessage('error',
      "Unexpected response received while processing your request, if this problem persists see your administrator.");
  console.log("Unexpected response in", origin, "Response:", response);
}
