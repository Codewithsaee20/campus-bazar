export const campusCategorySections = [
  {
    title: 'Trending',
    items: [
      {
        label: 'All Listings',
        description: 'Open the full marketplace catalog',
        to: '/feed',
        query: {},
      },
      {
        label: 'Books',
        description: 'Core technical and engineering texts',
        to: '/feed',
        query: { genre: 'Books' },
      },
      {
        label: 'Notes',
        description: 'Class notes and handwritten study material',
        to: '/feed',
        query: { genre: 'Notes' },
      },
      {
        label: 'Stationery',
        description: 'Drafters, geometry boxes, lab coats, and supplies',
        to: '/feed',
        query: { genre: 'Stationery' },
      },
    ],
  },
  // PYQs & Question Papers — planned for a later release, not live yet.
  // {
  //   title: 'College Material',
  //   items: [
  //     {
  //       label: 'PYQs & Question Papers',
  //       description: 'Previous year papers and practice sets',
  //       to: '/feed',
  //       query: { collection: 'pyqs' },
  //     },
  //   ],
  // },
];
