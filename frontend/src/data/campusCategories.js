export const campusCategorySections = [
  {
    title: 'Trending',
    items: [
      {
        label: 'All Books',
        description: 'Open the full marketplace catalog',
        to: '/feed',
        query: {},
      },
      {
        label: 'Engineering Books',
        description: 'Core technical and engineering texts',
        to: '/feed',
        query: { genre: 'Engineering' },
      },
      {
        label: 'Science Books',
        description: 'Physics, chemistry, and biology',
        to: '/feed',
        query: { genre: 'Science' },
      },
      {
        label: 'Commerce Books',
        description: 'Accounts, economics, and finance',
        to: '/feed',
        query: { genre: 'Commerce' },
      },
      {
        label: 'Arts Books',
        description: 'Humanities, language, and general studies',
        to: '/feed',
        query: { genre: 'Arts' },
      },
    ],
  },
  {
    title: 'College Material',
    items: [
      {
        label: 'Notes & Lectures',
        description: 'Class notes and handwritten study material',
        to: '/feed',
        query: { collection: 'notes' },
      },
      {
        label: 'Engineering Material',
        description: 'Subject references for engineering students',
        to: '/feed',
        query: { collection: 'engineering-materials' },
      },
      {
        label: 'Lab Records & Assignments',
        description: 'Practical files, journals, and submissions',
        to: '/feed',
        query: { collection: 'lab-records' },
      },
      {
        label: 'PYQs & Question Papers',
        description: 'Previous year papers and practice sets',
        to: '/feed',
        query: { collection: 'pyqs' },
      },
    ],
  },
];
