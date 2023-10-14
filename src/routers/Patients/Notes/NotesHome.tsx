import { useFetcher, useLoaderData } from "react-router-dom";
import { db, remoteDB } from "../../../db/couchdb";
import { DiagnosticsObject, PatientDocument } from "../../../models/Patient";
import { iDocumentGetResponse } from "../../../models/PouchDbModels";
import { calculateAge, getAge } from "../../../utils/Calculation";
import { timeToDate } from "../../../utils/dateFormat";
import axios from "axios";

export async function loader({ params }: any) {
  const patient = new PatientDocument();

  try {
    const response: iDocumentGetResponse = await db.get(params.patientId);
    patient.processPatientGetDocument(response);
    return { patient };
  } catch (e) {
    throw new Response("", {
      status: 404,
      statusText: "No se encontro el dato!",
    });
  }
}

export async function action({ request, params }: any) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
  
    const getResp = await db.get(params.patientId);
    const patientDoc = new PatientDocument();
    patientDoc.processPatientGetDocument(getResp);

    if (updates.button === "new-note") {
        const newNote: DiagnosticsObject = {
          created_at: Date.now().toString(),
          note: updates.note,
          created_by: "admin",
        };
        const notes: DiagnosticsObject[] = [...patientDoc.notes, newNote];
        await db.put({ ...getResp, notes });
        await db.replicate.to(remoteDB);
        /// resets the note input
        const input = document.getElementById("patient-new-note-input") as HTMLInputElement;
        input.value = "";
      }
    
      if (updates.button === "update-note") {
        const noteId = updates.note_id;
    
        const notes: DiagnosticsObject[] = patientDoc.notes.map(
          (i: DiagnosticsObject) =>
            i.created_at === noteId
              ? {
                  created_at: i.created_at,
                  note: updates.note,
                  created_by: i.created_by,
                }
              : { created_at: i.created_at, note: i.note, created_by: i.created_by }
        );
    
        await db.put({ ...getResp, notes });
        await db.replicate.to(remoteDB);
    
        (document.getElementById(`button_note_edit-${noteId}`) as HTMLButtonElement).hidden = false;
        (document.getElementById(`button_note_ok-${noteId}`) as HTMLButtonElement).hidden = true;
        (document.getElementById(`button_note_remove-${noteId}`) as HTMLButtonElement).hidden = true;
    
        const input = document.getElementById(`note_input_element_id-${noteId}`) as HTMLInputElement;
        input.disabled = true;
      }
    
      if (updates.button === "remove-note") {
        if ( confirm(`Esta acción borra el registro permanentemente: ¿Seguro que de continuar?`) ) {
          const noteId = updates.note_id;
    
          const notes: DiagnosticsObject[] = patientDoc.notes.filter(
            (i: DiagnosticsObject) => i.created_at !== noteId );
    
          await db.put({ ...getResp, notes });
          await db.replicate.to(remoteDB);
    
          ( document.getElementById(`button_note_edit-${noteId}` ) as HTMLButtonElement ).hidden = false;
          ( document.getElementById(`button_note_ok-${noteId}`) as HTMLButtonElement).hidden = true;
          ( document.getElementById(`button_note_remove-${noteId}`) as HTMLButtonElement).hidden = true;
    
          const input = document.getElementById(`note_input_element_id-${noteId}`) as HTMLInputElement;
          input.disabled = true;
        }
      }
    
  /// always return something
  return null;

}


function onEditInput(e: React.MouseEvent<HTMLElement>) {
    const element = e.target as HTMLButtonElement;
    const noteId = element.id.split("-")[1];

    element.hidden = true;

    // (document.getElementById(`button_note_edit-${noteId}`) as HTMLButtonElement).hidden = false;
    (
      document.getElementById(`button_note_ok-${noteId}`) as HTMLButtonElement
    ).hidden = false;
    (
      document.getElementById(
        `button_note_remove-${noteId}`
      ) as HTMLButtonElement
    ).hidden = false;

    const inputElement = document.getElementById(
      `note_input_element_id-${noteId}`
    ) as HTMLInputElement;
    inputElement.disabled = false;
    inputElement.focus();
  }

 


