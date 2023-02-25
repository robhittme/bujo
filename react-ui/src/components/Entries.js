import Entry from './Entry';
const Entries = ({ entries, onDelete, onUpdate }) => {
  return (
    <>
    {entries.map((t => <Entry key={t.id} entry={t} onDelete={onDelete} onUpdate={onUpdate} />))}
    </>
  )
}

export default Entries;
