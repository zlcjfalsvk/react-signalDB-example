import React from 'react';

function BasicApp() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Basic React App Test</h1>
      <p>Count: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Click me
      </button>
      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f0f0f0',
        }}
      >
        <p>If you can see this and the button works, React is functioning!</p>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

export default BasicApp;
