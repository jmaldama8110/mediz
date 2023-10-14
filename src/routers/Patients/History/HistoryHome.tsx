import { Form, useLoaderData } from "react-router-dom";
import { db } from "../../../db/couchdb";
import { PatientDocument } from "../../../models/Patient";
import { iDocumentGetResponse } from "../../../models/PouchDbModels";
import { getAge } from "../../../utils/Calculation";
import { useContext, useEffect } from "react";
import { iPatientHistoryElement } from "../../../reducer/PatientHistory";
import { AppContext } from "../../../store/Store";
import "./HistoryHome.css";

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

function onTogglePanel (e: React.MouseEvent<HTMLElement>){
  const element = e.target as HTMLButtonElement;
  
  element.classList.toggle('activated')
  const panel: HTMLElement = element.nextElementSibling as HTMLElement;
  if (panel.style.maxHeight) {
    panel.style.maxHeight = '';
  } else {
    panel.style.maxHeight = panel.scrollHeight + "px";
  }
  
}

function updatePanelHeight (elementId: string){
  const element = document.getElementById(elementId) as HTMLButtonElement;
  const panel: HTMLElement = element.nextElementSibling as HTMLElement;
  if (panel.style.maxHeight) {
    panel.style.maxHeight = panel.scrollHeight + "px";
  }
}

export function HistoryHome() {
  const { patient }: any = useLoaderData();
  
 return (
    <>
      <h1>Información del Paciente</h1>
      <p> Nombre:{" "} <u> {patient.name} {patient.lastname} {patient.second_lastname}{" "}</u></p>
      <p>No Exp: <u>{patient.rec_no}</u></p>
      <p>Edad: <u>{getAge(patient.dob)}</u></p>
      <p>Servicio:<u> {patient.service}</u></p>
      
      
      {/* Antecedentes Hereditario y Familiares */}
      <InheritedAilments />
      {/* Antecedentes Personales no Patologicos */}
      <PersonalNoPatologicAilments />
      <PersonalPatologicAilments />
      <GynecologyRecord />
      <CurrentMedication />
      <CurrentAilment />
      <SystemsQuestionaire />
      <PhysicalExploration />
      <AnalysisAndDiagnostics />

    </>
  );
}

function InheritedAilments ( ) {

  const { inheritedAilments, dispatchInheritedAilments } = useContext(AppContext)    

  function onAddAilments (){

    const inputName:HTMLInputElement = document.getElementById('inherited-ailtment-input-name') as HTMLInputElement;
    const inputRelative:HTMLInputElement = document.getElementById('inherited-ailtment-input-relative') as HTMLInputElement;

    
      dispatchInheritedAilments({
        type: 'ADD',
        item: {
          id: Date.now(),
          text1: inputName.value,
          text2: inputRelative.value,
          text3: '',
          active: false,
        }
      });

      resetInheritedAilmentsInputs();
  }

  function resetInheritedAilmentsInputs(){
    const inputName:HTMLInputElement = document.getElementById('inherited-ailtment-input-name') as HTMLInputElement;
    const inputRelative:HTMLInputElement = document.getElementById('inherited-ailtment-input-relative') as HTMLInputElement;

    inputName.value ='';
    inputRelative.value = '';
  }
  
  useEffect( ()=>{
    updatePanelHeight('inherited-ailtment-accordion')
  },[inheritedAilments])

  return (
    <>
      
      <button className="accordion" onClick={onTogglePanel} id='inherited-ailtment-accordion'>Antecedentes Hereditario y Familiares</button>
      <div className="panel">
        <div className="row">
          <label>
            <b>Padecimientos</b>
          </label>
          <label>
            <b>Familiar que lo padece</b>
          </label>
        </div>
        {inheritedAilments.map((i: iPatientHistoryElement) => (
          <div key={i.id}>
            <div className="row">
              <label>{i.text1}</label>
              <label>{i.text2}</label>
              <div className="row-action">
                <button>Editar</button>
                <button style={{ color: "red" }}>Quitar</button>
                <button>Guardar</button>
              </div>
            </div>
          </div>
        ))}
        <p></p>
        <Form className="contact-form">
          <label><span>Nombre del padecimiento</span><input type="text" id='inherited-ailtment-input-name'></input></label>
          <label><span>Familiar que lo padece</span><input type="text" id='inherited-ailtment-input-relative'></input></label>
          <p>
            <button onClick={onAddAilments}>Agregar</button>
          </p>
        </Form>


      </div>

    </>
  );
}


