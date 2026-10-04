(function () {
  var lightbox = document.getElementById("lightbox");
  var image = document.getElementById("lightbox-image");
  var title = document.getElementById("lightbox-title");
  var closeButton = lightbox.querySelector(".lightbox-close");
  var sheet = lightbox.querySelector(".lightbox-sheet");
  var lastTrigger = null;

  function openMap(button) {
    var name = button.getAttribute("data-title");
    image.src = button.getAttribute("data-map");
    image.alt = name + " town map";
    title.textContent = name;
    lastTrigger = button;
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  }

  function closeMap() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    image.removeAttribute("src");
    image.alt = "";
    document.body.classList.remove("lightbox-open");
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll(".hotspot").forEach(function (button) {
    button.addEventListener("click", function () {
      openMap(button);
    });
  });

  sheet.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  lightbox.addEventListener("click", function () {
    closeMap();
  });

  closeButton.addEventListener("click", function (event) {
    event.stopPropagation();
    closeMap();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !lightbox.hidden) {
      event.preventDefault();
      closeMap();
    }
  });
})();
