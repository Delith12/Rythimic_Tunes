import { NavLink } from 'react-router-dom';
import { FaHome, FaHeart, FaList, FaBars } from 'react-icons/fa';

function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <div className="navbar">
      <h2>Rythimic Tunes</h2>
      <button className="hamburger" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <nav className={`nav-menu ${isOpen ? 'open' : ''}`}>
        <NavLink to="/" className="nav-link" onClick={toggleSidebar}>
          <FaHome /> Songs
        </NavLink>
        <NavLink to="/favorites" className="nav-link" onClick={toggleSidebar}>
          <FaHeart /> Favorites
        </NavLink>
        <NavLink to="/playlist" className="nav-link" onClick={toggleSidebar}>
          <FaList /> Playlist
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;