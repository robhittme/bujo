import React, { useState, useEffect } from 'react';

import { BsXCircleFill } from 'react-icons/bs';
import Button from './Button';
import EntryTypeIcon from './EntryTypeIcon';

const Entry = ({ entry, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [entryUpdate, setEntryUpdate] = useState(entry)

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (e) => {
    setIsEditing(false);
    e.preventDefault()
    onUpdate(entry.id, entryUpdate)
  };

  const markCompleted = () => {
    setEntryUpdate({...entryUpdate, completed: !entryUpdate.completed })
    console.log({entryUpdate})
    onUpdate(entry.id, entryUpdate)
  };
  //exit editing mode on esc
  const handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const date = new Date(entry.created_timestamp * 1000);
  const entryDate = date.toLocaleDateString('default', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit'
  }).replace(/\//g, '.');
    return (
      <>
      { isEditing ? (
        <>
        <form onSubmit={handleSave}>
            <div className={'entry form-control input-container'}>
               <input type='text' defaultValue={entry.text} onChange={(e) => setEntryUpdate({text: e.target.value})}/>
               <span className={'float-right'}> <Button className={'icon'} icon={<BsXCircleFill />} action={() => onDelete(entry.id)} /></span>
            </div>
        </form>
        </>
      ) : (
        <>
        <div className={'entry'} onDoubleClick={handleEdit}>
          <span className ={entry.completed ? 'completed' : ''}>
            <span onClick={markCompleted}><EntryTypeIcon  entryType={entry.entry_type}/></span>{entry.text}
          </span>
          <p className={'date'}>{entryDate}</p>
        </div>
        </>
      )
      }
      </>
    )
}

export default Entry;
