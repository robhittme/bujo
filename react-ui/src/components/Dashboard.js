import { useState, useEffect } from 'react';
import Entries from './Entries';
//import AuthContext from '../context/AuthProvider';
import EntryForm from './EntryForm';

function Dashboard() {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const getEntries = async () => {
      try {
      const entriesFromServer = await fetchEntries()
      setEntries(entriesFromServer)
      } catch (error) {
       throw new Error('unauthorized')
      }
    }
    getEntries()
  }, [])

  const addEntry = async (entry) => {
    const res = await fetch('http://localhost:4444/bujo/entry',
      {
        method: 'POST',
        headers: {
          'content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      })
    const t = await res.json();
    setEntries([...entries, t])
  }

  const updateEntry = async (entryId, updates) => {
    const res = await fetch(`http://localhost:4444/bujo/entry/${entryId}`,
      {
        method: 'PUT',
        headers: {
          'content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
    const t = await res.json();
    setEntries(entries.map((entry) => entry.id === t.id ? entry = t : entry))
  }

  const deleteEntry = async (entryId) => {
    const res = await fetch(`http://localhost:4444/bujo/entry/${entryId}`,
      {
        method: 'DELETE'
      }
    )
    return res.status === 204 ? setEntries(entries.filter((t => t.id !== entryId))) : alert('error deleting entry')
  }

  const fetchEntries = async () => {
    const res = await fetch('http://localhost:4444/bujo/entries', {
      headers: {Authentication: `Bearer asdf`}
    })
    const data = await res.json();

    return data;
  }
  return (
    <>
    <EntryForm onAdd={addEntry}/>
    <Entries entries={entries} onDelete={deleteEntry} onUpdate={updateEntry} />
    </>
  );

}

export default Dashboard
