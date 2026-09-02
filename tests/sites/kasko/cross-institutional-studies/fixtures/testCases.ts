import { DEFAULT_LANGUAGES, type Langcode } from '../../../../common/types/languagesType';

type TestCases = TestCase[];

/**
 * Test case interface.
 *
 * NAME: Test case name.
 * SEARCH_WORD: Search word for the search filter.
 * START_TIME: Start time select option index.
 * LEARNING_MODE: Mode of learning select option index.
 * INSTRUCTION_LANGUAGE: Language of instruction option label.
 */
interface TestCase {
  NAME: string;
  SEARCH_WORD: string | null;
  START_TIME: number | null;
  LEARNING_MODE: number | null;
  INSTRUCTION_LANGUAGE: string | null;
}

/**
 * Language interface.
 *
 * CODE: Language code.
 * SEARCH_PATH: Path of the search page.
 * COURSE_PATH: Path prefix of a single course page.
 */
interface Language {
  CODE: Langcode;
  SEARCH_PATH: string;
  COURSE_PATH: string;
}

const searchPaths: Record<Langcode, string> = {
  fi: '/fi/kasvatus-ja-koulutus/ristiinopiskeluhaku',
  sv: '/sv/fostran-och-utbildning/korsstudiersok',
  en: '/en/childhood-and-education/cross-institutional-studies-search',
};

const coursePaths: Record<Langcode, string> = {
  fi: '/fi/kasvatus-ja-koulutus/ristiinopiskelu',
  sv: '/sv/fostran-och-utbildning/korsstudier',
  en: '/en/childhood-and-education/cross-institutional-studies',
};

const languages: Language[] = DEFAULT_LANGUAGES.map((code: Langcode) => ({
  CODE: code,
  SEARCH_PATH: searchPaths[code],
  COURSE_PATH: coursePaths[code],
}));

const testCases: TestCases = [
  {
    NAME: 'There should be results without any filters',
    SEARCH_WORD: null,
    START_TIME: null,
    LEARNING_MODE: null,
    INSTRUCTION_LANGUAGE: null,
  },
  {
    NAME: 'Search word filter',
    SEARCH_WORD: 'biologia',
    START_TIME: null,
    LEARNING_MODE: null,
    INSTRUCTION_LANGUAGE: null,
  },
  {
    NAME: 'Start time filter',
    SEARCH_WORD: null,
    START_TIME: 0,
    LEARNING_MODE: null,
    INSTRUCTION_LANGUAGE: null,
  },
  {
    NAME: 'Mode of learning filter',
    SEARCH_WORD: null,
    START_TIME: null,
    LEARNING_MODE: 0,
    INSTRUCTION_LANGUAGE: null,
  },
  {
    NAME: 'Language of instruction filter',
    SEARCH_WORD: null,
    START_TIME: null,
    LEARNING_MODE: null,
    INSTRUCTION_LANGUAGE: 'Suomi',
  },
  {
    NAME: 'Multiple filters',
    SEARCH_WORD: 'biologia',
    START_TIME: null,
    LEARNING_MODE: 0,
    INSTRUCTION_LANGUAGE: 'Suomi',
  },
];

export { type Language, type TestCase, languages, testCases };
