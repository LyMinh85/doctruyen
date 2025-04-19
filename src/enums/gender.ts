export enum Gender {
  Male = "MALE",
  Female = "FEMALE",
  Secrecy = "SECRECY",
}

const genderLabels: Record<Gender, Record<string, string>> = {
  [Gender.Male]: {
    vi: "Nam",
    en: "Male",
    jp: "男性",
  },
  [Gender.Female]: {
    vi: "Nữ",
    en: "Female",
    jp: "女性",
  },
  [Gender.Secrecy]: {
    vi: "Bí mật",
    en: "Secrecy",
    jp: "秘密",
  },
};

export const getGenderLabel = (
  gender: Gender | "MALE" | "FEMALE" | "SECRECY",
  lang: string = "vi"
): string => {
  return genderLabels[gender]?.[lang] || gender; // Nếu không có thì trả về raw data
};
