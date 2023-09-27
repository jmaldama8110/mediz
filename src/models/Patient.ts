import { db } from "../db/couchdb";
import { BaseDocument } from "./BaseModel";
import { iDocumentGetResponse } from "./PouchDbModels";


export type DiagnosticsObject = {
    created_at: string;
    note: string;
    created_by: string;
}

export class PatientDocument extends BaseDocument {

    name: string;
    lastname: string;
    second_lastname: string;
    rec_no: number;
    gender: "M" | "F" | "";
    dob: string;
    address: string;
    phone: string;
    service: string;
    blood_type: string;
    relative: string;
    diagnostic: DiagnosticsObject[];

    highlight: boolean;
    status: "Active" | "Inactive"

    constructor() {
        super('PATIENT')
        this.name = '';
        this.lastname  = '';
        this.second_lastname = '';
        this.rec_no = 0;
        this.gender = '';
        this.dob = '';
        this.address = '';
        this.phone = '';
        this.service = '';
        this.blood_type = '';
        this.relative = '';
        this.diagnostic = [];
        this.highlight = false;
        this.status = 'Active'

    }

    processPatientGetDocument(response: any): void {
        super.processGetDocument(response as iDocumentGetResponse);

        this.name = response.name;
        this.lastname = response.lastname;
        this.second_lastname = response.second_lastname;
        this.rec_no = response.rec_no;
        this.gender = response.gender;
        this.dob = response.dob;
        this.address = response.address;
        this.phone = response.phone;
        this.service = response.service;
        this.blood_type = response.blood_type;
        this.relative = response.relative;
        this.diagnostic = response.diagnostic;
        this.highlight = response.highlight;
        this.status = response.status;
    }

    static async getAllDocsFromType(colName:string){
        let docs: any[] = [];
            try{
                const data = await db.find({ selector: { collection_name: colName } });
                docs = data.docs.map( (i:any) => ({ 
                    _id: i._id,
                    _rev: i._rev,
                    name: i.name,
                    lastname: i.lastname,
                    second_lastname: i.second_lastname,
                    rec_no: i.rec_no,
                    gender: i.gender,
                    dob: i.dob,
                    address: i.address,
                    phone: i.phone,
                    service: i.service,
                    blood_type: i.blood_type,
                    relative: i.relative,
                    diagnostic: i.diagnostic,
                    highlight: i.highlight,
                    status: i.status
                })).filter( (i:any) => i.status === 'Active')
            }
            catch(e){
                console.log(e);
            }
        return docs;
    }

}