import React from 'react';
import './App.css';
import { CombinedSelector} from './Select';

function App() {
  return (
    <div className="App">
      <p>
        Data viewer
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <div style={{width:'80%'}}>     
          <CombinedSelector />
        </div>
      </div>
    </div>
  );
}

export default App;
