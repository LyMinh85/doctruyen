import { BookStatus, BookType, BookVisibility } from '@prisma/client';

export const mockBooks = [
  {
    id: 1,
    title: "Demon Slayer: Kimetsu no Yaiba",
    author: "Koyoharu Gotouge",
    description: "In Taisho-era Japan, Tanjiro Kamado is a kindhearted boy who makes a living selling charcoal until his family is slaughtered by a demon.",
    cover_url: "https://truyenwikidich.net/photo/61e27a7b54b8082576e6037c",
    status: "ON_GOING" as BookStatus,
    visibility: "PUBLIC" as BookVisibility,
    is_vip: false,
    views_count: 25600,
    likes_count: 8900,
    words_count: 548000,
    rating: 4.8,
    reviews_count: 450,
    cost: 0,
    type: "TRANSLATED" as BookType,
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    title: "Attack on Titan",
    author: "Hajime Isayama",
    description: "In a world where humanity lives inside cities surrounded by enormous walls due to the Titans that devour humans seemingly without reason.",
    cover_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    status: "FINISHED" as BookStatus,
    visibility: "PUBLIC" as BookVisibility,
    is_vip: true,
    views_count: 32400,
    likes_count: 10500,
    words_count: 689700,
    rating: 4.9,
    reviews_count: 780,
    cost: 0,
    type: "TRANSLATED" as BookType,
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 3,
    title: "My Hero Academia",
    author: "Kohei Horikoshi",
    description: "In a world where people with superpowers known as 'Quirks' are the norm, Izuku Midoriya has dreams of one day becoming a Hero.",
    cover_url: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
    status: "ON_GOING" as BookStatus,
    visibility: "PUBLIC" as BookVisibility,
    is_vip: false,
    views_count: 18950,
    likes_count: 7600,
    words_count: 450800,
    rating: 4.7,
    reviews_count: 380,
    cost: 0,
    type: "TRANSLATED" as BookType,
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 4,
    title: "One Punch Man",
    author: "ONE",
    description: "The story of Saitama, a hero who can defeat any opponent with a single punch but seeks to find a worthy opponent.",
    cover_url: "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
    status: "ON_GOING" as BookStatus,
    visibility: "PUBLIC" as BookVisibility,
    is_vip: true,
    views_count: 21500,
    likes_count: 9200,
    words_count: 320500,
    rating: 4.8,
    reviews_count: 430,
    cost: 500,
    type: "TRANSLATED" as BookType,
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 5,
    title: "Jujutsu Kaisen",
    author: "Gege Akutami",
    description: "Yuji Itadori is a high school student who joins his school's Occult Club for fun, but discovers a cursed object.",
    cover_url: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
    status: "ON_GOING" as BookStatus,
    visibility: "PUBLIC" as BookVisibility,
    is_vip: false,
    views_count: 17800,
    likes_count: 8300,
    words_count: 298600,
    rating: 4.7,
    reviews_count: 350,
    cost: 0,
    type: "ORIGINAL" as BookType,
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 6,
    title: "Chainsaw Man",
    author: "Tatsuki Fujimoto",
    description: "Denji dreams of living a good life, but burdened by his father's debt works for the yakuza as a devil hunter.",
    cover_url: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg",
    status: "ON_GOING" as BookStatus,
    visibility: "PUBLIC" as BookVisibility,
    is_vip: true,
    views_count: 16200,
    likes_count: 7900,
    words_count: 276400,
    rating: 4.8,
    reviews_count: 320,
    cost: 400,
    type: "MACHINE_TRANSLATED" as BookType,
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 7,
    title: "Tokyo Ghoul",
    author: "Sui Ishida",
    description: "In a world where ghouls live among humans, they are the same as normal people in virtually every way—other than their craving for human flesh.",
    cover_url: "https://cdn.myanimelist.net/images/anime/5/64449.jpg",
    status: "FINISHED" as BookStatus,
    visibility: "PUBLIC" as BookVisibility,
    is_vip: false,
    views_count: 28900,
    likes_count: 9500,
    words_count: 468700,
    rating: 4.6,
    reviews_count: 620,
    cost: 0,
    type: "TRANSLATED" as BookType,
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 8,
    title: "Dragon Ball Super",
    author: "Akira Toriyama",
    description: "After defeating Majin Buu, life is peaceful once again. But, the God of Destruction, Beerus awakens to a prophecy and challenges Goku.",
    cover_url: "https://cdn.myanimelist.net/images/anime/7/74606.jpg",
    status: "ON_GOING" as BookStatus,
    visibility: "PUBLIC" as BookVisibility,
    is_vip: false,
    views_count: 31500,
    likes_count: 12200,
    words_count: 597800,
    rating: 4.5,
    reviews_count: 710,
    cost: 0,
    type: "TRANSLATED" as BookType,
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 9,
    title: "Spy x Family",
    author: "Tatsuya Endo",
    description: "A spy on an undercover mission gets married and adopts a child as part of his cover. His wife and daughter have secrets of their own.",
    cover_url: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg",
    status: "ON_GOING" as BookStatus,
    visibility: "PUBLIC" as BookVisibility,
    is_vip: false,
    views_count: 23400,
    likes_count: 11000,
    words_count: 254000,
    rating: 4.9,
    reviews_count: 520,
    cost: 0,
    type: "ORIGINAL" as BookType,
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 10,
    title: "Death Note",
    author: "Tsugumi Ohba",
    description: "Light Yagami discovers a supernatural notebook that grants its user the ability to kill anyone whose name is written in it.",
    cover_url: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    status: "FINISHED" as BookStatus,
    visibility: "PUBLIC" as BookVisibility,
    is_vip: true,
    views_count: 42000,
    likes_count: 15300,
    words_count: 390000,
    rating: 4.7,
    reviews_count: 840,
    cost: 300,
    type: "TRANSLATED" as BookType,
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Different categorized book lists for the homepage
export const trendingBooks = mockBooks.sort((a, b) => b.views_count - a.views_count).slice(0, 6);
export const newReleases = [...mockBooks].sort((a, b) => 
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
).slice(0, 6);
export const popularBooks = [...mockBooks].sort((a, b) => b.likes_count - a.likes_count).slice(0, 6);
export const editorPicks = [mockBooks[1], mockBooks[4], mockBooks[8], mockBooks[2], mockBooks[9], mockBooks[6]];
export const freeBooks = mockBooks.filter(book => !book.is_vip).slice(0, 6);
export const vipBooks = mockBooks.filter(book => book.is_vip).slice(0, 6);
