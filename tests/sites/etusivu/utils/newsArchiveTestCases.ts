type TestCases = TestCase[];

/**
 * Test case interface.
 *
 * NAME: Test case name.
 * TEXT_FILTER: Text filter.
 * TOPICS: Topics select-filter.
 * CITY_DISTRICTS: City districts select-filter.
 * TARGET_GROUPS: Target groups select-filter.
 */
interface TestCase {
  NAME: string;
  TEXT_FILTER: string | null;
  TOPICS: string[] | null;
  CITY_DISTRICTS: string[] | null;
  TARGET_GROUPS: string[] | null;
}


const testCases: TestCases = [
  {
    NAME: 'should have functional text filter',
    TEXT_FILTER: 'Helsinki',
    TOPICS: null,
    CITY_DISTRICTS: null,
    TARGET_GROUPS: null,
  },
  {
    NAME: 'should have functional topics filter',
    TEXT_FILTER: null,
    TOPICS: ['Sosiaali- ja terveyspalvelut', 'Kaupunkiympäristö ja liikenne'],
    CITY_DISTRICTS: null,
    TARGET_GROUPS: null,
  },
  {
    NAME: 'should have functional city districts filter',
    TEXT_FILTER: null,
    TOPICS: null,
    CITY_DISTRICTS: ['Keskusta', 'Pasila'],
    TARGET_GROUPS: null,
  },
  {
    NAME: 'should have functional target groups filter',
    TEXT_FILTER: null,
    TOPICS: null,
    CITY_DISTRICTS: null,
    TARGET_GROUPS: ['Lapsiperheet', 'Seniorit'],
  },
];

export { type TestCase, testCases };