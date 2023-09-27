
import { CollectionType, iBaseDocument, iDocumentGetResponse, iDocumentPutResponse } from "./PouchDbModels";

export class BaseDocument implements iBaseDocument{
    
    _id: string | undefined;
    _rev?: string | undefined;
    collection_name: CollectionType;
    created_at?: number;
    created_by?: string;
    updated_at?: number;
    updated_by?: string;

    constructor(colName: CollectionType){

        this._id = undefined;
        this._rev = undefined;
        this.collection_name = colName;
        this.created_at = 0;
        this.created_by = ''
        this.updated_at = 0
        this.updated_by = ''
        
    }


    processNewDocument( response: iDocumentPutResponse ){
        if( response.ok ){
            this._id = response.id;
            this._rev = response.rev;
        }
    }

    processGetDocument( response: iDocumentGetResponse){
        this._id = response._id
        this._rev = response._rev
    }


    
}