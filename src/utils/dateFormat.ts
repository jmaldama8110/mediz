export function validateDateString(dateString:string){
    const dateRE = new RegExp(/^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/)
    return dateString.match(dateRE);
}

export function validateDateInFuture (dateString: string){
    // date string format DD-MM-YYYY
    const dateStr = dateString.split("-");

    /// not valid dateStr string
    if( dateStr.length != 3 || !dateStr)
        return false;

    const newDate = new Date( `${dateStr[2]}-${dateStr[1]}-${dateStr[0]}`)
    const currentDate = new Date();
    
    return ( currentDate.getTime() > newDate.getTime() )
    
}
export function timeToDate( timeT: number){    
    const event = new Date(timeT);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour:'numeric',minute:'numeric' };

    return event.toLocaleDateString('es-MX', options);
// Expected output (varies according to local timezone): Donnerstag, 20. Dezember 2012
}