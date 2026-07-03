type TestCases = TestCase[];

/**
 * Child details interface.
 *
 * DAYCARE_TYPE (Varhaiskasvatuksen muoto):
 * 1. Varhaiskasvatus arkipäivisin
 * 2. 5-vuotiaiden varhaiskasvatus arkipäivisin
 * 3. Esiopetus ja varhaiskasvatus arkipäivisin
 * 4. Vuorohoito (hoitoa myös iltaisin ja viikonloppuisin)
 *
 * DAYCARE_CARE_TIME (Hoitotunnit):
 * DAYCARE_TYPE 1:
 * 1. Yli 7 tuntia päivässä
 * 2. 5–7 tuntia päivässä
 * 3. Enintään 5 tuntia päivässä
 *
 * DAYCARE_TYPE 2:
 * 1. Yli 7 tuntia päivässä
 * 2. 5–7 tuntia päivässä
 * 3. 4–5 tuntia päivässä
 * 4. Enintään 4 tuntia päivässä (maksuton)
 *
 * DAYCARE_TYPE 3:
 * 1. Yli 7 tuntia päivässä
 * 2. 7–8 tuntia päivässä (enintään 8 tuntia)
 * 3. 5–7 tuntia päivässä
 * 4. Enintään 5 tuntia päivässä
 *
 * DAYCARE_TYPE 4:
 * 1. 161 tuntia tai enemmän kuukaudessa
 * 2. 101–160 tuntia kuukaudessa
 * 3. 61–100 tuntia kuukaudessa
 *
 * Extra on DAYCARE_TYPE 4: Lapsi on esiopetuksessa tai 5-vuotiaiden varhaiskasvatuksessa
 *
 * DAYCARE_FREE_DAYS (Säännöllisiä vapaapäiviä kuukaudessa)
 */
interface ChildDetails {
  DAYCARE_TYPE: number;
  DAYCARE_CARE_TIME: number;
  DAYCARE_FREE_DAYS: number | string;
  DAYCARE_TYPE_4_EXTRA?: boolean;
}

/**
 * Test case interface.
 *
 * NAME: Test case name.
 * HOUSEHOLD_SIZE (Perheen koko)
 * INCOME (Perheen bruttotulot kuukaudessa)
 * CHILDREN (Nuorin lapsi, seuraavaksi nuorin lapsi, ...)
 * PAYMENT: The expected payment in euros.
 */
interface TestCase {
  NAME: string;
  HOUSEHOLD_SIZE: string;
  INCOME: string;
  CHILDREN: {
    [key: number]: ChildDetails;
  };
  PAYMENT: string;
}

