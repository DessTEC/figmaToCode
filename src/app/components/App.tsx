import * as React from 'react';
import '../styles/ui.css';
import ClipboardJS from 'clipboard';
import {copyToClipboard} from 'figx';

new ClipboardJS('.button');

declare function require(path: string): any;

const App = ({}) => {
    const [code, setCode] = React.useState('');
    const [copySuccess, setCopySuccess] = React.useState('');

    const copyCode = (e) => {
        copyToClipboard(code);
        setCopySuccess('Copied!');
    };

    const onCreate = () => {
        parent.postMessage({pluginMessage: {type: 'convertFlutter'}}, '*');
    };

    const onCancel = () => {
        parent.postMessage({pluginMessage: {type: 'cancel'}}, '*');
    };

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = (event) => {
            const {type, message} = event.data.pluginMessage;
            if (type === 'flutterCode') {
                setCode(message);
            }
        };
    }, []);

    return (
        <div>
            <img src={require('../assets/logo.svg')} />
            <h2>Figma to Code</h2>
            <button id="create" onClick={onCreate}>
                Create
            </button>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={copyCode}>Copy</button>

            {copySuccess}

            <p>Code: </p>
            <pre>
                <code id="codeResult" className="language-dart">
                    {code}
                </code>
            </pre>
        </div>
    );
};

export default App;
