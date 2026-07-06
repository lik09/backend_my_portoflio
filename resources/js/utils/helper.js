import dayjs from "dayjs";


export const formatDateClient = (date , format = "DD/MM/YYYY") =>{
    return dayjs(date).format(format);
}

export const formatDateServer = (date , format = "YYYY-MM-DD") =>{
    return dayjs(date).format(format);
}

export const getLocalizedField = (record, field, lang) => {
    if (!record) return undefined;
    const enValue = record[field];
    if (lang !== 'km') return enValue;

    const khValue = record[`${field}_kh`];
    const isEmpty =
        khValue === null ||
        khValue === undefined ||
        khValue === '' ||
        (Array.isArray(khValue) && khValue.length === 0);

    return isEmpty ? enValue : khValue;
}
