import {
  Form,
  redirect,
  useLoaderData,
  useNavigate,
  useFetcher,
} from "react-router-dom";
import { db, remoteDB } from "../../db/couchdb";
import { DiagnosticsObject, PatientDocument } from "../../models/Patient";
import {
  validateDateString,
  validateDateInFuture,
  timeToDate,
} from "../../utils/dateFormat";
import { FocusEvent, useState } from "react";
import axios from "axios";

export async function action({ request, params }: any) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const getResp = await db.get(params.patientId);
  const patientDoc = new PatientDocument();
  patientDoc.processPatientGetDocument(getResp);

  if (updates.button === "save") {
    await db.put({ ...getResp, ...updates });
    await db.replicate.to(remoteDB);
    return redirect(`/patients/${params.patientId}`);
  }
  if (updates.button === "new-note") {
    const newNote: DiagnosticsObject = {
      created_at: Date.now().toString(),
      note: updates.note,
      created_by: "admin",
    };
    const diagnostic: DiagnosticsObject[] = [...patientDoc.diagnostic, newNote];
    await db.put({ ...getResp, diagnostic });
    await db.replicate.to(remoteDB);
    /// resets the note input
    const input = document.getElementById(
      "patient-new-note-input"
    ) as HTMLInputElement;
    input.value = "";
  }

  if (updates.button === "update-note") {
    const noteId = updates.note_id;

    const diagnostic: DiagnosticsObject[] = patientDoc.diagnostic.map(
      (i: DiagnosticsObject) =>
        i.created_at === noteId
          ? {
              created_at: i.created_at,
              note: updates.note,
              created_by: i.created_by,
            }
          : { created_at: i.created_at, note: i.note, created_by: i.created_by }
    );

    await db.put({ ...getResp, diagnostic });
    await db.replicate.to(remoteDB);

    (
      document.getElementById(`button_note_edit-${noteId}`) as HTMLButtonElement
    ).hidden = false;
    (
      document.getElementById(`button_note_ok-${noteId}`) as HTMLButtonElement
    ).hidden = true;
    (
      document.getElementById(
        `button_note_remove-${noteId}`
      ) as HTMLButtonElement
    ).hidden = true;

    const input = document.getElementById(
      `note_input_element_id-${noteId}`
    ) as HTMLInputElement;
    input.disabled = true;
  }

  if (updates.button === "remove-note") {
    if (
      confirm(
        `Esta acción borra el registro permanentemente: ¿Seguro que de continuar?`
      )
    ) {
      const noteId = updates.note_id;

      const diagnostic: DiagnosticsObject[] = patientDoc.diagnostic.filter(
        (i: DiagnosticsObject) => i.created_at !== noteId
      );

      await db.put({ ...getResp, diagnostic });
      await db.replicate.to(remoteDB);

      (
        document.getElementById(
          `button_note_edit-${noteId}`
        ) as HTMLButtonElement
      ).hidden = false;
      (
        document.getElementById(`button_note_ok-${noteId}`) as HTMLButtonElement
      ).hidden = true;
      (
        document.getElementById(
          `button_note_remove-${noteId}`
        ) as HTMLButtonElement
      ).hidden = true;

      const input = document.getElementById(
        `note_input_element_id-${noteId}`
      ) as HTMLInputElement;
      input.disabled = true;
    }
  }

  /// always return something
  return null;
}

export default function PatientEdit() {
  const { patient }: any = useLoaderData();
  const fetcher = useFetcher();

  const navigate = useNavigate();

  const [dobError, setDobError] = useState(false);
  const [sexError, setSexError] = useState(false);

  const [loading, setLoading] = useState(false);

  function onDobInputBlur(e: FocusEvent<HTMLInputElement>) {
    setDobError(false);
    if (!validateDateInFuture(e.target.value)) {
      setDobError(true);
    }
    if (!validateDateString(e.target.value)) {
      setDobError(true);
    }
  }

  function onSexInputBlur(e: FocusEvent<HTMLInputElement>) {
    setSexError(false);
    if (!(e.target.value === "M" || e.target.value === "F")) {
      setSexError(true);
    }
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

  async function onPrint() {

    const currentLocation = document.location.pathname.split('/')
    const patientId = currentLocation[2];
    const url = `/pdf/hfr?patientId=${patientId}`;

    const api = axios.create({
      method: "get",
      url,
      baseURL: "http://localhost:3407",
      headers: {
        "content-type": "application/json",
      },
    });
    setLoading(true);

    try {
      const apiRes = await api.get(url);
      console.log(apiRes.data);
      setLoading(false);
      window.open(apiRes.data.downloadPath, "_blank");
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  }

  return (
    <>
      <Form method="post" className="contact-form">
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
        </label>
        <label>
          <span>Sexo</span>
          <input
            placeholder="Sexo"
            aria-label="M o F"
            type="text"
            name="gender"
            defaultValue={patient.gender}
            onBlur={onSexInputBlur}
            onFocus={() => {
              setSexError(false);
            }}
            className={sexError ? "border-error" : ""}
          />
        </label>

        <label>
          <span>Fecha Nac</span>
          <input
            type="text"
            name="dob"
            placeholder="introduce una fecha"
            defaultValue={patient.dob}
            onBlur={onDobInputBlur}
            onFocus={() => {
              setDobError(false);
            }}
            className={dobError ? "border-error" : ""}
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
          <button type="submit" name="button" value="save">
            Guardar
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          {!loading && (
            <button type="button" name="button" value="print" onClick={onPrint}>
              Hoja Frontal
            </button>
          )}
          {!!loading && <span className="loader"></span>}
        </p>
      </Form>

      <h1>Diagnostico</h1>
      {patient.diagnostic.map((i: DiagnosticsObject, n: number) => (
        <fetcher.Form
          method="post"
          key={`form-${i.created_at}`}
          className="contact-form"
        >
          <label>
            Realizado por: {i.created_by} - {timeToDate(parseInt(i.created_at))}{" "}
          </label>
          <input
            type="text"
            name={`note`}
            defaultValue={i.note}
            id={`note_input_element_id-${i.created_at}`}
            disabled={true}
          />

          <input hidden name="note_id" value={i.created_at} readOnly></input>
          <p>
            <button
              onClick={onEditInput}
              id={`button_note_edit-${i.created_at}`}
            >
              Editar
            </button>
            <button
              name="button"
              value="update-note"
              id={`button_note_ok-${i.created_at}`}
              hidden
            >
              Ok
            </button>
            <button
              name="button"
              value="remove-note"
              id={`button_note_remove-${i.created_at}`}
              hidden
            >
              x
            </button>
          </p>
        </fetcher.Form>
      ))}

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
