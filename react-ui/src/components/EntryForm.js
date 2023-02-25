import { useState } from 'react';

const EntryForm = ({ onAdd }) => {
  const [text, setText] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    onAdd({ text })
    setText('')
  }
  return (
    <form onSubmit={onSubmit}>
    <div className='form-control'>
      <input
       type='text'
       placeholder='Add Entry'
       value={text}
       onChange={(e) => setText(e.target.value)}
      />
    </div>
    </form>
  )
}

export default EntryForm;
