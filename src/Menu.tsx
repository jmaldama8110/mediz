import { Link } from "react-router-dom";

export default function Menu () {
    return (
        <nav>
            <li><Link to='/config'>Configuracion</Link></li>
            <li><Link to='/users'>Usuarios</Link></li>
            <li><Link to='/patients'>Pacientes</Link></li>
        </nav>
    );
}