// blong.dev — shared nav + footer, injected on every page so they live in one place.
(function () {
  const path = (location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '')) || '/';
  const links = [
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/demos', label: 'Demos' },
    { href: '/about', label: 'About' },
  ];
  const nav = document.createElement('nav');
  nav.innerHTML =
    '<a class="brand" href="/">b<b>long</b>.dev</a>' +
    '<div class="nav-links">' +
      links.map(l => `<a href="${l.href}"${path === l.href ? ' class="active"' : ''}>${l.label}</a>`).join('') +
      '<a href="https://gnosis.blong.dev" class="signin">Sign In</a>' +
    '</div>';
  document.body.insertBefore(nav, document.body.firstChild);

  const footer = document.createElement('footer');
  footer.innerHTML = '© ' + new Date().getFullYear() + ' Braedon Long';
  document.body.appendChild(footer);
})();
