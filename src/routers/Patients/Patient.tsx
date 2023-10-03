import { Form, useFetcher, useLoaderData } from "react-router-dom";
import { PatientDocument } from "../../models/Patient";
import { db, remoteDB } from "../../db/couchdb";
import { iDocumentGetResponse } from "../../models/PouchDbModels";
import avatarImg from "../../assets/avatar.svg";

export async function loader ( { params }:any){

  const patient = new PatientDocument();

  try {
    const response: iDocumentGetResponse = await db.get(params.patientId);
    patient.processPatientGetDocument(response);
    return { patient };
  }
  catch(e){
    throw new Response("",{
      status: 404,
      statusText: "No se encontro el dato!"
    })
    
  }
  
}

export async function action( {request, params}:any){
  let formData = await request.formData();
  const getResp = await db.get(params.patientId);
     
  const patient = new PatientDocument();
  patient.processGetDocument(getResp);
  
  await db.put( {...getResp, highlight: formData.get("highlight") === "true" })
  await db.replicate.to(remoteDB);

  return { patient }
}
export default function Patient(){

    const { patient }:any = useLoaderData();
    return (
        
        <div className="contact">  
          <div>
            <h1>
              {patient.name || patient.lastname ? (
                <>
                  {patient.name} {patient.lastname}
                </>
              ) : (
                <i>Anónimo</i>
              )}{" "}
              <Favorite patient = {patient} />
            </h1>
    
            { patient.service && <p>{patient.service}</p>}
    
            <div>
              <Form action="edit">
                <button type="submit">Editar</button>
              </Form>
              
              <Form action="notes">
                <button type="submit">Notas Médicas</button>
              </Form>

              <Form action="history">
                <button type="submit">Historia</button>
              </Form>

              <Form
                method="post"
                action="destroy"
                onSubmit={(event:any) => {
                  if (
                    !confirm(`Esta acción deshabilitará el registro de ${patient.name} ${patient.lastname}: ¿Seguro que de continuar?`)
                  ) {
                    event.preventDefault();
                  }
                }}
              >
                <button type="submit">Desactivar</button>
              </Form>
            </div>
          </div>
        </div>
      );
    }
    
    function Favorite( { patient }:any ) {
      // yes, this is a `let` for later
      let highlight = patient.highlight;
      const fetcher = useFetcher();

      if( fetcher.formData ){
        highlight = fetcher.formData.get("highlight") === 'true';
      }

      return (
        <fetcher.Form method="post">
          
          <button
            name="highlight"
            value={highlight ? "false" : "true"}
            aria-label={
              highlight
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            {highlight ? "★" : "☆"}
            
          </button>
        </fetcher.Form>
      );
    }