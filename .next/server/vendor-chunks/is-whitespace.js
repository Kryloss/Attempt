"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-whitespace";
exports.ids = ["vendor-chunks/is-whitespace"];
exports.modules = {

/***/ "(rsc)/./node_modules/is-whitespace/index.js":
/*!*********************************************!*\
  !*** ./node_modules/is-whitespace/index.js ***!
  \*********************************************/
/***/ ((module) => {

eval("/*!\n * is-whitespace <https://github.com/jonschlinkert/is-whitespace>\n *\n * Copyright (c) 2014-2015, Jon Schlinkert.\n * Licensed under the MIT License.\n */\n\n\n\nvar cache;\n\nmodule.exports = function isWhitespace(str) {\n  return (typeof str === 'string') && regex().test(str);\n};\n\nfunction regex() {\n  // ensure that runtime compilation only happens once\n  return cache || (cache = new RegExp('^[\\\\s\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF\"]+$'));\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvaXMtd2hpdGVzcGFjZS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRWE7O0FBRWI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmVzZW5kLWVtYWlsLWNvbmZpcm1hdGlvbi8uL25vZGVfbW9kdWxlcy9pcy13aGl0ZXNwYWNlL2luZGV4LmpzP2VhNjYiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBpcy13aGl0ZXNwYWNlIDxodHRwczovL2dpdGh1Yi5jb20vam9uc2NobGlua2VydC9pcy13aGl0ZXNwYWNlPlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNC0yMDE1LCBKb24gU2NobGlua2VydC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjYWNoZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc1doaXRlc3BhY2Uoc3RyKSB7XG4gIHJldHVybiAodHlwZW9mIHN0ciA9PT0gJ3N0cmluZycpICYmIHJlZ2V4KCkudGVzdChzdHIpO1xufTtcblxuZnVuY3Rpb24gcmVnZXgoKSB7XG4gIC8vIGVuc3VyZSB0aGF0IHJ1bnRpbWUgY29tcGlsYXRpb24gb25seSBoYXBwZW5zIG9uY2VcbiAgcmV0dXJuIGNhY2hlIHx8IChjYWNoZSA9IG5ldyBSZWdFeHAoJ15bXFxcXHNcXHgwOVxceDBBXFx4MEJcXHgwQ1xceDBEXFx4MjBcXHhBMFxcdTE2ODBcXHUxODBFXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMEFcXHUyMDJGXFx1MjA1RlxcdTMwMDBcXHUyMDI4XFx1MjAyOVxcdUZFRkZcIl0rJCcpKTtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/is-whitespace/index.js\n");

/***/ })

};
;