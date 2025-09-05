// client/src/utils/loyeStorage.js

const KEY = 'loye.unitCode';

export const getUnitCode = () => localStorage.getItem(KEY);

export const setUnitCode = (code) => {
  if (code) localStorage.setItem(KEY, code);
};

export const clearUnitCode = () => localStorage.removeItem(KEY);
