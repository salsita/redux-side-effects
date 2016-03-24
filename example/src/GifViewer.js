import React from 'react';
import { connect } from 'react-redux';

export default connect(appState => appState)(({ gifUrl, topic, loading, dispatch }) => {
  if (!loading) {
    return (
      <div>
        {gifUrl && <img src={gifUrl} width={200} height={200} />}
        <br />
        Topic: <input type="text" onChange={ev => dispatch({ type: 'CHANGE_TOPIC', payload: ev.target.value })} value={topic} /><br />
        <button onClick={() => dispatch({ type: 'LOAD_GIF' })}>Load GIF!</button>
      </div>
    );
  } else {
    return <div>Loading</div>;
  }
});
