define([], function () {
  return {
    write  : function (name, value, days, path, domain, secure) {
      var expires = '',
          cookieDomain = '',
          valueToUse = '',
          secureFlag = '',
          date;

      path = path || "/";

      if (domain) {
        cookieDomain = '; domain=' + domain;
      }

      if (days) {
        (date = new Date()).setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }

      if (typeof value === "object") {
        valueToUse = JSON.stringify({v: value});
      } else {
        valueToUse = encodeURIComponent(value);
      }
      if (secure) {
        secureFlag = "; secure";
      }

      document.cookie = name + "=" + valueToUse + cookieDomain + expires + "; path=" + path + secureFlag;
    },
    read : function (key) {
      var r = new RegExp('(^|;)\\s*'+key+'=(.*?)\\s?(;|$)').exec(document.cookie), value;

      if (!r) {
        return null;
      }

      value = r[2]; //2nd capture group.

      if (value[0] === '{' && value[value.length-1] === '}') {
        value = JSON.parse(value);
        value = typeof value.v !== 'undefined' ? value.v : value;
      }

      return typeof value === 'object' ? value : decodeURIComponent(value);
    },
    destroy: function (name) {
      var domain = location.hostname.match(/\.?(([^.]+)\.[^.]+.?)$/)[1];

      // Carpet bomb. No idea what the host of the cookie is.
      this.write(name, "", -1, null, location.hostname);
      location.hostname !== domain && this.write(name, "", -1, null, domain);
      this.write(name, "", -1, null, '.' + domain);
    }
  };
});