export function NotesHome() {
  const { patient }: any = useLoaderData();
  const fetcher = useFetcher();


function togglePrintLoaderElements( printing: boolean, noteId: string){
  const loaderElement: HTMLElement = document.getElementById(`loader-${noteId}`) as HTMLElement;
  const printButElement: HTMLElement = document.getElementById(`printbut-${noteId}`) as HTMLElement;


  if( printing ){
    loaderElement.style.display = "block";
    printButElement.style.display = "none";
  } else {
    loaderElement.style.display = "none";
    printButElement.style.display = "block";
  }


}
  async function onPrintNote (e: React.MouseEvent<HTMLElement>) {
    
    const currentLocation = document.location.pathname.split('/')
    const patientId = currentLocation[2];
    const element = e.target as HTMLButtonElement;
    const noteId = element.id.split("-")[1];

    const url = `/pdf/nm?patientId=${patientId}&noteId=${noteId}`;

    togglePrintLoaderElements(true,noteId)

    const api = axios.create({
      method: "get",
      url,
      baseURL: "http://localhost:3407",
      headers: {
        "content-type": "application/json",
      },
    });
    

    try {
      const apiRes = await api.get(url);
      
      window.open(apiRes.data.downloadPath, "_blank");
      togglePrintLoaderElements(false, noteId)
    } catch (e) {
      togglePrintLoaderElements(false, noteId)
    }
  }


  async function onPrintAll () {
    
    const currentLocation = document.location.pathname.split('/')
    const patientId = currentLocation[2];
    
    const url = `/pdf/nm?patientId=${patientId}`;

    togglePrintLoaderElements(true,'all')

    const api = axios.create({
      method: "get",
      url,
      baseURL: "http://localhost:3407",
      headers: {
        "content-type": "application/json",
      },
    });
    

    try {
      const apiRes = await api.get(url);
      
      window.open(apiRes.data.downloadPath, "_blank");
      togglePrintLoaderElements(false, 'all')
    } catch (e) {
      togglePrintLoaderElements(false, 'all')
    }
  }

  return (
    <>
      <h1>Información del Paciente</h1>
      <p>Nombre: <u>{patient.name} {patient.lastname} {patient.second_lastname} </u></p>
      <p>No Exp: <u>{patient.rec_no}</u></p>
      <p>Edad: <u>{getAge(patient.dob)}</u></p>
      <p>Servicio:<u> {patient.service}</u></p>
      <h1>Notas Médicas</h1>
      <p>
        <button onClick={onPrintAll} id={`printbut-all`}>Imprimir Todo</button>
        <span className="loader" style={{ display: "none"}} id={`loader-all`} ></span>
      </p>

      {!!patient.notes ? (
        !patient.notes.length ? (
          <div>
            <i>Sin Notas Medicas</i>
          </div>
        ) : (
          patient.notes.map((i: DiagnosticsObject) => (
            <fetcher.Form method="post" key={`form-${i.created_at}`} className="contact-form" >
                <label> Realizado por: {i.created_by} - {timeToDate(parseInt(i.created_at))}{" "} </label>
                <input type="text" name={`note`} defaultValue={i.note} id={`note_input_element_id-${i.created_at}`} disabled={true} />
                <input hidden name="note_id" value={i.created_at} readOnly></input>
                <p>
                    <button onClick={onEditInput} id={`button_note_edit-${i.created_at}`} > Editar</button>
                    <button name="button" value="update-note" id={`button_note_ok-${i.created_at}`} hidden>Ok</button>
                    <button name="button" value="remove-note" id={`button_note_remove-${i.created_at}`} hidden>x</button>
                    <button type="button" name="button" value="print" onClick={onPrintNote} id={`printbut-${i.created_at}`}>Imprimir</button> 
                    <span className="loader" style={{ display: "none"}} id={`loader-${i.created_at}`} ></span>
                </p>
            </fetcher.Form>
          ))
        )
      ) : (
        <div>
          <i>Sin Notas Medicas</i>
        </div>
      )}
      <fetcher.Form method="post" className="contact-form">
        <label>Nueva Nota</label>
        <input type="text" name="note" id="patient-new-note-input" />

        <p>
          <button name="button" value="new-note">Agregar</button>
        </p>
      </fetcher.Form>
    </>
  );
}
