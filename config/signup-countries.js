/**
 * =============================================================================
 * 가입 시 선택 가능한 나라 목록 (ISO 3166-1 alpha-2)
 * =============================================================================
 * - 이름은 `i18n-iso-countries` 패키지에서 한국어·영어를 가져옵니다.
 * - 코드는 항상 대문자 2글자 (예: KR, US, JP).
 * =============================================================================
 */

'use strict';

const countries = require('i18n-iso-countries');

countries.registerLocale(require('i18n-iso-countries/langs/ko.json'));
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

function buildSignupCountries() {
  const alpha2 = Object.keys(countries.getAlpha2Codes());
  const list = alpha2.map((code) => {
    const displayNameKo = countries.getName(code, 'ko') || countries.getName(code, 'en') || code;
    const displayNameEn = countries.getName(code, 'en') || code;
    return Object.freeze({
      code,
      displayNameKo,
      displayNameEn,
    });
  });
  list.sort((a, b) => a.code.localeCompare(b.code));
  return Object.freeze(list);
}

/** @readonly */
const SIGNUP_COUNTRIES = buildSignupCountries();

const SIGNUP_COUNTRY_CODES = Object.freeze(SIGNUP_COUNTRIES.map((c) => c.code));

/** @type {ReadonlySet<string>} */
const CODE_SET = new Set(SIGNUP_COUNTRY_CODES);

/**
 * @param {string} code
 * @returns {boolean}
 */
function isSignupCountryCode(code) {
  const u = String(code || '')
    .trim()
    .toUpperCase();
  return u.length === 2 && CODE_SET.has(u);
}

/**
 * 클라이언트(가입 화면)에 내려줄 목록 — 전체 국가
 * @returns {{ defaultCode: string, countries: ReadonlyArray<{code:string,displayNameKo:string,displayNameEn:string}> }}
 */
function getPublicSignupCountries() {
  return Object.freeze({
    defaultCode: 'KR',
    /** 총 개수(화면에서 “OO개국” 표시용) */
    count: SIGNUP_COUNTRIES.length,
    countries: SIGNUP_COUNTRIES,
  });
}

module.exports = Object.freeze({
  SIGNUP_COUNTRIES,
  SIGNUP_COUNTRY_CODES,
  isSignupCountryCode,
  getPublicSignupCountries,
});
