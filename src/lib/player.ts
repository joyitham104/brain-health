const KEY = 'playerCode';
export const STAFF_CODE = '9999';

export function setPlayerCode(code: string) {
  sessionStorage.setItem(KEY, code);
}

export function getPlayerCode() {
  return sessionStorage.getItem(KEY);
}

export function isStaff(code: string) {
  return code === STAFF_CODE;
}
