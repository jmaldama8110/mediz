import { Link } from "react-router-dom";

export default function Index() {
    return (
      <p id="zero-state">
        Modulo de Pacientes.
        <br />
        Consulta aquí mas información sobre esta herramienta en {" "}
        <Link to="https://aristanetworks.cloud" target="_blank">
            ANET Cloud
        </Link>
        .
      </p>
    );
  }