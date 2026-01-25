export type Degree = "Licenciatura" | "Maestría" | "Doctorado" | "Especialidad";
export type Gender = "Masculino" | "Femenino" | "Otro";

export const getDegreeAbbreviation = (degree: string, gender: string): string => {
  const normalizedDegree = degree.toLowerCase();
  const normalizedGender = gender.toLowerCase();

  switch (normalizedDegree) {
    case "licenciatura":
      return normalizedGender === "femenino" ? "Lic." : "Lic.";
    case "maestría":
    case "maestria":
      return normalizedGender === "femenino" ? "Mtra." : "Mtro.";
    case "doctorado":
      return normalizedGender === "femenino" ? "Dra." : "Dr.";
    case "especialidad":
        return normalizedGender === "femenino" ? "Esp." : "Esp.";
    default:
      return "";
  }
};
