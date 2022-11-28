import {flutterWidgetGenerator} from '../plugin/flutter/flutterMain';

figma.showUI(__html__);
figma.ui.resize(350, 500);

figma.ui.onmessage = (msg) => {
    if (msg.type === 'convertFlutter') {
        // This is how figma responds back to the ui
        console.log(figma.currentPage.selection);
        figma.ui.postMessage({
            type: 'flutterCode',
            message: flutterWidgetGenerator(figma.currentPage.selection),
        });
    }
};
