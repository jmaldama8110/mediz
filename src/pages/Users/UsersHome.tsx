import { useState } from "react";
import './SomeCss.css';
import { Link } from "react-router-dom";
import { db, remoteDB } from "../../db/couchdb";
// import { db, remoteDB } from "../../db/couchdb";

function UsersHomes () {

    const [loading, setLoading] = useState<boolean>(false);
    async function onSyncData() {
        setLoading(true);
        try {
            await db.replicate.from(remoteDB);
            setLoading(false)
            alert('Se descargaron cambios, OK!');
        }
        catch(e){
            setLoading(false);
            alert('An error ocurred when attempting to download de DB!');
        }

    }

    async function onUploadData() {
        setLoading(true);
        try{
            await db.replicate.to(remoteDB);
            alert('Bien, se subieron cambios!');
            setLoading(false);
        }
        catch(e){
            alert('An error ocurred when attempting to upload de DB!');
            setLoading(false);
        }
    }
    return (
        <>
            <div className="contenedor">
                
                <h1>Usuarios</h1>
                { 
                loading ? <span className="loader"></span> 
                : 
                <>
                <button onClick={onSyncData}>Sincronizar Datos</button>
                
                <button onClick={onUploadData}>Subir Datos</button>
                </>
                }
                
            </div>
            <Link to='/dashboard'>Volver</Link>
        </>
    );
}

export { UsersHomes as default };