const testCases: TestCases = [
  /**
   * 1. Household size 2: income below / over minimum.
   **/
  {
    NAME: 'Household size 2, 1 child, income 2770 (below min)',
    HOUSEHOLD_SIZE: '2',
    INCOME: '2770',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 5 },
    },
    PAYMENT: '0',
  },
  {
    NAME: 'Household size 2, 1 child, income 4000 (calc < minimum payment)',
    HOUSEHOLD_SIZE: '2',
    INCOME: '4000',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: '5' },
    },
    PAYMENT: '0',
  },
  {
    NAME: 'Household size 2, 1 child, income just above minimum → payment ≥ 32',
    HOUSEHOLD_SIZE: '2',
    INCOME: '4664',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '32',
  },

  /**
   * 2. Family sizes 4–8
   **/
  {
    NAME: 'Household size 4, below min',
    HOUSEHOLD_SIZE: '4',
    INCOME: '5500',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
      2: { DAYCARE_TYPE: 2, DAYCARE_CARE_TIME: 4, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '0',
  },
  {
    NAME: 'Household size 4, above min, normal payment',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7000',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
      2: { DAYCARE_TYPE: 2, DAYCARE_CARE_TIME: 4, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '64',
  },
  {
    NAME: 'Household size 8, below computed min threshold',
    HOUSEHOLD_SIZE: '8',
    INCOME: '7500',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
      2: { DAYCARE_TYPE: 2, DAYCARE_CARE_TIME: 4, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '0',
  },
  {
    NAME: 'Household size 8, above computed min threshold',
    HOUSEHOLD_SIZE: '8',
    INCOME: '8809',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
      2: { DAYCARE_TYPE: 2, DAYCARE_CARE_TIME: 4, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '0',
  },

  /**
   * 3. Max charge cap test.
   **/
  {
    NAME: 'Household size 2, high income → capped at 335',
    HOUSEHOLD_SIZE: '2',
    INCOME: '8000',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '335',
  },

  /**
   * 4. Sibling discounts (1st 100%, 2nd 40%, 3rd 20%).
   */
  {
    NAME: 'Household size 4, 3 children, sibling discounts',
    HOUSEHOLD_SIZE: '4',
    INCOME: '10000',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
      2: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
      3: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '536',
  },

  /**
   * 5. Daycare type & care time discounts
   **/
  {
    NAME: 'Daycare type 1 over 7h (100%)',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7000',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '64',
  },
  {
    NAME: 'Daycare type 1 5-7h (80%)',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7000',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 2, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '51',
  },
  {
    NAME: 'Daycare type 1 ≤5h (60%)',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7000',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 3, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '39',
  },
  {
    NAME: 'Daycare type 2 (5yo), ≤4h (0%)',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7000',
    CHILDREN: {
      1: { DAYCARE_TYPE: 2, DAYCARE_CARE_TIME: 4, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '0',
  },
  {
    NAME: 'Daycare type 3 (6yo), 7-8h (60%)',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7000',
    CHILDREN: {
      1: { DAYCARE_TYPE: 3, DAYCARE_CARE_TIME: 2, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '39',
  },
  {
    NAME: 'Daycare type 4, 161h+ per month, no preschool flag (100%)',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7000',
    CHILDREN: {
      1: {
        DAYCARE_TYPE: 4,
        DAYCARE_CARE_TIME: 1,
        DAYCARE_FREE_DAYS: 0,
        DAYCARE_TYPE_4_EXTRA: false,
      },
    },
    PAYMENT: '64',
  },
  {
    NAME: 'Daycare type 4, 101-160h per month, no preschool flag (80%)',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7000',
    CHILDREN: {
      1: {
        DAYCARE_TYPE: 4,
        DAYCARE_CARE_TIME: 2,
        DAYCARE_FREE_DAYS: 0,
        DAYCARE_TYPE_4_EXTRA: false,
      },
    },
    PAYMENT: '51',
  },
  {
    NAME: 'Daycare type 4, 61-100h per month (60%)',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7000',
    CHILDREN: {
      1: {
        DAYCARE_TYPE: 4,
        DAYCARE_CARE_TIME: 3,
        DAYCARE_FREE_DAYS: 0,
        DAYCARE_TYPE_4_EXTRA: false,
      },
    },
    PAYMENT: '39',
  },
  {
    NAME: 'Daycare type 4 with extra preschool flag (65% charge)',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7000',
    CHILDREN: {
      1: {
        DAYCARE_TYPE: 4,
        DAYCARE_CARE_TIME: 1,
        DAYCARE_FREE_DAYS: 0,
        DAYCARE_TYPE_4_EXTRA: true,
      },
    },
    PAYMENT: '42',
  },

  /**
   * 6. Free day discount
   **/
  {
    NAME: '3 children, no free days',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7871',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
      2: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
      3: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 0 },
    },
    PAYMENT: '253',
  },
  {
    NAME: '3 children, 4,6,8 free days',
    HOUSEHOLD_SIZE: '4',
    INCOME: '7871',
    CHILDREN: {
      1: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 4 },
      2: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 6 },
      3: { DAYCARE_TYPE: 1, DAYCARE_CARE_TIME: 1, DAYCARE_FREE_DAYS: 8 },
    },
    PAYMENT: '180',
  },
];

export { type ChildDetails, type TestCase, testCases };
