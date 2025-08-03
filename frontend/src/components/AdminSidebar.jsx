import axios from 'axios';
import logo from '../logo.png';
import '../pages/sideBar.css';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar({
  visible,
  AdminData = {},
  }){
    const navigate = useNavigate();
    if (!visible) return null;
    const handleLogout = () => {
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      navigate('/');
    }, 1000);
  };
    
    const { name = '', email = '', avatar } = AdminData;
    return (

        <aside className="sidebar">
          
              <img src={logo} alt="Calorie Craft" className="sidebar-logo" />
              <h2>Calorie Craft</h2>
              <img
                  src={'https://randomuser.me/api/portraits/lego/1.jpg'}
                  alt={name}
                  className="user-avatar"/>
              <h4>Hello, {name}</h4>
              <p>{email}</p>
              
              <nav className="sidebar-menu">
                <button onClick={() => navigate('/adminpage')} >Profile</button>
                <button onClick={() => navigate('/admincreatemeal')}>Create Meal</button>
                <button onClick={() => navigate('/addingredient')}>Create Ingredients</button>
                <button onClick={() => navigate('/adminshowmeals')}>Show Meals</button>
                <button onClick={()=> navigate('/createadmin')}>Create Admin </button>
                <button onClick={handleLogout}>Log out</button>
              </nav>
        </aside>
    );
}