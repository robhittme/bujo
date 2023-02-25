import PropTypes from 'prop-types';

const Header = ({ title, date }) => {

  const today = date;
  const entryDate = today.toLocaleDateString('default', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit'
  }).replace(/\//g, '.');
    return (
          <header className='header'>
            <h1>{title}</h1>
            <p>{entryDate}</p>
          </header>
        )
}

Header.defaultProps = {
    title: 'Bujo Journal',
    date: new Date()
}

Header.propTypes = {
    title: PropTypes.string.isRequired,
}

export default Header;

