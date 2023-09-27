import { redirect } from "react-router-dom";
import { PatientDocument } from "../../models/Patient";
import { db, remoteDB } from "../../db/couchdb";

export async function action ({ params }:any){
    const patientDoc = new PatientDocument();
    const getResp = await db.get(params.patientId);
    patientDoc.processGetDocument(getResp);
    await db.put( {...getResp, status: 'Inactive'})
    await db.replicate.to(remoteDB);

    return redirect('/patients');
}