function PersonalNoPatologicAilments () {
  return (
    <>
      
    <button className="accordion" onClick={onTogglePanel}>Antecedentes Personales no Patológicos</button>
    <div className="panel">
      <Form className="contact-form">
          <label><span>Lugar de Nacimiento</span><input type="text" /></label>
          
          <label><span>Lugar de Residencia</span><input type="text" /></label>
          <label><span>Fecha</span><input type="text" /></label>
          <label><span>Ocupacion actual</span><input type="text" /></label>
          <label><span>Habito tabaquico</span><input type="text" /></label>
          <label><span>Habito Alcoholico</span><input type="text" /></label>
          <label><span>Adicciones</span><input type="text" /></label>

          <label><span>Tipo de Sangre:</span><input type='text' /></label>
          <label><span>Factor Rh:</span><input type='text' /></label>
          <label><span>Alergias</span><input type='text' /></label>
        </Form>
    </div>



    </>
  );
}
function PersonalPatologicAilments (){


  const { patologicPersonalAilments, dispatchPatologicPersonalAilments } = useContext(AppContext);


    function onAddPatologicPersonalAilment () {

        const inputName: HTMLInputElement = document.getElementById('patologic-personal-ailment-input-name') as HTMLInputElement;
        const inputStartDate: HTMLInputElement = document.getElementById('patologic-personal-ailment-input-start-date') as HTMLInputElement;
        const inputActive: HTMLInputElement = document.getElementById('patologic-personal-ailment-input-active') as HTMLInputElement;

        dispatchPatologicPersonalAilments( {
          type:'ADD',
          item: {
            id: Date.now(),
            text1: inputName.value,
            text2: inputStartDate.value,
            text3: '',
            active: !!inputActive.value,
          }
        });
        resetAllFormInputs();
    }

    function resetAllFormInputs(){
      const inputName: HTMLInputElement = document.getElementById('patologic-personal-ailment-input-name') as HTMLInputElement;
      const inputStartDate: HTMLInputElement = document.getElementById('patologic-personal-ailment-input-start-date') as HTMLInputElement;
      const inputActive: HTMLInputElement = document.getElementById('patologic-personal-ailment-input-active') as HTMLInputElement;
      inputName.value ='';
      inputStartDate.value = '';
      inputActive.value = '';
    }

  return (
    <>
      
      <button className="accordion" onClick={onTogglePanel}>Antecedentes Personales Patológicos</button>
      <div className="panel">
        <div className="row">
          <label><b>Enfermedad</b></label>
          <label><b>Fecha de Inicio</b></label>
          <label><b>Activo/ Inactivo</b></label>
        </div>
        {patologicPersonalAilments.map((i: iPatientHistoryElement) => (
          <div key={i.id}>
            <div className="row">
              <label>{i.text1}</label>
              <label>{i.text2}</label>
              <label>{i.active ? 'x' : ''}</label>
              <div className="row-action">
                <button>Editar</button>
                <button style={{ color: "red" }}>Quitar</button>
                <button>Guardar</button>
              </div>
            </div>
          </div>
        ))}
        
        <Form className="contact-form">
          <label><span>Enfermedad</span><input type="text" id='patologic-personal-ailment-input-name'></input></label>
          <label><span>Fecha de Inicio</span><input type="text" id='patologic-personal-ailment-input-start-date'></input></label>
          <label><span>Activa/Inactiva</span><input type="text" id='patologic-personal-ailment-input-active'></input></label>
          <p>
            <button onClick={onAddPatologicPersonalAilment}>Agregar</button>
          </p>
        </Form>
      </div>
   </>
  );

}

function GynecologyRecord () {

    return (
      <>
        <button className="accordion" onClick={onTogglePanel}>Antecedentes Ginecoobstétrico</button>
        <div className="panel">
          <Form className="contact-form">
            <label><span>Menarca</span> <input type="text" /></label>
            <label><span>FUR  </span><input type="text" /></label>
            <label><span>Método Anticonceptivo </span> <input type="text" /></label>
            <label><span>G: </span><input type="text" /></label>
            <label><span>P: </span><input type="text" /></label>
            <label><span>C: </span><input type="text" /></label>
            <label><span>A: </span><input type="text" /></label>
            <label><span>Fecha Papanicolau:</span> <input type="text" /></label>
            <label><span>Fecha Mastografía:</span> <input type="text" /></label>
          </Form>
        </div>

      </>
    );
}

