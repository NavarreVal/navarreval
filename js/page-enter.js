document.documentElement.classList.add("page-slide");
document.body.classList.add("page-enter");
requestAnimationFrame(function () {
  requestAnimationFrame(function () {
    document.body.classList.add("page-enter-active");
  });
});

function clearPageEnter(e) {
  if (e && e.propertyName && e.propertyName !== "transform") return;
  document.body.classList.remove("page-enter", "page-enter-active");
  document.documentElement.classList.remove("page-slide");
  document.body.style.transform = "";
}

document.body.addEventListener("transitionend", clearPageEnter);
setTimeout(clearPageEnter, 700);
