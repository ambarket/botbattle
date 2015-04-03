  function flashStatusOrErrorMessage(type, message) {
    if (type === 'status') {
      $('message').html('<p style="color:green>"' + message);
    }
    else if (type === 'error') {
      
      $('message').html('<p style="color:red>"' + message);
      console.log(type, message, $('message').html());
    }
    else {
      $('message').html(message);
    }
    $('message').slideDown(function() {

      setTimeout(function() {
          $('message').slideUp();
      }, 2000);
    });
  }