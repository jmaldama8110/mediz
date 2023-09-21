import { Link, Outlet } from "react-router-dom";


export const PatientsHome = () => {
  return (
    <>
      <div id="sidebar">
      
        <h1>Pacientes</h1>
        
        
        <div>
        
          <form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
            />
            <div id="search-spinner" aria-hidden hidden={true} />
            <div className="sr-only" aria-live="polite"></div>
          </form>
          <form method="post">
            <button type="submit">Nuevo</button>
          </form>
        </div>
        <Link to='/dashboard'>Volver</Link>
        <nav>
          <ul>
            <li>
              <Link to={`/patients/1`}>Your Name</Link>
            </li>
            <li>
              <Link to={`/patients/2`}>Your Friend</Link>
            </li>
          </ul>
        </nav>
        
      </div>
      <div id="detail"><Outlet/></div>
      
    </>
  );
};
