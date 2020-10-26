'use strict';
import init from './home.js';

init();

if (module.hot) {
    module.hot.accept('./home.js', function() {
        init();
    })
}