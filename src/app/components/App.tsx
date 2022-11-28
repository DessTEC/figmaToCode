import * as React from 'react';
import '../styles/ui.css';

declare function require(path: string): any;

const App = ({}) => {
    const [code, setCode] = React.useState('');
    const [copySuccess, setCopySuccess] = React.useState('');
    const codeAreaRef = React.useRef(null);

    function copyToClipboard(e) {
        codeAreaRef.current.select();
        document.execCommand('copy');
        setCopySuccess('Copied!');
    }

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
            <button onClick={() => document.execCommand('copy', true, 'Haaa')}>Copy</button>

            <p>Code: </p>
            <pre>
                <code className="language-dart" ref={codeAreaRef}>
                    {code}
                </code>
            </pre>
        </div>
    );
};

export default App;
