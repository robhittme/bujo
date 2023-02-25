import { BsDot, BsRecord , BsDash } from 'react-icons/bs';
const getIcon = (type) => {
  let icon = <BsDot />;
  if(type === 'event') icon = <BsRecord />;
  if(type === 'note') icon = <BsDash />;
  return icon;
}
const EntryTypeIcon = ({entryType}) => {
  const icon = getIcon(entryType);
  return (
    <>
    <span>{icon}</span>
    </>
  )
}

export default EntryTypeIcon