function CurrentMedication () {

  const  { currentMedication, dispatchCurrentMedications } = useContext(AppContext);

  function onAddMedicationItems(){
    const inputName: HTMLInputElement = document.getElementById('current-medication-input-name') as HTMLInputElement;
    const inputDosis: HTMLInputElement = document.getElementById('current-medication-input-dosis') as HTMLInputElement;
    const inputStartDate: HTMLInputElement = document.getElementById('current-medication-input-start-date') as HTMLInputElement;

    dispatchCurrentMedications({
      type: "ADD",
      item: {
        id: Date.now(),
        text1: inputName.value,
        text2: inputDosis.value,
        text3: inputStartDate.value,
        active: false
      }
    })
    resetAllFormInputs();

  }

  function resetAllFormInputs(){
    const inputName: HTMLInputElement = document.getElementById('current-medication-input-name') as HTMLInputElement;
    const inputDosis: HTMLInputElement = document.getElementById('current-medication-input-dosis') as HTMLInputElement;
    const inputStartDate: HTMLInputElement = document.getElementById('current-medication-input-start-date') as HTMLInputElement;
    inputName.value = '';
    inputDosis.value = '';
    inputStartDate.value = '';
  }

  return (
    <>
        
        <button className="accordion" onClick={onTogglePanel}>Medicación Actual</button>
        <div className="panel">
          <div className="row"><label><b>Medicamente</b></label>
            <label><b>Dosis</b></label>
            <label><b>Fecha de inicio</b></label>
          </div>
          {currentMedication.map((i: iPatientHistoryElement) => (
            <div key={i.id}>
              <div className="row">
                <label>{i.text1}</label>
                <label>{i.text2}</label>
                <label>{i.text3}</label>
                <div className="row-action">
                  <button>Editar</button>
                  <button style={{ color: "red" }}>Quitar</button>
                  <button>Guardar</button>
                </div>
              </div>
            </div>
          ))}
          
          <Form className="contact-form">
            <label><span>Medicamente</span><input type="text" id='current-medication-input-name'></input></label>
            <label><span>Dosis</span><input type="text" id='current-medication-input-dosis'></input></label>
            <label><span>Fecha de inicio</span><input type="text" id='current-medication-input-start-date'></input></label>
            <p>
              <button onClick={onAddMedicationItems}>Agregar</button>
            </p>
          </Form>
        </div>


      
    </>
  );
}

function CurrentAilment () {
  return (
    <>
        <button className="accordion" onClick={onTogglePanel}>Padecimiento Actual</button>
        <div className="panel">
          <Form className="contact-form">
            <label>Motivo de la consulta</label>
            <textarea></textarea>
          </Form>
        </div>
      
    </>
  );
}

function SystemsQuestionaire (){
  return (
    <>
      <button className="accordion" onClick={onTogglePanel}>Interrogatorio por Aparatos y Sistemas</button>
      <div className="panel">
        <Form className="contact-form">
          <label><span>Digestivo</span><input type="text"/></label> 
          <label><span>Respiratorio</span><input type="text"/></label> 
          <label><span>Circulatorio</span><input type="text"/></label> 
          <label><span>Musculoesquelético</span><input type="text"/></label> 
          <label><span>Nervioso</span><input type="text"/></label> 
          <label><span>Urinario</span><input type="text"/></label> 
          <label><span>Reproductor</span><input type="text"/></label> 
          <label><span>Sentidos</span><input type="text"/></label> 
        </Form>
      </div>
    </>
  );

}

function PhysicalExploration (){
  return (
    <>
      <button className="accordion" onClick={onTogglePanel}>Exploración Física</button>
      <div className="panel">
        <Form className="contact-form">
          <label><span>T.A:</span><input type="text"/></label> 
          <label><span>Puslo:</span><input type="text"/></label> 
          <label><span>FR:</span><input type="text"/></label> 
          <label><span>FC:</span><input type="text"/></label> 
          <label><span>Temp:</span><input type="text"/></label> 
        </Form>
      </div>
    
    </>
  );

}

function AnalysisAndDiagnostics (){
  return (
    <>

      
      <button className="accordion" onClick={onTogglePanel}>Análisis y Diagnóstico</button>
      <div className="panel">
        <Form className="contact-form">
          <label><span>Análisis</span><textarea></textarea></label>
          <label><span>Impresión diagnóstica</span><textarea></textarea></label>
          <label><span>Plan Diagnóstico</span><textarea></textarea></label>
          <label><span>Plan Terapéutico</span><textarea></textarea></label>
          <p>
            <button>Guardar Todo</button>
          </p>
        </Form>
      </div>
    </>
  );

}

