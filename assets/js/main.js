(function () {
  var toggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');

  function closeNav() {
    mobileNav.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openNav() {
    mobileNav.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
        toggle.focus();
      }
    });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var form = document.getElementById('newsletterForm');
  var msg = document.getElementById('formMsg');
  if (form && msg) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var emailInput = form.querySelector('#newsletterEmail');
      if (!emailInput.checkValidity()) {
        msg.textContent = 'Please enter a valid email address.';
        emailInput.focus();
        return;
      }
      msg.textContent = "Thanks! Your 10% discount code is on its way to your inbox.";
      form.reset();
    });
  }

  document.querySelectorAll('.add-btn').forEach(function (button) {
    button.addEventListener('click', function () {
      button.textContent = '✓';
      button.disabled = true;
      setTimeout(function () {
        button.textContent = '+';
        button.disabled = false;
      }, 1200);
    });
  });
})();
