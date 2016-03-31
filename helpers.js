/* DOM helpers
**************************************/

// Get elements by CSS selector:
function qs(selector, scope) {
	return (scope || document).querySelector(selector);
}
function qsa(selector, scope) {
	return (scope || document).querySelectorAll(selector);
}

// Add and remove event listeners:
function on(target, type, callback, useCapture) {
	target.addEventListener(type, callback, !!useCapture);
}
function off(target, type, callback, useCapture) {
	target.removeEventListener(type, callback, !!useCapture);
}