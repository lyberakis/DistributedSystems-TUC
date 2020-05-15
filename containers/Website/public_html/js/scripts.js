
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
    await timer(10000);
    window.location.href = url;
}



function checkState () {
    var total_el = document.getElementById("totalRounds");
    var current_el = document.getElementById("curRound");
    var iframe = document.getElementById("gameFrame");
    var container = iframe.contentWindow.document.getElementById("endstate")
    var url = "portal.php";
    var endgame = container.innerHTML;

    if (total_el != null && current_el != null) {
      total = parseInt(total_el.innerHTML);
      current = parseInt(current_el.innerHTML);

      if (endgame == 'VICTORY!') {
        if (total > current){       //redirect for the next round
          console.log('redirecting')
          url = "gameLoading.php?redirect=true&replay=false";
        }
      }else if(endgame == 'TIE!') {
        url = "gameLoading.php?redirect=true&replay=true"; //redirect but not increase round
      }          
       
    }
    console.log(url);
    redirect(url);

}
