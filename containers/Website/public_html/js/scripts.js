
//Confirmation funtions
function ConfirmDelete() {
	return confirm('Are you sure you want to delete this student?');
}

function ConfirmEdit() {
	return confirm('Are you sure you want to edit this student?');
}

function ConfirmLogout() {
	return confirm('Are you sure you want to logout?');
}

//Asynchronous Search of student    
$(document).ready(function(){
    $('.search-box input[type="text"]').on("keyup input", function(){
        
        /* Get input value on change */
        var inputVal = $(this).val();
        var resultDropdown = $(".result");

        //Default message 
        var default_table = "<table>\
                    <tr>\
                        <th style='width: 15%'><strong>ID</strong></th>\
                        <th style='width: 15%'><strong>Name</strong></th>\
                        <th style='width: 15%'><strong>Surname</strong></th>\
                        <th style='width: 15%'><strong>Father's name</strong></th>\
                        <th style='width: 10%'><strong>Grade</strong></th>\
                        <th style='width: 15%'><strong>Mobile number</strong></th>\
                        <th style='width: 15%'><strong>Birthday</strong></th>\
                    </tr>\
                    <tr>\
                        <td colspan='7' style='text-align: center;'>Search something...</td>\
                    </tr>\
                </table>";

        if(inputVal.length){
            $.get("backend-search.php", {term: inputVal}).done(function(data){
                
                // Display the returned data in browser
                resultDropdown.html(data);
            });
        } else{
            resultDropdown.html(default_table);
        }
    });
});

 // function to set the height of content on fly to keep footer on the bottom.
 function autoHeight() {
   $('#content').css('min-height', 0);
   $('#content').css('min-height', (
     $(document).height() - $('#header').height() - $('#footer').height()
   ));
 }

 // onDocumentReady function bind
 $(document).ready(function() {
   autoHeight();
 });

 // onResize bind of the function
 $(window).resize(function() {
   autoHeight();
 });


//get the php session id
function session_id() {
  return /SESS\w*ID=([^;]+)/i.test(document.cookie) ? RegExp.$1 : false;
}


// Same height for column sections
function setEqualHeight(columns) {
  var tallestColumn = 0;

  columns.each(function(){
    var currentHeight = $(this).height();

    if(currentHeight > tallestColumn){
      tallestColumn  = currentHeight;
    }
  });

  columns.height(tallestColumn);
}


function timer(ms) {
 return new Promise(res => setTimeout(res, ms));
}

function redirectDelay(url){
  window.setTimeout(function(url){
      // Move to a new location or you can do something else
      window.location.href = url;

  }, 3000);
}


function onMyFrameLoad() {
    elementHandler();
};

function elementHandler () {
    var iframe = document.getElementById("gameFrame");
    var container = iframe.contentWindow.document.getElementById("endstate");
    if (container.addEventListener) {
      container.addEventListener ('DOMSubtreeModified', checkState, false);
    }
}
async function redirect(url) {
    await timer(5000);
    window.location.href = url;
}



function checkState () {
    var total = $('#totalRounds').innerText;
    var current = $('#curRound').innerText;
    var url = "portal.php";
    var endgame = $("#endstate").innerText;
    console.log(endgame);

    if (total != '' && current != '') {
        if (endgame == 'VICTORY') {
            if (total < current){       //redirect for the next round
                url = "gameLoadind.php?redirect=true&replay=false";
            }
        }else if(endgame == 'TIE') {
            url = "gameLoadind.php?redirect=true&replay=true"; //redirect but not increase round
        }          
       
    }
    console.log(url);
    redirect(url);

}
