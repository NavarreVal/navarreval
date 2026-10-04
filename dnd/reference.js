(function () {
  var lightbox = document.getElementById("portrait-lightbox");
  var image = document.getElementById("portrait-lightbox-image");
  var title = document.getElementById("portrait-lightbox-title");
  var closeButton = lightbox.querySelector(".portrait-lightbox-close");
  var sheet = lightbox.querySelector(".portrait-lightbox-sheet");
  var lastTrigger = null;

  function openPortrait(button) {
    var name = button.getAttribute("data-title");
    image.src = button.getAttribute("data-full");
    image.alt = name;
    title.textContent = name;
    lastTrigger = button;
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  }

  function closePortrait() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    image.removeAttribute("src");
    image.alt = "";
    document.body.classList.remove("lightbox-open");
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll(".portrait").forEach(function (button) {
    button.addEventListener("click", function () {
      openPortrait(button);
    });
  });

  sheet.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  lightbox.addEventListener("click", function () {
    closePortrait();
  });

  closeButton.addEventListener("click", function (event) {
    event.stopPropagation();
    closePortrait();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !lightbox.hidden) {
      event.preventDefault();
      closePortrait();
    }
  });
})();
