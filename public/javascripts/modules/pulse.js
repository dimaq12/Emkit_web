
function initPulse () {
  // Get Pulse Buttons
  var pulseButtons = document.getElementsByClassName("button-pulse");

  for(let i=0; i<pulseButtons.length; i++) {
    // reset
    pulseButtons[i].addEventListener("click", function(e){
      e.preventDefault;
      let button = pulseButtons[i];
      // remove pulse
      if(button.classList.contains('pulse')){
        button.classList.remove("pulse");
      }
      void button.offsetWidth;
      // add pulse
      button.classList.add("pulse");
    }, false);
  }
}

export default initPulse;