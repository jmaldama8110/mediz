export function calculateAge(birth: Date, current: Date) {
    // Parse the input dates to obtain Date objects

    // Calculate the difference in milliseconds
    const difference = current.getTime() - birth.getTime();
    // Convert milliseconds to years
    const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;
    const ageInYears = difference / millisecondsInYear;
    // Round down to the nearest whole number
    const roundedAge = Math.floor(ageInYears);

    return roundedAge;
}
export function getAge(dob: string) {
    const dateArray = dob.split("-");
    let age = 0;
    if (dateArray.length === 3) {
      const newDate = new Date(
        `${dateArray[2]}-${dateArray[1]}-${dateArray[0]}`
      );
      age = calculateAge(newDate, new Date());
    }
    return age;
  }