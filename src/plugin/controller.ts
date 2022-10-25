import {flutterWidgetGenerator} from '../plugin/flutter/flutterMain';

figma.showUI(__html__, {width: 500, height: 600});

figma.ui.onmessage = (msg) => {
    if (msg.type === 'convertFlutter') {
        // This is how figma responds back to the ui
        figma.ui.postMessage({
            type: 'flutterCode',
            message: flutterWidgetGenerator(figma.currentPage.selection),
        });
    }
};
