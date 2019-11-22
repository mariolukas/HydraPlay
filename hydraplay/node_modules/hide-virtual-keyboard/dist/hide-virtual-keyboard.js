
/**
 * hide-virtual-keyboard - Hides virtual keyboard on a real mobile device
 *
 * @version 1.0.0
 * @link https://github.com/caiogondim/hide-virtual-keyboard.js#readme
 * @author Caio Gondim
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root,factory){if(typeof exports==="object"&&typeof module==="object")module.exports=factory();else if(typeof define==="function"&&define.amd)define([],factory);else if(typeof exports==="object")exports["hideVirtualKeyboard"]=factory();else root["hideVirtualKeyboard"]=factory()})(this,function(){return function(modules){var installedModules={};function __webpack_require__(moduleId){if(installedModules[moduleId])return installedModules[moduleId].exports;var module=installedModules[moduleId]={exports:{},id:moduleId,loaded:false};modules[moduleId].call(module.exports,module,module.exports,__webpack_require__);module.loaded=true;return module.exports}__webpack_require__.m=modules;__webpack_require__.c=installedModules;__webpack_require__.p="";return __webpack_require__(0)}([function(module,exports){"use strict";module.exports=function hideVirtualKeyboard(){if(document.activeElement&&document.activeElement.blur&&typeof document.activeElement.blur==="function"){document.activeElement.blur()}}}])});