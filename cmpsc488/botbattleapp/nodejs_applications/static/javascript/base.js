  function flashStatusOrErrorMessage(type, message) {

    if (type === 'status') {
      $('.message').html("<p style='color:green'>" +  message + "</p>");
      //$('message').html();
    }
    else if (type === 'error') {
      $('.message').html("<p style='color:red'>" +  message + "</p>");
    }
    else {
      $('.message').html("<p>" +  message + "</p>");
    }

    $('.message').slideDown(function() {
      setTimeout(function() {
          $('.message').slideUp();
      }, 3000);
    });
  }