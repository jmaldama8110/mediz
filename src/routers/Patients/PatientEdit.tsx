
import { Form,  redirect, useLoaderData, useNavigate } from "react-router-dom";
import { db, remoteDB } from "../../db/couchdb";
import { PatientDocument } from "../../models/Patient";
import { validateDateString, validateDateInFuture } from "../../utils/dateFormat";
import { FocusEvent, useState } from "react";


export async function action( { request, params }:any){
        const formData = await request.formData();
        const updates = Object.fromEntries(formData);
        
        const getResp = await db.get(params.patientId);
        
        const patientDoc = new PatientDocument();
        patientDoc.processGetDocument(getResp);
        await db.put( {...getResp, ...updates})
        await db.replicate.to(remoteDB);
        return redirect(`/patients/${params.patientId}`);
}

export default function PatientEdit() {
  const { patient }:any = useLoaderData();
  const navigate = useNavigate();

  const [dobError, setDobError] = useState(false);
  const [sexError, setSexError] = useState(false);

  function onDobInputBlur (e:FocusEvent<HTMLInputElement>){
    setDobError(false);
    if( !validateDateInFuture(e.target.value) ){
      setDobError(true);
    }
    if( !validateDateString(e.target.value)){
      setDobError(true);
    }
  }

  function onSexInputBlur (e:FocusEvent<HTMLInputElement>){
      setSexError(false);
      if( !(e.target.value === "M" || e.target.value === "F")){
        setSexError(true);
      }
  }

  return (
    
    <Form method="post" id="contact-form">
      <label>
        <span>Expediente #</span>
        <input
          placeholder="Expediente No"
          aria-label="Numero de expediente"
          type="text"
          name="rec_no" 
          defaultValue={patient.rec_no}
          disabled
        />
      </label>

      <label>
        <span>Nombre</span>
        <input
          placeholder="Nombre(s)"
          aria-label="Nombre(s)"
          type="text"
          name="name" 
          defaultValue={patient.name}
        />
      </label>

      <label>
        <span>A Pateno</span>
        <input
            placeholder="Apellido Paterno"
            aria-label="Apellido paterno"
            type="text"
            name="lastname"
            defaultValue={patient.lastname}
          />
      </label>
    <label>
      <span>A Materno</span>
        <input
          placeholder="Apellido Materno"
          aria-label="Apellido materno"
          type="text"
          name="second_lastname"
          defaultValue={patient.second_lastname}
        />
    </label >
    <label>
      <span>Sexo</span>
        <input
          placeholder="Sexo"
          aria-label="M o F"
          type="text"
          name="gender"
          defaultValue={patient.gender}
          onBlur={onSexInputBlur}
          onFocus={()=>{ setSexError(false)}}
          className={ sexError ? "border-error": ""}
        />
    </label >
      
      <label>
        <span>Fecha Nac</span>
        <input
          type="text"
          name="dob"
          placeholder="introduce una fecha" 
          defaultValue={patient.dob}
          onBlur={onDobInputBlur}
          onFocus={ ()=>{setDobError(false)}}
          className={ dobError ? "border-error" : ""}
        />
      </label>

      <label>
        <span>Domicilio</span>
        <input
          placeholder="calle, numero, colonia, poblacion, municipio, estado"
          aria-label="Domicilio"
          type="text"
          name="address"
          defaultValue={patient.address}
        />
      </label>
      <label>
        <span>Telefono</span>
        <input
          placeholder="(999)9999999"
          aria-label="Telefono"
          type="text"
          name="phone"
          defaultValue={patient.phone}
        />
      </label>
      <label>
        <span>Servicio</span>
        <input
          placeholder="... servicio por el cual ingresa"
          aria-label="Servicio de la clinica"
          type="text"
          name="service"
          defaultValue={patient.service}
        />
      </label>
      <label>
        <span>Tipo Sangre</span>
        <input
          placeholder="tipo de sangre"
          aria-label="Tipo de sangre"
          type="text"
          name="blood_type"
          defaultValue={patient.blood_type}
        />
      </label>
      <label>
        <span>Familiar</span>
        <input
          placeholder="...nombre del familiar responsable"
          aria-label="Familiar responsable"
          type="text"
          name="relative"
          defaultValue={patient.relative}
        />
      </label>

        {dobError && <i>Fecha de nacimiento no valida</i>}
        {sexError && <i>Sexo debe ser M (masculino) o F (femenino)</i>}
 
      <p>
        <button type="submit">Guardar</button>
        <button type="button" onClick={ ()=> navigate(-1)}>Cancel</button>
      </p>
    </Form>
    
  );
}
