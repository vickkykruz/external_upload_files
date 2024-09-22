document.addEventListener('DOMContentLoaded', function () {
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      document.querySelector('.navbar').classList.add('active');
    } else {
      document.querySelector('.navbar').classList.remove('active');
    }
  });
});