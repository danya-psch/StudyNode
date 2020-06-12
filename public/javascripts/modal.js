var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
// var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
// span.onclick = function() {
//     modal.style.display = "none";
// }

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function onDoubleClick(event) {
    raycaster.setFromCamera( mouse, camera );
    let intersects = raycaster.intersectObjects( nodes );
    if ( intersects.length > 0 ) {
        const renderedHtmlStr = ejs.render(templateStr); // { task: intersects[0].object.userData.task }
        const mymodal = document.getElementById("modal-content");
        mymodal.innerHTML = renderedHtmlStr;
        let span = document.getElementsByClassName("close")[0];
        span.onclick = function() {
            modal.style.display = "none";
        }
    }
}