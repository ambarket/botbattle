   var InitConfigLogRequester = null;
   function startInitConfigLogRequester() {
     InitConfigLogRequester = setInterval(requestLatestInitConfigMessages, 100);
   }
   
   function stopInitConfigLogRequester() {
     console.log("Stopping InitConfigLogRequester");
     if (InitConfigLogRequester) {
       clearInterval(InitConfigLogRequester);
       InitConfigLogRequester = null;
     }
   }
   
   
   function requestLatestInitConfigMessages() {
     var req = new XMLHttpRequest();
     var response = null;
     req.open("GET", "getLatestInitConfigMessage", true);
     
     req.onreadystatechange=function() {
       if (req.readyState==4) {
         if (req.status==200) {
           try {
             response = JSON.parse(req.responseText);
           }
           catch (e) {
             GLOBAL.handleUnexpectedResponse('getLatestInitConfigMessage', req.responseText);
             document.getElementById('submitButton').disabled = false;
             stopInitConfigLogRequester();
             return; // Don't continue unless it was a json response.
           }
           try {
             switch(response.event) {
               case 'progress_update':
                 console.log("progress ", progress);
                 document.getElementById("progress").value = response.data;
                 
                 break;
               case 'status_update':
                 GLOBAL.eventLog.logMessage('status', response.data);
                 break;
               case 'config_success': 
                 GLOBAL.eventLog.logMessage('status', "Configuration Successful!");
                 var count = 5;
                 document.getElementById('reloading_message').innerHTML = "Configuration Successful!<br>The page will reload in "
                   + count + " seconds and take you to the Test Arena";
                 setInterval(function() {
                     count--;
                     document.getElementById('reloading_message').innerHTML = "Configuration Successful!<br>The page will reload in "
                         + count + " seconds and take you to the Test Arena";
                     if (count === 0) {
                       location.reload();
                     }
                   }, 1000);
                  stopInitConfigLogRequester();
                  break;
               case 'config_error':
                 GLOBAL.eventLog.logMessage('error', response.data);
                 document.getElementById('reloading_message').innerHTML = "An error occured, please check the event log for more details";
                 break;
               case 'reset_form':
                 document.getElementById('submitButton').disabled = false;
                 stopInitConfigLogRequester();
                 break;
               case 'noMessages':
                 break;
               default:
                 GLOBAL.handleUnexpectedResponse('getLatestInitConfigMessage', response);
                 document.getElementById('submitButton').disabled = false;
                 stopInitConfigLogRequester();
                 break;
             }
           }
           catch(err) {
             GLOBAL.handleClientError('getLatestInitConfigMessage', err);
             document.getElementById('submitButton').disabled = false;
             stopInitConfigLogRequester();
           }
         } else {
           GLOBAL.handleNonSuccessHttpStatus('getLatestInitConfigMessage', req.status, response);
           document.getElementById('submitButton').disabled = false;
           stopInitConfigLogRequester();
         }
       }
     }
     req.send();
   };
   
   
   var form = document.getElementById("initConfigForm");
   form.addEventListener('submit', function(ev) {
     var data = new FormData(document.forms.namedItem("initConfigForm"));
     var req = new XMLHttpRequest();
     var response = null;
     req.open("POST", "processInitialConfiguration", true);
     req.onreadystatechange=function() {
       if (req.readyState==4) {
         if (req.status==200) {
           document.getElementById('submitButton').disabled = true;
           document.getElementById("progress").value = 0;
           GLOBAL.eventLog.clearLog();
           startInitConfigLogRequester();
         }
         else {
           stopInitConfigLogRequester();
           GLOBAL.handleNonSuccessHttpStatus('processInitialConfiguration', req.status, req.responseText);
         }
       }
     };
     req.send(data);
     ev.preventDefault();
   }, false);