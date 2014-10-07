(function (S, p, o, O, n, X) {
  if (O=/(sxj=(.*?))($|&)/.exec(location)) {
    ((n = new Date()).setYear(n.getFullYear()+10))&&(p.cookie='sx_jwt='+O[2]+';path=/;expires='+n);
    location.href=location.href.replace(O[0], '').replace(/(&|\?)$/, '');
  }

  S.test(p.cookie) && !(X = p.createElement('script')).setAttribute('src', o) && p.head.appendChild(X);
})(/sx_jwt=/, document, '//cdn.picnicx.com/scripts/sx-editor.js');
